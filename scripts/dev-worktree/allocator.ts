import {
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  MAX_DEV_SLOT,
  portsForSlot,
  type RuntimePorts,
  type SimulatorDevice,
} from "./runtime";

const ASSIGNMENT_VERSION = 1;
const LOCK_VERSION = 1;
const ALLOCATION_TIMEOUT_MS = 2000;
const ALLOCATION_RETRY_MS = 25;

export interface RuntimeAssignmentV1 {
  device: SimulatorDevice;
  slot: number;
  version: 1;
}

export interface RuntimePlan extends RuntimePorts {
  device: SimulatorDevice;
  slot: number;
}

interface RuntimeSlotLockV1 extends RuntimePorts {
  deviceId: string;
  deviceName: string;
  pid: number;
  slot: number;
  startedAt: string;
  version: 1;
  worktreeRoot: string;
}

export interface RuntimeReservation {
  plan: RuntimePlan;
  release: () => Promise<void>;
}

interface ReserveRuntimeOptions {
  assignmentPath: string;
  device: SimulatorDevice;
  dryRun?: boolean;
  globalRuntimeDir: string;
  isPortAvailable: (port: number) => Promise<boolean>;
  isProcessAlive: (pid: number) => boolean;
  now?: () => Date;
  pid: number;
  requestedSlot?: number;
  worktreeRoot: string;
}

function isErrnoException(error: unknown, code: string) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function isAssignment(value: unknown): value is RuntimeAssignmentV1 {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const assignment = value as Partial<RuntimeAssignmentV1>;
  return (
    assignment.version === ASSIGNMENT_VERSION &&
    typeof assignment.slot === "number" &&
    Number.isInteger(assignment.slot) &&
    assignment.slot >= 0 &&
    assignment.slot <= MAX_DEV_SLOT &&
    typeof assignment.device?.id === "string" &&
    assignment.device.id.length > 0 &&
    typeof assignment.device.name === "string" &&
    assignment.device.name.length > 0
  );
}

function isSlotLock(value: unknown): value is RuntimeSlotLockV1 {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const lock = value as Partial<RuntimeSlotLockV1>;
  return (
    lock.version === LOCK_VERSION &&
    typeof lock.pid === "number" &&
    Number.isInteger(lock.pid) &&
    typeof lock.worktreeRoot === "string" &&
    typeof lock.slot === "number" &&
    typeof lock.apiPort === "number" &&
    typeof lock.metroPort === "number" &&
    typeof lock.deviceId === "string" &&
    typeof lock.deviceName === "string" &&
    typeof lock.startedAt === "string"
  );
}

async function readJson(pathname: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(pathname, "utf8"));
  } catch (error) {
    if (isErrnoException(error, "ENOENT")) {
      return null;
    }

    throw error;
  }
}

export async function readRuntimeAssignment(
  assignmentPath: string
): Promise<RuntimeAssignmentV1 | null> {
  let value: unknown;

  try {
    value = await readJson(assignmentPath);
  } catch (error) {
    throw new Error(
      `runtime assignment가 손상되었습니다. 삭제 후 다시 실행하세요: ${assignmentPath}`,
      { cause: error }
    );
  }

  if (value === null) {
    return null;
  }

  if (!isAssignment(value)) {
    throw new Error(
      `runtime assignment가 손상되었습니다. 삭제 후 다시 실행하세요: ${assignmentPath}`
    );
  }

  return value;
}

async function readSlotLock(lockPath: string) {
  const value = await readJson(lockPath);

  if (value === null) {
    return null;
  }

  if (!isSlotLock(value)) {
    throw new Error(`runtime slot lock이 손상되었습니다: ${lockPath}`);
  }

  return value;
}

async function writeJsonAtomic(pathname: string, value: unknown, pid: number) {
  await mkdir(path.dirname(pathname), { recursive: true });
  const temporaryPath = `${pathname}.${pid}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    flag: "wx",
  });
  await rename(temporaryPath, pathname);
}

async function removeOwnedLock(
  lockPath: string,
  pid: number,
  worktreeRoot: string
) {
  const lock = await readSlotLock(lockPath).catch(() => null);

  if (lock?.pid === pid && lock.worktreeRoot === worktreeRoot) {
    await unlink(lockPath).catch((error: unknown) => {
      if (!isErrnoException(error, "ENOENT")) {
        throw error;
      }
    });
  }
}

function sleep(durationMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function withAllocationMutex<T>(
  options: ReserveRuntimeOptions,
  operation: () => Promise<T>
): Promise<T> {
  await mkdir(options.globalRuntimeDir, { recursive: true });
  const mutexPath = path.join(options.globalRuntimeDir, "allocate.lock");
  const deadline = Date.now() + ALLOCATION_TIMEOUT_MS;
  let acquired = false;

  while (!acquired) {
    try {
      // mutex 선점은 이전 시도 결과에 의존하므로 병렬화할 수 없다.
      // biome-ignore lint/performance/noAwaitInLoops: allocation lock 재시도
      const handle = await open(mutexPath, "wx");
      await handle.writeFile(
        `${JSON.stringify({ pid: options.pid, version: LOCK_VERSION })}\n`
      );
      await handle.close();
      acquired = true;
    } catch (error) {
      if (!isErrnoException(error, "EEXIST")) {
        throw error;
      }

      const existing = await readJson(mutexPath).catch(() => null);
      const existingPid =
        typeof existing === "object" &&
        existing !== null &&
        "pid" in existing &&
        typeof existing.pid === "number"
          ? existing.pid
          : null;

      if (existingPid !== null && !options.isProcessAlive(existingPid)) {
        await unlink(mutexPath).catch(() => undefined);
        continue;
      }

      if (Date.now() >= deadline) {
        throw new Error(`runtime 배정 lock을 얻지 못했습니다: ${mutexPath}`, {
          cause: error,
        });
      }

      await sleep(ALLOCATION_RETRY_MS);
    }
  }

  try {
    return await operation();
  } finally {
    const existing = await readJson(mutexPath).catch(() => null);

    if (
      typeof existing === "object" &&
      existing !== null &&
      "pid" in existing &&
      existing.pid === options.pid
    ) {
      await unlink(mutexPath).catch(() => undefined);
    }
  }
}

async function portsAreAvailable(
  ports: RuntimePorts,
  isPortAvailable: ReserveRuntimeOptions["isPortAvailable"]
) {
  const [apiAvailable, metroAvailable] = await Promise.all([
    isPortAvailable(ports.apiPort),
    isPortAvailable(ports.metroPort),
  ]);

  return apiAvailable && metroAvailable;
}

async function assertDeviceIsAvailable(
  options: ReserveRuntimeOptions,
  slotsDir: string
) {
  for (let slot = 0; slot <= MAX_DEV_SLOT; slot += 1) {
    // 순차 검사는 같은 저장소의 안정적인 낮은 slot 순서를 보장한다.
    // biome-ignore lint/performance/noAwaitInLoops: slot lock은 순서대로 검사해야 한다.
    const lock = await readSlotLock(path.join(slotsDir, `${slot}.json`));

    if (
      lock &&
      options.isProcessAlive(lock.pid) &&
      lock.deviceId === options.device.id
    ) {
      throw new Error("다른 활성 worktree가 같은 Simulator를 사용 중입니다.");
    }
  }
}

async function slotIsAvailable({
  mutate,
  options,
  slot,
  slotsDir,
}: {
  mutate: boolean;
  options: ReserveRuntimeOptions;
  slot: number;
  slotsDir: string;
}) {
  const lockPath = path.join(slotsDir, `${slot}.json`);
  const lock = await readSlotLock(lockPath);

  if (lock && options.isProcessAlive(lock.pid)) {
    return false;
  }

  const available = await portsAreAvailable(
    portsForSlot(slot),
    options.isPortAvailable
  );

  if (!available) {
    return false;
  }

  if (lock && mutate) {
    await unlink(lockPath);
  }

  return true;
}

async function selectSlot({
  assignment,
  mutate,
  options,
  slotsDir,
}: {
  assignment: RuntimeAssignmentV1 | null;
  mutate: boolean;
  options: ReserveRuntimeOptions;
  slotsDir: string;
}) {
  async function selectStableSlot(stableSlot: number) {
    if (
      !(await slotIsAvailable({
        mutate,
        options,
        slot: stableSlot,
        slotsDir,
      }))
    ) {
      const ports = portsForSlot(stableSlot);
      throw new Error(
        `slot ${stableSlot}을 사용할 수 없습니다(API ${ports.apiPort}, Metro ${ports.metroPort}).`
      );
    }

    return stableSlot;
  }

  if (options.requestedSlot !== undefined) {
    return await selectStableSlot(options.requestedSlot);
  }

  if (assignment) {
    return await selectStableSlot(assignment.slot);
  }

  for (let slot = 0; slot <= MAX_DEV_SLOT; slot += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: 가장 낮은 가용 slot이 계약이다.
    if (await slotIsAvailable({ mutate, options, slot, slotsDir })) {
      return slot;
    }
  }

  throw new Error("사용 가능한 dev slot이 없습니다.");
}

async function reserveInsideMutex(
  options: ReserveRuntimeOptions,
  assignment: RuntimeAssignmentV1 | null
): Promise<RuntimeReservation> {
  const slotsDir = path.join(options.globalRuntimeDir, "slots");
  await mkdir(slotsDir, { recursive: true });
  await assertDeviceIsAvailable(options, slotsDir);
  const slot = await selectSlot({
    assignment,
    mutate: true,
    options,
    slotsDir,
  });
  const ports = portsForSlot(slot);
  const lockPath = path.join(slotsDir, `${slot}.json`);
  const lock: RuntimeSlotLockV1 = {
    ...ports,
    deviceId: options.device.id,
    deviceName: options.device.name,
    pid: options.pid,
    slot,
    startedAt: (options.now ?? (() => new Date()))().toISOString(),
    version: LOCK_VERSION,
    worktreeRoot: options.worktreeRoot,
  };
  const handle = await open(lockPath, "wx");
  await handle.writeFile(`${JSON.stringify(lock, null, 2)}\n`);
  await handle.close();

  try {
    await writeJsonAtomic(
      options.assignmentPath,
      {
        device: options.device,
        slot,
        version: ASSIGNMENT_VERSION,
      } satisfies RuntimeAssignmentV1,
      options.pid
    );
  } catch (error) {
    await removeOwnedLock(lockPath, options.pid, options.worktreeRoot);
    throw error;
  }

  return {
    plan: { ...ports, device: options.device, slot },
    release: () => removeOwnedLock(lockPath, options.pid, options.worktreeRoot),
  };
}

export async function reserveRuntime(
  options: ReserveRuntimeOptions
): Promise<RuntimeReservation> {
  const assignment = await readRuntimeAssignment(options.assignmentPath);
  const slotsDir = path.join(options.globalRuntimeDir, "slots");

  if (options.dryRun) {
    await assertDeviceIsAvailable(options, slotsDir);
    const slot = await selectSlot({
      assignment,
      mutate: false,
      options,
      slotsDir,
    });
    return {
      plan: { ...portsForSlot(slot), device: options.device, slot },
      release: () => Promise.resolve(),
    };
  }

  return await withAllocationMutex(options, () =>
    reserveInsideMutex(options, assignment)
  );
}
