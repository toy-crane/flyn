import { spawnSync } from "bun";
import { deliverService } from "./delivery-execution";
import { EasDelivery } from "./eas-delivery";
import { releaseRequest } from "./release-request";
import { readEas } from "./verify-testflight";

async function requireApiReady() {
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
}

async function main() {
  const { receiptId, sha } = releaseRequest("모바일");
  const expoToken = process.env.EXPO_TOKEN;
  if (!expoToken) {
    throw new Error("모바일 배포에는 Expo 토큰이 필요합니다.");
  }
  if (
    spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim() !== sha ||
    spawnSync(["git", "status", "--porcelain"]).stdout.toString().trim()
  ) {
    throw new Error("모바일 체크아웃이 배포 커밋과 다릅니다.");
  }
  await requireApiReady();
  // EAS reports the run for this commit, so a lost response resumes it.
  const result = await deliverService(
    {
      remoteId: null,
      requestId: receiptId,
      service: "mobile",
      sha,
    },
    new EasDelivery({
      listRuns: () => readEas(["workflow:runs", "--json", "--limit", "100"]),
      token: expoToken,
    })
  );
  console.log(
    result === "already"
      ? `이 커밋의 EAS 실행이 이미 성공했습니다: ${sha}`
      : `모바일 단계 확인 완료: ${sha}`
  );
}

if (import.meta.main) {
  await main();
}
