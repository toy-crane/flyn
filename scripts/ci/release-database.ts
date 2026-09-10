import { loadDatabaseDelivery } from "./database-delivery";
import { deliverService } from "./delivery-execution";
import { releaseRequest } from "./release-request";

async function main() {
  const { receiptId, sha } = releaseRequest("DB");
  const database = loadDatabaseDelivery({ receiptId, sha });
  const request = {
    remoteId: null,
    requestId: receiptId,
    service: "database" as const,
    sha,
  };
  // Remote migration history is the record. Nothing is written down here.
  const result = await deliverService(request, {
    inspect: (current) => database.inspect(current),
    start: (current) => database.start(current),
  });
  console.log(
    result === "already"
      ? `DB는 이미 이 커밋까지 적용되어 있습니다: ${sha}`
      : `DB 단계 확인 완료: ${sha}. API·모바일 배포 완료를 뜻하지 않습니다.`
  );
}

if (import.meta.main) {
  await main();
}
