import { executeDelivery } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";
import { edgeChanged, requireEdgeReady } from "./edge-readiness";
import { loadEdgeRuntime } from "./edge-runtime";
import { requireApiDatabase } from "./release-api";
import { requireReleaseChecks } from "./release-checks";

const SHA = /^[a-f0-9]{40}$/;

if (import.meta.main) {
  const {
    DEPLOYMENT_STATE_SIGNING_KEY: signingKey,
    GITHUB_SHA: sha,
    GH_TOKEN: token,
    SUPABASE_ACCESS_TOKEN: pat,
  } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !token ||
    !pat ||
    !signingKey
  ) {
    throw new Error("Flyn main의 GitHub 실행에서만 Edge를 배포합니다.");
  }
  await requireReleaseChecks(sha, token);
  const journal = new GitHubDeliveryJournal(token, signingKey);
  const { state } = await journal.read();
  requireApiDatabase(state.success.database, sha);
  if (state.pending && state.pending.service !== "edge") {
    if (
      state.pending.sha !== sha ||
      !["api", "mobile"].includes(state.pending.service)
    ) {
      throw new Error("기존 서비스 배포를 먼저 확인해야 합니다.");
    }
    requireEdgeReady(state.success.edge, sha);
    console.log("Edge 기준 확인 완료. 기존 후속 요청을 유지합니다.");
  } else {
    await executeDelivery(sha, {
      journal,
      plan: (current) =>
        Promise.resolve(edgeChanged(current.success.edge, sha) ? ["edge"] : []),
      remote: loadEdgeRuntime(sha),
    });
    console.log(`Edge 단계 확인 완료: ${sha}`);
  }
}
