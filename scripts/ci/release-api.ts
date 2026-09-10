import { spawnSync } from "bun";
import { executeDelivery } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";
import { requireEdgeReady } from "./edge-readiness";
import { requireReleaseChecks } from "./release-checks";
import { createVercelRuntime } from "./vercel-runtime";

const SHA = /^[a-f0-9]{40}$/;

export function apiChanged(base: string | null, sha: string) {
  if (!base) {
    return true;
  }
  if (
    !(SHA.test(base) && SHA.test(sha)) ||
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha]).exitCode !== 0
  ) {
    throw new Error("API 성공 커밋보다 이전 버전은 배포하지 않습니다.");
  }
  const diff = spawnSync([
    "git",
    "diff",
    "--quiet",
    base,
    sha,
    "--",
    "apps/api",
    "packages",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "turbo.json",
    ":(exclude)**/README.md",
  ]);
  if (diff.exitCode !== 0 && diff.exitCode !== 1) {
    throw new Error("API 변경 확인 실패");
  }
  return diff.exitCode === 1;
}

export function requireApiDatabase(base: string | null, sha: string) {
  if (!(base && SHA.test(base) && SHA.test(sha))) {
    throw new Error("DB 성공 기록이 필요합니다.");
  }
  if (
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha]).exitCode !==
      0 ||
    spawnSync([
      "git",
      "diff",
      "--quiet",
      base,
      sha,
      "--",
      "supabase/migrations",
    ]).exitCode !== 0
  ) {
    throw new Error("이 커밋의 DB 변경을 먼저 배포해야 합니다.");
  }
}

export function apiReleaseEnvironment() {
  const {
    GITHUB_SHA: sha,
    GH_TOKEN: token,
    VERCEL_TOKEN: vercelToken,
  } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !token ||
    !vercelToken
  ) {
    throw new Error("Flyn main의 GitHub 실행에서만 API를 배포합니다.");
  }
  return { sha, token, vercelToken };
}

if (import.meta.main) {
  const { sha, token, vercelToken } = apiReleaseEnvironment();
  if (
    spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim() !== sha ||
    spawnSync(["git", "status", "--porcelain"]).stdout.toString().trim()
  ) {
    throw new Error("API 체크아웃이 배포 커밋과 다릅니다.");
  }
  await requireReleaseChecks(sha, token);
  const journal = new GitHubDeliveryJournal(token);
  const snapshot = await journal.read();
  requireApiDatabase(snapshot.state.success.database, sha);
  requireEdgeReady(snapshot.state.success.edge, sha);
  if (
    snapshot.state.pending &&
    (snapshot.state.pending.service !== "api" ||
      snapshot.state.pending.sha !== sha)
  ) {
    if (
      snapshot.state.pending.service === "mobile" &&
      snapshot.state.pending.sha === sha &&
      !apiChanged(snapshot.state.success.api, sha)
    ) {
      console.log(
        "API 변경 없음. 기존 모바일 배포는 다음 단계에서 확인합니다."
      );
      process.exit(0);
    }
    throw new Error("기존 서비스 배포를 먼저 확인해야 합니다.");
  }
  const runtime = createVercelRuntime(vercelToken);
  await executeDelivery(sha, {
    journal,
    plan: async (state) => {
      if (!apiChanged(state.success.api, sha)) {
        return [];
      }
      await runtime.prepare();
      return ["api"];
    },
    remote: runtime.delivery,
  });
  console.log(
    `API 단계 확인 완료: ${sha}. 다음 단계에서 EAS 배포를 확인합니다.`
  );
}
