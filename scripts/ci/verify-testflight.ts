import { sleep, spawn } from "bun";

interface TestFlightStatus {
  ios?: {
    ascAppIdentifier?: string;
    testFlightBuilds?: {
      easBuildId?: string;
      processingState?: string;
      internalState?: string;
      expired?: boolean;
    }[];
  };
}

export function testFlightReady(status: TestFlightStatus, buildId: string) {
  return (
    status.ios?.ascAppIdentifier === "6810074671" &&
    status.ios.testFlightBuilds?.some(
      (build) =>
        build.easBuildId === buildId &&
        build.processingState === "VALID" &&
        build.internalState === "IN_BETA_TESTING" &&
        build.expired === false
    ) === true
  );
}

export async function readEas(args: string[]) {
  const env: Record<string, string | undefined> = {
    ...process.env,
    EXPO_NO_DOTENV: "1",
  };
  for (const key of Object.keys(env)) {
    if (
      key === "GH_TOKEN" ||
      key.startsWith("GITHUB_TOKEN") ||
      key.startsWith("VERCEL_") ||
      key.startsWith("SUPABASE_") ||
      key === "MOBILE_EXPO_STATIC_CONFIG" ||
      key === "JEST_WORKER_ID"
    ) {
      delete env[key];
    }
  }
  const child = spawn(["eas", ...args], {
    cwd: new URL("../../apps/mobile", import.meta.url).pathname,
    env,
    stderr: "pipe",
    stdout: "pipe",
  });
  const [out, , code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if (code !== 0) {
    throw new Error(
      `EAS ${args[0]} 조회 실패. 원격 실행을 다시 확인해야 합니다.`
    );
  }
  return JSON.parse(out);
}

if (import.meta.main) {
  const [, , buildId] = process.argv;
  if (!(buildId && /^[a-f0-9-]{36}$/.test(buildId))) {
    throw new Error("확인할 EAS 빌드 ID가 필요합니다.");
  }
  const deadline = Date.now() + 20 * 60_000;
  let ready = false;
  while (!ready) {
    // biome-ignore lint/performance/noAwaitInLoops: Apple 처리 완료를 읽기 전용으로 기다린다.
    const status = await readEas([
      "submit:status",
      "--platform",
      "ios",
      "--profile",
      "production",
      "--json",
      "--non-interactive",
    ]);
    ready = testFlightReady(status, buildId);
    if (ready) {
      console.log(`TestFlight 설치 가능: ${buildId}`);
      break;
    }
    if (Date.now() >= deadline) {
      throw new Error("TestFlight 설치 가능 상태를 확인하지 못했습니다.");
    }
    console.log(`TestFlight 처리 대기: ${buildId}`);
    await sleep(30_000);
  }
}
