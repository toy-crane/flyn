import { sleep } from "bun";
import {
  readEas,
  type TestFlightStatus,
  testFlightReady,
} from "./verify-testflight";

interface Build {
  expirationDate?: string;
  id?: string;
}
interface Submission {
  status?: string;
  submittedBuild?: { id?: string };
}
type Action = "build" | "submit" | "update" | "wait";

export function testFlightAction(
  status: TestFlightStatus,
  build: Build,
  submissions: Submission[],
  now = new Date()
): Action {
  if (!(build.id && build.expirationDate)) {
    return "build";
  }
  if (testFlightReady(status, build.id)) {
    return "update";
  }
  if (new Date(build.expirationDate).getTime() <= now.getTime()) {
    return "build";
  }
  const matching = submissions.filter(
    (item) => item.submittedBuild?.id === build.id
  );
  if (
    matching.some(
      (item) => item.status === "ERRORED" || item.status === "CANCELED"
    )
  ) {
    return "build";
  }
  if (matching.length > 0) {
    return "wait";
  }
  return "submit";
}

async function inspect(buildId: string) {
  const [status, build, submissions] = await Promise.all([
    readEas([
      "submit:status",
      "--platform",
      "ios",
      "--profile",
      "production",
      "--json",
      "--non-interactive",
    ]),
    readEas(["build:view", buildId, "--json"]),
    readEas([
      "submit:list",
      "--platform",
      "ios",
      "--limit",
      "50",
      "--json",
      "--non-interactive",
    ]),
  ]);
  if (!Array.isArray(submissions)) {
    throw new Error("EAS 제출 목록이 불완전합니다.");
  }
  return testFlightAction(status, build, submissions);
}

if (import.meta.main) {
  const [, , buildId] = process.argv;
  if (!(buildId && /^[a-f0-9-]{36}$/.test(buildId))) {
    throw new Error("판정할 EAS 빌드 ID가 필요합니다.");
  }
  const deadline = Date.now() + 20 * 60_000;
  let action = await inspect(buildId);
  while (action === "wait" && Date.now() < deadline) {
    // biome-ignore lint/performance/noAwaitInLoops: 기존 Apple 처리가 끝날 때까지 조회한다.
    await sleep(30_000);
    action = await inspect(buildId);
  }
  if (action === "wait") {
    throw new Error("기존 TestFlight 처리가 끝나지 않았습니다.");
  }
  process.stdout.write(action);
}
