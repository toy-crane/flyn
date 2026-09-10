import { sleep } from "bun";

const SHA = /^[a-f0-9]{40}$/;
const required = ["Required validation", "Required database validation"];

interface PollOptions {
  maxPolls?: number;
  pollMilliseconds?: number;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function requireReleaseChecks(
  sha: string,
  token: string,
  apiUrl = "https://api.github.com",
  options: PollOptions = {}
) {
  if (!(SHA.test(sha) && token)) {
    throw new Error("배포 SHA와 인증이 필요합니다.");
  }
  const maxPolls = options.maxPolls ?? 60;
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: 같은 SHA의 검사가 생기고 끝날 때까지 순서대로 확인한다.
    const states = await Promise.all(
      required.map(async (name) => {
        const url = `${apiUrl}/repos/toy-crane/flyn/commits/${sha}/check-runs?app_id=15368&filter=latest&per_page=100&check_name=${encodeURIComponent(name)}`;
        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2026-03-10",
          },
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
          throw new Error(`필수 검사 조회 실패 (${response.status})`);
        }
        const result = await response.json();
        if (
          !(record(result) && Array.isArray(result.check_runs)) ||
          result.total_count !== result.check_runs.length ||
          result.check_runs.length >= 100
        ) {
          throw new Error(`필수 검사 결과가 불완전합니다: ${name}`);
        }
        if (result.check_runs.length === 0) {
          return "pending";
        }
        if (
          result.check_runs.some(
            (run: unknown) =>
              !record(run) ||
              run.name !== name ||
              run.head_sha !== sha ||
              !record(run.app) ||
              run.app.id !== 15_368
          )
        ) {
          throw new Error(`필수 검사 결과가 불완전합니다: ${name}`);
        }
        if (
          result.check_runs.some(
            (run: unknown) =>
              record(run) &&
              run.status === "completed" &&
              run.conclusion !== "success"
          )
        ) {
          throw new Error(`같은 SHA의 필수 검사가 통과해야 합니다: ${name}`);
        }
        return result.check_runs.every(
          (run: unknown) =>
            record(run) &&
            run.status === "completed" &&
            run.conclusion === "success"
        )
          ? "success"
          : "pending";
      })
    );
    if (states.every((state) => state === "success")) {
      return;
    }
    if (attempt + 1 < maxPolls) {
      console.log(`필수 검사를 기다립니다 (${attempt + 1}/${maxPolls}).`);
      await sleep(options.pollMilliseconds ?? 10_000);
    }
  }
  throw new Error("같은 SHA의 필수 검사 대기 시간이 지났습니다.");
}

if (import.meta.main) {
  await requireReleaseChecks(
    process.env.GITHUB_SHA ?? "",
    process.env.GH_TOKEN ?? ""
  );
  console.log("같은 SHA의 필수 검사 통과를 확인했습니다.");
}
