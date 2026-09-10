import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

export const vercelProject = "prj_nPla0LdaA37WCfo0uai0kuMBkgLC";
export const vercelTeam = "team_dinnDZJN7Ztt45FtgFkAAGad";
const domain = "flyn-api.vercel.app";
const SHA = /^[a-f0-9]{40}$/;
const DEPLOYMENT_ID = /^dpl_[a-zA-Z0-9]+$/;
const failedStates = new Set(["CANCELED", "DELETED", "ERROR"]);

interface Options {
  api: (path: string) => Promise<unknown>;
  deploy: (request: DeliveryRequest) => Promise<void>;
  probe: () => Promise<boolean>;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deploymentId(value: unknown) {
  if (typeof value !== "string" || !DEPLOYMENT_ID.test(value)) {
    throw new Error("Vercel 배포 ID가 올바르지 않습니다.");
  }
  return value;
}

export class VercelApiDelivery {
  private readonly options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  /** The commit currently served on the production domain. */
  async liveCommit(): Promise<string | null> {
    const live = await this.options.api(
      `/v13/deployments/${domain}?teamId=${vercelTeam}`
    );
    if (!record(live)) {
      throw new Error("Vercel 운영 배포를 확인하지 못했습니다.");
    }
    const sha = record(live.meta) ? live.meta.flynCommitSHA : null;
    return typeof sha === "string" && SHA.test(sha) ? sha : null;
  }

  async start(request: DeliveryRequest): Promise<DeliveryObservation> {
    if (
      request.service !== "api" ||
      !SHA.test(request.sha) ||
      !request.requestId
    ) {
      throw new Error("새 API 배포 요청이 올바르지 않습니다.");
    }
    await this.options.deploy(request);
    return this.inspect(request);
  }

  /**
   * Asks Vercel what it already has for this commit. The commit is the
   * identity, so a retry finds the earlier attempt instead of duplicating it.
   */
  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    if (
      request.service !== "api" ||
      !SHA.test(request.sha) ||
      !request.requestId
    ) {
      throw new Error("API 배포 요청이 올바르지 않습니다.");
    }
    const live = await this.options.api(
      `/v13/deployments/${domain}?teamId=${vercelTeam}`
    );
    if (!record(live)) {
      throw new Error("Vercel 운영 배포를 확인하지 못했습니다.");
    }
    if (
      record(live.meta) &&
      live.meta.flynCommitSHA === request.sha &&
      live.readyState === "READY" &&
      live.target === "production" &&
      live.projectId === vercelProject
    ) {
      const id = deploymentId(live.id);
      if (await this.options.probe()) {
        return { remoteId: id, status: "success" };
      }
      return { remoteId: id, status: "pending" };
    }
    const result = await this.options.api(
      `/v7/deployments?teamId=${vercelTeam}&projectId=${vercelProject}&target=production&limit=100`
    );
    if (!(record(result) && Array.isArray(result.deployments))) {
      throw new Error("Vercel 배포 목록이 불완전합니다.");
    }
    const matches = result.deployments.filter(
      (item: unknown) =>
        record(item) &&
        record(item.meta) &&
        item.meta.flynCommitSHA === request.sha
    );
    if (matches.length === 0) {
      return { remoteId: null, status: "pending" };
    }
    const active = matches.find(
      (item: { readyState?: unknown; state?: unknown }) =>
        !failedStates.has(String(item.readyState ?? item.state))
    );
    if (active) {
      return { remoteId: deploymentId(active.uid), status: "pending" };
    }
    return { remoteId: deploymentId(matches[0].uid), status: "failure" };
  }
}
