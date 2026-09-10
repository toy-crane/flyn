import { appendFileSync } from "node:fs";
import { productionReviewEnvironments } from "./production-review";
import { releaseRequest } from "./release-request";

const SHA = /^[a-f0-9]{40}$/;

function main() {
  const { sha } = releaseRequest("운영 승인 판정");
  const output = process.env.GITHUB_OUTPUT;
  const raw = process.env.BASE_SHA ?? "";
  if (!output) {
    throw new Error("운영 승인 판정 결과를 기록할 수 없습니다.");
  }
  if (raw && !SHA.test(raw)) {
    throw new Error("기준 커밋이 올바르지 않습니다.");
  }
  const environments = productionReviewEnvironments(raw || null, sha);
  appendFileSync(
    output,
    `database_environment=${environments.database}\nedge_environment=${environments.edge}\n`
  );
  console.log(
    `운영 승인 판정 완료: database=${environments.database}, edge=${environments.edge}`
  );
}

if (import.meta.main) {
  main();
}
