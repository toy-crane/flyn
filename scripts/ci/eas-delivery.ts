import { sleep } from "bun";
import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const SHA = /^[a-f0-9]{40}$/;
interface Job {
  buildId?: string;
  key: string;
  outputs?: Record<string, string>;
  status: string;
  submissionId?: string;
}
interface Run {
  gitCommitHash: string;
  id: string;
  jobs: Job[];
  status: string;
}
interface Options {
  listRuns: () => Promise<
    { id: string; gitCommitHash: string; workflowFileName: string }[]
  >;
  maxPolls?: number;
  origin?: string;
  pollMilliseconds?: number;
  token: string;
}

export class EasDelivery {
  private readonly options: Options;
  constructor(options: Options) {
    this.options = options;
  }

  private async api(path: string, body?: unknown) {
    const response = await fetch(
      `${this.options.origin ?? "https://api.expo.dev"}/v2/workflows/${path}`,
      {
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          "Content-Type": "application/json",
        },
        method: body ? "POST" : "GET",
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!response.ok) {
      throw new Error(
        `EAS workflow 요청 실패 (${response.status}). 기존 실행을 조회해야 합니다.`
      );
    }
    const result = (await response.json()) as { data: unknown };
    if (!result.data) {
      throw new Error("EAS workflow 응답이 불완전합니다.");
    }
    return result.data;
  }

  private validate(request: DeliveryRequest) {
    if (
      request.service !== "mobile" ||
      !SHA.test(request.sha) ||
      !UUID.test(request.requestId) ||
      (request.remoteId && !UUID.test(request.remoteId))
    ) {
      throw new Error("EAS 배포 요청이 올바르지 않습니다.");
    }
  }

  async start(request: DeliveryRequest): Promise<DeliveryObservation> {
    this.validate(request);
    if (request.remoteId) {
      throw new Error("기존 EAS 실행은 조회해야 합니다.");
    }
    const result = (await this.api("dispatch", {
      appId: "7d2f7888-8fc8-4ecb-b430-9fee421c68cc",
      fileName: "internal.yml",
      gitRef: request.sha,
      inputs: { release_sha: request.sha, request_id: request.requestId },
    })) as { id: string };
    if (!UUID.test(result.id)) {
      throw new Error("EAS 실행 ID를 확인하지 못했습니다.");
    }
    console.log(`EAS workflow: ${result.id}`);
    return { remoteId: result.id, status: "pending" };
  }

  wait(request: DeliveryRequest) {
    return this.inspect(request);
  }

  private async run(id: string, request: DeliveryRequest) {
    const run = (await this.api(`runs/${id}`)) as Run;
    if (
      run.id !== id ||
      run.gitCommitHash !== request.sha ||
      !Array.isArray(run.jobs)
    ) {
      throw new Error("EAS 실행이 배포 커밋과 다릅니다.");
    }
    return run;
  }

  private identity(run: Run, request: DeliveryRequest) {
    const jobs = run.jobs.filter((item) => item.key === "identity");
    const [job] = jobs;
    return (
      jobs.length === 1 &&
      job?.status === "success" &&
      job.outputs?.request_id === request.requestId &&
      job.outputs.release_sha === request.sha
    );
  }

  private async find(request: DeliveryRequest) {
    if (request.remoteId) {
      return request.remoteId;
    }
    const candidates = await this.options.listRuns();
    if (!Array.isArray(candidates)) {
      throw new Error("EAS 실행 목록이 불완전합니다.");
    }
    const matches: string[] = [];
    for (const candidate of candidates.filter(
      (item) =>
        item.gitCommitHash === request.sha &&
        item.workflowFileName === "internal.yml"
    )) {
      if (!UUID.test(candidate.id)) {
        throw new Error("EAS 실행 ID가 올바르지 않습니다.");
      }
      // biome-ignore lint/performance/noAwaitInLoops: 같은 요청의 실행을 순서대로 확인한다.
      if (this.identity(await this.run(candidate.id, request), request)) {
        matches.push(candidate.id);
      }
    }
    if (matches.length > 1) {
      throw new Error("같은 EAS 요청의 실행이 여러 개입니다.");
    }
    return matches[0] ?? null;
  }

  private requireResult(run: Run, request: DeliveryRequest) {
    const succeeded = (key: string) =>
      run.jobs.find((job) => job.key === key && job.status === "success");
    const build = succeeded("build_ios");
    const submit = succeeded("submit_ios");
    const update = succeeded("update_ios");
    const existing = succeeded("check_existing")?.outputs?.action;
    const built = Boolean(
      build?.buildId && submit?.submissionId && succeeded("verify_new")
    );
    const updated = Boolean(
      existing === "update" &&
        succeeded("get_build")?.outputs?.build_id &&
        update?.outputs?.first_update_group_id
    );
    const submitted = Boolean(
      existing === "submit" &&
        succeeded("get_build")?.outputs?.build_id &&
        succeeded("submit_existing")?.submissionId &&
        succeeded("verify_submitted") &&
        succeeded("update_submitted")?.outputs?.first_update_group_id
    );
    if (
      !this.identity(run, request) ||
      [built, updated, submitted].filter(Boolean).length !== 1
    ) {
      throw new Error(
        "EAS 완료 결과에서 빌드 제출 또는 Update 증거를 확인하지 못했습니다."
      );
    }
  }

  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    this.validate(request);
    const id = await this.find(request);
    if (!id) {
      return { remoteId: null, status: "pending" };
    }
    for (
      let attempt = 0;
      attempt < (this.options.maxPolls ?? 180);
      attempt += 1
    ) {
      // biome-ignore lint/performance/noAwaitInLoops: 원격 실행의 실제 완료를 기다린다.
      const run = await this.run(id, request);
      if (["failure", "canceled"].includes(run.status)) {
        return { remoteId: id, status: "failure" };
      }
      if (run.status === "success") {
        this.requireResult(run, request);
        return { remoteId: id, status: "success" };
      }
      if (run.status === "action-required") {
        return { remoteId: id, status: "pending" };
      }
      console.log(`EAS ${id}: ${run.status}`);
      if (attempt + 1 < (this.options.maxPolls ?? 180)) {
        await sleep(this.options.pollMilliseconds ?? 30_000);
      }
    }
    return { remoteId: id, status: "pending" };
  }
}
