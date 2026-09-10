import { spawnSync } from "bun";
import { deliverService } from "./delivery-execution";
import { releaseRequest } from "./release-request";
import { createVercelRuntime } from "./vercel-runtime";

const SHA = /^[a-f0-9]{40}$/;

/**
 * Compares this commit with the one Vercel currently serves. A stage that
 * already shipped is not shipped again when a later stage failed.
 */
export function apiChanged(live: string | null, sha: string) {
  if (!live) {
    return true;
  }
  if (
    !(SHA.test(live) && SHA.test(sha)) ||
    spawnSync(["git", "merge-base", "--is-ancestor", live, sha]).exitCode !== 0
  ) {
    throw new Error("운영 API 커밋보다 이전 버전은 배포하지 않습니다.");
  }
  const diff = spawnSync([
    "git",
    "diff",
    "--quiet",
    live,
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

async function main() {
  const { receiptId, sha } = releaseRequest("API");
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    throw new Error("API 배포에는 Vercel 토큰이 필요합니다.");
  }
  if (
    spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim() !== sha ||
    spawnSync(["git", "status", "--porcelain"]).stdout.toString().trim()
  ) {
    throw new Error("API 체크아웃이 배포 커밋과 다릅니다.");
  }
  const runtime = createVercelRuntime(vercelToken);
  const live = await runtime.delivery.liveCommit();
  if (live && !apiChanged(live, sha)) {
    console.log(`운영 API가 이미 같은 내용입니다: ${live.slice(0, 8)}`);
    return;
  }
  const request = {
    remoteId: null,
    requestId: receiptId,
    service: "api" as const,
    sha,
  };
  const found = await runtime.delivery.inspect(request);
  if (found.status !== "success") {
    await runtime.prepare();
  }
  const result = await deliverService(request, runtime.delivery);
  console.log(
    result === "already"
      ? `운영 API가 이미 이 커밋입니다: ${sha}`
      : `API 단계 확인 완료: ${sha}. 다음 단계에서 EAS 배포를 확인합니다.`
  );
}

if (import.meta.main) {
  await main();
}
