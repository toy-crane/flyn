import type { Platform } from "./options";
import type { RepositoryState } from "./state";

export const DEVICE_POOL_LIMIT = 5;

export type DeviceChoice =
  | { deviceId: string; reason: "leased" }
  | { deviceId: string; reason: "pooled" }
  | { reason: "create" };

export interface SelectDeviceInput {
  platform: Platform;
  state: RepositoryState;
  worktreePath: string;
}

/**
 * Existing assignment first, then an idle device from the repository pool, and
 * only then a new one. Without the middle step the pool would grow by one
 * device for every worktree ever deleted.
 */
export function selectDevice({
  platform,
  state,
  worktreePath,
}: SelectDeviceInput): DeviceChoice {
  const pool = state.devicePool[platform];
  const assigned = state.worktrees[worktreePath]?.devices[platform];

  if (assigned && pool[assigned]?.leasedTo === worktreePath) {
    return { deviceId: assigned, reason: "leased" };
  }

  const free = Object.entries(pool).find(([, device]) => !device.leasedTo);

  if (free) {
    return { deviceId: free[0], reason: "pooled" };
  }

  if (Object.keys(pool).length >= DEVICE_POOL_LIMIT) {
    throw new Error(
      `${platform} 기기 풀 ${DEVICE_POOL_LIMIT}개를 모두 배정했습니다. bun run dev:status로 확인하고 사용하지 않는 worktree에서 bun run dev:remove를 실행해 주세요.`
    );
  }

  return { reason: "create" };
}

/**
 * Records the lease. A device that comes from the pool had the project app removed on its way
 * back, so the previous worktree app is already gone and the
 * fingerprint has to be re-established by an install.
 */
export function leaseDevice(
  state: RepositoryState,
  platform: Platform,
  deviceId: string,
  worktreePath: string
): void {
  const existing = state.devicePool[platform][deviceId];

  state.devicePool[platform][deviceId] = {
    installedFingerprint:
      existing?.leasedTo === worktreePath
        ? (existing.installedFingerprint ?? null)
        : null,
    leasedTo: worktreePath,
  };

  const record = state.worktrees[worktreePath];

  if (record) {
    record.devices[platform] = deviceId;
  }
}

/** Marks the device as carrying this build. Only an install may call this. */
export function recordInstalledFingerprint(
  state: RepositoryState,
  platform: Platform,
  deviceId: string,
  fingerprint: string
): void {
  const device = state.devicePool[platform][deviceId];

  if (device) {
    device.installedFingerprint = fingerprint;
  }
}

/**
 * Returns the device to the pool. The entry stays so the next worktree finds
 * an idle device instead of creating one.
 */
export function releaseDevice(
  state: RepositoryState,
  platform: Platform,
  deviceId: string
): void {
  const device = state.devicePool[platform][deviceId];

  if (device) {
    device.installedFingerprint = null;
    device.leasedTo = null;
  }
}
