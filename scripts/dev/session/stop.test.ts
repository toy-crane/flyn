import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../adapters/command";

test("앱 삭제 후 종료 실패 시 배정은 유지하고 설치 기록은 무효화한다", async () => {
  const directory = mkdtempSync(join(tmpdir(), "flyn-return-failure-"));
  try {
    const script = `
      import { mock } from "bun:test";
      import { createEmptyState, readState, writeState } from ${JSON.stringify(join(import.meta.dir, "..", "state.ts"))};
      const directory = ${JSON.stringify(directory)};
      const statePath = directory + "/state.json";
      const state = createEmptyState();
      state.devicePool.ios.device = { leasedTo: "/repo", installedFingerprint: "installed" };
      state.worktrees["/repo"] = { activePlatforms: [], devices: { ios: "device" }, environmentFingerprint: null, label: "test", processes: {}, slot: 0 };
      writeState(statePath, state);
      mock.module(${JSON.stringify(join(import.meta.dir, "context.ts"))}, () => ({ createSessionContext: async () => ({ git: { worktreePath: "/repo" }, paths: { statePath, lockDirectory: directory + "/lock" } }) }));
      mock.module(${JSON.stringify(join(import.meta.dir, "maintenance.ts"))}, () => ({ fitStateToReality: async (_context, state) => state, stopOwnProcesses: async () => {} }));
      mock.module(${JSON.stringify(join(import.meta.dir, "platform.ts"))}, () => ({ driverFor: () => ({ returnToPool: async () => { throw new Error("app removed; shutdown failed"); } }) }));
      const { removeSession } = await import(${JSON.stringify(join(import.meta.dir, "stop.ts"))});
      try { await removeSession({ cwd: "/repo", io: { log() {} } }); throw new Error("Expected failure"); }
      catch (error) { if (error.message !== "app removed; shutdown failed") throw error; }
      console.log(JSON.stringify(readState(statePath).devicePool.ios.device));
    `;
    const result = await run([process.execPath, "-e", script]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      installedFingerprint: null,
      leasedTo: "/repo",
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
