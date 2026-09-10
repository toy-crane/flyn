import { appendFileSync } from "node:fs";
import { GitHubDeliveryJournal } from "./delivery-journal";
import { productionReviewEnvironments } from "./production-review";
import { requireReleaseChecks } from "./release-checks";

const SHA = /^[a-f0-9]{40}$/;

async function main() {
  const {
    DEPLOYMENT_STATE_SIGNING_KEY: signingKey,
    GH_TOKEN: token,
    GITHUB_OUTPUT: output,
    GITHUB_SHA: sha,
  } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !token ||
    !signingKey ||
    !output
  ) {
    throw new Error("Flyn main의 GitHub 실행에서만 운영 승인을 판정합니다.");
  }
  await requireReleaseChecks(sha, token);
  const { state } = await new GitHubDeliveryJournal(token, signingKey).read();
  if (state.pending && state.pending.sha !== sha) {
    throw new Error("이전 커밋의 배포를 먼저 확인해야 합니다.");
  }
  const environments = productionReviewEnvironments(state, sha);
  appendFileSync(
    output,
    `database_environment=${environments.database}\nedge_environment=${environments.edge}\n`
  );
  console.log(
    `운영 승인 판정 완료: database=${environments.database}, edge=${environments.edge}`
  );
}

if (import.meta.main) {
  await main();
}
