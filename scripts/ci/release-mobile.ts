import { spawnSync } from "bun";
import { executeDelivery } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";
import { EasDelivery } from "./eas-delivery";
import { requireEdgeReady } from "./edge-readiness";
import { apiChanged, requireApiDatabase } from "./release-api";
import { requireReleaseChecks } from "./release-checks";
import { readEas } from "./verify-testflight";

const SHA = /^[a-f0-9]{40}$/;

export function mobileChanged(base: string | null, sha: string) {
  if (!base) {
    return true;
  }
  if (
    !(SHA.test(base) && SHA.test(sha)) ||
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha]).exitCode !== 0
  ) {
    throw new Error("모바일 성공 커밋을 확인해야 합니다.");
  }
  const diff = spawnSync([
    "git",
    "diff",
    "--quiet",
    base,
    sha,
    "--",
    "apps/mobile",
    "packages",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "turbo.json",
    ":(exclude)**/README.md",
  ]);
  if (diff.exitCode !== 0 && diff.exitCode !== 1) {
    throw new Error("모바일 변경 확인 실패");
  }
  return diff.exitCode === 1;
}

if (import.meta.main) {
  const {
    GITHUB_SHA: sha,
    GH_TOKEN: token,
    EXPO_TOKEN: expoToken,
  } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !token ||
    !expoToken
  ) {
    throw new Error("Flyn main의 GitHub 실행에서만 모바일을 배포합니다.");
  }
  if (
    spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim() !== sha ||
    spawnSync(["git", "status", "--porcelain"]).stdout.toString().trim()
  ) {
    throw new Error("모바일 체크아웃이 배포 커밋과 다릅니다.");
  }
  await requireReleaseChecks(sha, token);
  const journal = new GitHubDeliveryJournal(token);
  const snapshot = await journal.read();
  requireApiDatabase(snapshot.state.success.database, sha);
  requireEdgeReady(snapshot.state.success.edge, sha);
  if (apiChanged(snapshot.state.success.api, sha)) {
    throw new Error("이 커밋의 API 변경을 먼저 배포해야 합니다.");
  }
  if (
    snapshot.state.pending &&
    (snapshot.state.pending.service !== "mobile" ||
      snapshot.state.pending.sha !== sha)
  ) {
    throw new Error("기존 서비스 배포를 먼저 확인해야 합니다.");
  }
  const [health, auth] = await Promise.all([
    fetch("https://flyn-api.vercel.app/health", {
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    }),
    fetch("https://flyn-api.vercel.app/ai/episode", {
      body: "{}",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    }),
  ]);
  if (
    health.status !== 200 ||
    auth.status !== 401 ||
    ((await health.json()) as { status?: string }).status !== "ok"
  ) {
    throw new Error("API 정상 응답과 인증 경계를 확인해야 합니다.");
  }
  await executeDelivery(sha, {
    journal,
    plan: (state) =>
      Promise.resolve(
        mobileChanged(state.success.mobile, sha) ? ["mobile"] : []
      ),
    remote: new EasDelivery({
      listRuns: () => readEas(["workflow:runs", "--json", "--limit", "100"]),
      token: expoToken,
    }),
  });
  console.log(`모바일 단계 확인 완료: ${sha}`);
}
