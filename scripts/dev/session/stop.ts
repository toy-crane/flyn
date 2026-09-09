import { rmSync } from "node:fs";
import { releaseDevice } from "../devices";
import { withLock } from "../lock";
import type { Platform } from "../options";
import { worktreeLogDirectory } from "../paths";
import { readState, type WorktreeRecord, writeState } from "../state";
import {
  createSessionContext,
  type SessionContext,
  type SessionIo,
} from "./context";
import { fitStateToReality, stopOwnProcesses } from "./maintenance";
import { driverFor } from "./platform";

const PLATFORMS: Platform[] = ["android", "ios"];

export interface StopInput {
  cwd: string;
  io: SessionIo;
}

export interface StopResult {
  hadSession: boolean;
}

/**
 * Shuts down every device this worktree holds. It goes by the assignments
 * rather than by the active platform: a start that failed partway leaves a
 * booted device behind with no active platform recorded, and that device is
 * still ours to stop. The assignment, the installed app and the signed-in
 * session stay, so the next start picks up where this one left off.
 */
async function shutdownOwnDevices(
  context: SessionContext,
  record: WorktreeRecord
): Promise<void> {
  for (const platform of PLATFORMS) {
    const deviceId = record.devices[platform];

    if (!deviceId) {
      continue;
    }

    // biome-ignore lint/performance/noAwaitInLoops: shutdowns wait on the device going away, and two at once make the polling ambiguous.
    await driverFor(context, platform).shutdown(deviceId);
  }
}

export async function stopSession({ cwd, io }: StopInput): Promise<StopResult> {
  const context = await createSessionContext(cwd);

  return await withLock(context.paths.lockDirectory, async () => {
    let state = readState(context.paths.statePath);

    state = await fitStateToReality(context, state, io);

    const { worktreePath } = context.git;
    const record = state.worktrees[worktreePath];

    if (!record) {
      io.log("이 worktree에는 실행 중인 개발 세션이 없습니다.");

      return { hadSession: false };
    }

    const platforms = [...record.activePlatforms];
    const hadProcesses = Object.keys(record.processes).length > 0;

    await stopOwnProcesses(worktreePath, state);
    await shutdownOwnDevices(context, record);
    writeState(context.paths.statePath, state);

    io.log(
      hadProcesses
        ? `${platforms.join(", ") || "LAN"} 개발 세션을 종료했습니다. slot ${record.slot}, 기기 배정과 앱 데이터는 그대로 둡니다.`
        : "실행 중인 프로세스가 없어 상태만 정리했습니다."
    );

    return { hadSession: hadProcesses };
  });
}

export interface RemoveResult {
  releasedDevices: string[];
}

/**
 * Gives this worktree's resources back to the repository. The Git worktree,
 * the pooled devices themselves and the shared builds all stay.
 */
export async function removeSession({
  cwd,
  io,
}: StopInput): Promise<RemoveResult> {
  const context = await createSessionContext(cwd);

  return await withLock(context.paths.lockDirectory, async () => {
    let state = readState(context.paths.statePath);

    state = await fitStateToReality(context, state, io);

    const { worktreePath } = context.git;
    const record = state.worktrees[worktreePath];

    if (!record) {
      io.log("이 worktree에는 정리할 개발 자원이 없습니다.");

      return { releasedDevices: [] };
    }

    await stopOwnProcesses(worktreePath, state);

    // No separate shutdown here: every assigned device goes through
    // `returnToPool` below, which removes the app before shutting it down.
    const released: string[] = [];

    for (const platform of PLATFORMS) {
      const deviceId = record.devices[platform];

      if (!deviceId) {
        continue;
      }

      // App removal can succeed before shutdown fails. Persist an unknown
      // install state first so a later start reinstalls instead of trusting it.
      const device = state.devicePool[platform][deviceId];
      if (device) {
        device.installedFingerprint = null;
      }
      writeState(context.paths.statePath, state);

      // biome-ignore lint/performance/noAwaitInLoops: returning devices in parallel makes the tools contend for the same daemons.
      await driverFor(context, platform).returnToPool(deviceId);
      releaseDevice(state, platform, deviceId);
      delete record.devices[platform];
      record.activePlatforms = record.activePlatforms.filter(
        (entry) => entry !== platform
      );
      // Persist each return: a later platform failure must not retain a stale install fingerprint.
      writeState(context.paths.statePath, state);
      released.push(`${platform} ${deviceId}`);
    }

    rmSync(worktreeLogDirectory(context.paths, worktreePath), {
      force: true,
      recursive: true,
    });
    delete state.worktrees[worktreePath];
    writeState(context.paths.statePath, state);

    io.log(
      `개발 자원을 정리하고 slot ${record.slot}을 반납했습니다. Git worktree, 풀의 기기와 저장소 공용 빌드는 그대로 둡니다.`
    );

    return { releasedDevices: released };
  });
}
