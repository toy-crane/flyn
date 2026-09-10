import { deliverService } from "./delivery-execution";
import { loadEdgeRuntime } from "./edge-runtime";
import { releaseRequest } from "./release-request";

async function main() {
  const { receiptId, sha } = releaseRequest("Edge");
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    throw new Error("Edge 배포에는 Supabase 접근 토큰이 필요합니다.");
  }
  const runtime = loadEdgeRuntime(sha);
  // The deployed source is compared with this checkout, so identical functions
  // are never redeployed even when the commit moved on.
  const result = await deliverService(
    {
      remoteId: null,
      requestId: receiptId,
      service: "edge",
      sha,
    },
    runtime
  );
  console.log(
    result === "already"
      ? `운영 Edge Function이 이미 이 소스와 같습니다: ${sha}`
      : `Edge 단계 확인 완료: ${sha}`
  );
}

if (import.meta.main) {
  await main();
}
