const SHA = /^[a-f0-9]{40}$/;
const required = ["Required validation", "Required database validation"];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function requireReleaseChecks(
  sha: string,
  token: string,
  apiUrl = "https://api.github.com"
) {
  if (!(SHA.test(sha) && token)) {
    throw new Error("배포 SHA와 인증이 필요합니다.");
  }
  await Promise.all(
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
        result.check_runs.length === 0 ||
        result.check_runs.length >= 100
      ) {
        throw new Error(`필수 검사 결과가 불완전합니다: ${name}`);
      }
      if (
        result.check_runs.some(
          (run: unknown) =>
            !record(run) ||
            run.name !== name ||
            run.head_sha !== sha ||
            !record(run.app) ||
            run.app.id !== 15_368 ||
            run.status !== "completed" ||
            run.conclusion !== "success"
        )
      ) {
        throw new Error(`같은 SHA의 필수 검사가 통과해야 합니다: ${name}`);
      }
    })
  );
}

if (import.meta.main) {
  await requireReleaseChecks(
    process.env.GITHUB_SHA ?? "",
    process.env.GH_TOKEN ?? ""
  );
  console.log("같은 SHA의 필수 검사 통과를 확인했습니다.");
}
