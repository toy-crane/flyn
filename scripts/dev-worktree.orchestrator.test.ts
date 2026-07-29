import { describe, expect, test } from "bun:test";
import type { RuntimeReservation } from "./dev-worktree/allocator";
import { runRuntimeSession } from "./dev-worktree/orchestrator";
import type { DevelopmentServices } from "./dev-worktree/supervisor";

function createReservation(events: string[]): RuntimeReservation {
  return {
    plan: {
      apiPort: 3000,
      device: { id: "SIM", name: "iPhone" },
      metroPort: 8081,
      slot: 0,
    },
    release: () => {
      events.push("release-lock");
      return Promise.resolve();
    },
  };
}

function createServices(events: string[]): DevelopmentServices {
  return {
    stop: () => {
      events.push("stop-services");
      return Promise.resolve();
    },
    waitForFailure: () => new Promise<never>(() => undefined),
  };
}

describe("dev:worktree runtime session", () => {
  test("startup 실패 시 lock을 정리하고 Supabase 명령은 호출하지 않는다", async () => {
    const events: string[] = [];

    await expect(
      runRuntimeSession({
        closeSimulator: () => {
          events.push("close-simulator");
          return Promise.resolve();
        },
        launchServices: () => Promise.reject(new Error("startup failed")),
        openSimulator: () => Promise.resolve(),
        reservation: createReservation(events),
        waitForSignal: () => new Promise(() => undefined),
      })
    ).rejects.toThrow("startup failed");
    expect(events).toEqual(["release-lock"]);
    expect(events.some((event) => event.includes("supabase"))).toBe(false);
  });

  test("signal 종료 시 child, agent-device session, lock 순서로 정리한다", async () => {
    const events: string[] = [];

    await runRuntimeSession({
      closeSimulator: () => {
        events.push("close-simulator");
        return Promise.resolve();
      },
      launchServices: () => Promise.resolve(createServices(events)),
      openSimulator: () => {
        events.push("open-simulator");
        return Promise.resolve();
      },
      reservation: createReservation(events),
      waitForSignal: () => Promise.resolve("SIGINT"),
    });

    expect(events).toEqual([
      "open-simulator",
      "stop-services",
      "close-simulator",
      "release-lock",
    ]);
    expect(events.some((event) => event.includes("supabase"))).toBe(false);
  });
});
