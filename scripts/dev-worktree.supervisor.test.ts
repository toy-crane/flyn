import { describe, expect, test } from "bun:test";
import {
  launchDevelopmentServices,
  RuntimeShutdownError,
  redactLogLine,
  type ServiceProcess,
  type ServiceSpec,
  terminateProcessGroup,
} from "./dev-worktree/supervisor";

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function fakeProcess(name: string) {
  const exit = deferred<number>();
  const stopCalls: string[] = [];
  const process: ServiceProcess = {
    exited: exit.promise,
    name,
    stop: () => {
      stopCalls.push(name);
      return Promise.resolve();
    },
  };
  return { exit, process, stopCalls };
}

describe("dev:worktree service supervisor", () => {
  test("API가 준비된 뒤 정확한 port로 Metro를 시작한다", async () => {
    const api = fakeProcess("api");
    const metro = fakeProcess("metro");
    const specs: ServiceSpec[] = [];
    const readyUrls: string[] = [];
    const services = await launchDevelopmentServices({
      apiEnvironment: { EXISTING_API: "yes" },
      mobileEnvironment: { EXISTING_MOBILE: "yes" },
      plan: {
        apiPort: 3007,
        device: { id: "SIM", name: "iPhone" },
        metroPort: 8088,
        slot: 7,
      },
      spawn: (spec) => {
        specs.push(spec);
        return spec.name === "api" ? api.process : metro.process;
      },
      waitForUrl: (url) => {
        readyUrls.push(url);
        return Promise.resolve();
      },
      worktreeRoot: "/repo/worktree",
    });

    expect(specs).toEqual([
      {
        command: ["bun", "run", "dev"],
        cwd: "/repo/worktree/apps/api",
        environment: {
          EXISTING_API: "yes",
          PORT: "3007",
        },
        name: "api",
        port: 3007,
      },
      {
        command: [
          "bunx",
          "expo",
          "start",
          "--dev-client",
          "--localhost",
          "--port",
          "8088",
        ],
        cwd: "/repo/worktree/apps/mobile",
        environment: {
          EXISTING_MOBILE: "yes",
          EXPO_PUBLIC_API_BASE_URL: "http://127.0.0.1:3007",
          NODE_OPTIONS: "--dns-result-order=ipv4first",
        },
        name: "metro",
        port: 8088,
      },
    ]);
    expect(readyUrls).toEqual([
      "http://127.0.0.1:3007/health",
      "http://127.0.0.1:8088/status",
    ]);

    await services.stop();
    expect(api.stopCalls).toHaveLength(1);
    expect(metro.stopCalls).toHaveLength(1);
  });

  test("startup 실패 시 이미 시작한 child를 정리한다", async () => {
    const api = fakeProcess("api");

    await expect(
      launchDevelopmentServices({
        apiEnvironment: {},
        mobileEnvironment: {},
        plan: {
          apiPort: 3000,
          device: { id: "SIM", name: "iPhone" },
          metroPort: 8081,
          slot: 0,
        },
        spawn: () => api.process,
        waitForUrl: () => Promise.reject(new Error("API timeout")),
        worktreeRoot: "/repo/worktree",
      })
    ).rejects.toThrow("API timeout");
    expect(api.stopCalls).toHaveLength(1);
  });

  test("startup 중 signal도 이미 시작한 child를 정리한다", async () => {
    const api = fakeProcess("api");
    const shutdown = deferred<NodeJS.Signals>();
    const launch = launchDevelopmentServices({
      apiEnvironment: {},
      mobileEnvironment: {},
      plan: {
        apiPort: 3000,
        device: { id: "SIM", name: "iPhone" },
        metroPort: 8081,
        slot: 0,
      },
      shutdown: shutdown.promise,
      spawn: () => api.process,
      waitForUrl: () => new Promise(() => undefined),
      worktreeRoot: "/repo/worktree",
    });

    shutdown.resolve("SIGINT");
    await expect(launch).rejects.toBeInstanceOf(RuntimeShutdownError);
    expect(api.stopCalls).toHaveLength(1);
  });

  test("한 child가 종료되면 다른 child도 정리한다", async () => {
    const api = fakeProcess("api");
    const metro = fakeProcess("metro");
    const services = await launchDevelopmentServices({
      apiEnvironment: {},
      mobileEnvironment: {},
      plan: {
        apiPort: 3000,
        device: { id: "SIM", name: "iPhone" },
        metroPort: 8081,
        slot: 0,
      },
      spawn: (spec) => (spec.name === "api" ? api.process : metro.process),
      waitForUrl: () => Promise.resolve(),
      worktreeRoot: "/repo/worktree",
    });

    api.exit.resolve(17);
    await expect(services.waitForFailure()).rejects.toThrow(
      "api process가 종료되었습니다(exit 17)."
    );
    expect(api.stopCalls).toHaveLength(1);
    expect(metro.stopCalls).toHaveLength(1);
  });

  test("secret과 authorization header를 로그에서 가린다", () => {
    const redacted = redactLogLine(
      "AI_GATEWAY_API_KEY=abc Authorization: Bearer xyz SUPABASE_SECRET_KEY=def"
    );

    expect(redacted).not.toContain("abc");
    expect(redacted).not.toContain("xyz");
    expect(redacted).not.toContain("def");
    expect(redacted).toContain("[REDACTED]");
  });

  test("process group은 TERM 후 살아 있을 때만 5초 뒤 KILL한다", async () => {
    const signals: string[] = [];
    let alive = true;
    await terminateProcessGroup(123, {
      delay: (durationMs) => {
        expect(durationMs).toBe(5000);
        alive = false;
        return Promise.resolve();
      },
      isAlive: () => alive,
      kill: (_pid, signal) => {
        signals.push(signal);
      },
    });
    expect(signals).toEqual(["SIGTERM"]);

    const forcedSignals: string[] = [];
    await terminateProcessGroup(456, {
      delay: () => Promise.resolve(),
      isAlive: () => true,
      kill: (_pid, signal) => {
        forcedSignals.push(signal);
      },
    });
    expect(forcedSignals).toEqual(["SIGTERM", "SIGKILL"]);
  });
});
