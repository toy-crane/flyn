import { afterEach, describe, expect, test } from "bun:test";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { reserveRuntime } from "./dev-worktree/allocator";
import {
  parseDevWorktreeArgs,
  portsForSlot,
  selectSimulator,
} from "./dev-worktree/runtime";

const temporaryRoots: string[] = [];

async function temporaryRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "flyn-runtime-test-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { force: true, recursive: true }))
  );
});

async function pathExists(pathname: string) {
  return await access(pathname)
    .then(() => true)
    .catch(() => false);
}

describe("dev:worktree 명령 계약", () => {
  test("slot을 API와 Metro port 한 쌍으로 변환한다", () => {
    expect(portsForSlot(0)).toEqual({ apiPort: 3000, metroPort: 8081 });
    expect(portsForSlot(1)).toEqual({ apiPort: 3001, metroPort: 8082 });
    expect(portsForSlot(99)).toEqual({ apiPort: 3099, metroPort: 8180 });
  });

  test("지원하는 옵션을 파싱한다", () => {
    expect(
      parseDevWorktreeArgs([
        "--slot",
        "7",
        "--device",
        "iPhone 17 Pro",
        "--dry-run",
      ])
    ).toEqual({
      device: "iPhone 17 Pro",
      dryRun: true,
      slot: 7,
    });
  });

  test("잘못된 slot과 알 수 없는 옵션을 거부한다", () => {
    expect(() => parseDevWorktreeArgs(["--slot", "-1"])).toThrow(
      "slot은 0부터 99 사이여야 합니다."
    );
    expect(() => parseDevWorktreeArgs(["--slot", "100"])).toThrow(
      "slot은 0부터 99 사이여야 합니다."
    );
    expect(() => parseDevWorktreeArgs(["--wat"])).toThrow(
      "지원하지 않는 옵션입니다: --wat"
    );
  });
});

describe("dev:worktree Simulator 선택", () => {
  const simulators = [
    {
      id: "SIM-17",
      name: "iPhone 17",
    },
    {
      id: "SIM-17-PRO",
      name: "iPhone 17 Pro",
    },
  ];

  test("이름이나 UDID로 Simulator를 선택한다", () => {
    expect(
      selectSimulator({ available: simulators, requested: "iPhone 17 Pro" })
    ).toEqual(simulators[1]);
    expect(
      selectSimulator({ available: simulators, requested: "SIM-17" })
    ).toEqual(simulators[0]);
  });

  test("저장된 Simulator를 재사용한다", () => {
    expect(
      selectSimulator({ available: simulators, storedId: "SIM-17-PRO" })
    ).toEqual(simulators[1]);
  });

  test("첫 실행의 device 누락과 삭제된 Simulator를 거부한다", () => {
    expect(() => selectSimulator({ available: simulators })).toThrow(
      "첫 실행에는 --device로 iOS Simulator를 지정해야 합니다."
    );
    expect(() =>
      selectSimulator({ available: simulators, storedId: "REMOVED" })
    ).toThrow(
      "저장된 iOS Simulator를 찾을 수 없습니다. --device로 다시 지정하세요."
    );
  });

  test("같은 이름의 Simulator가 여러 개면 UDID를 요구한다", () => {
    expect(() =>
      selectSimulator({
        available: [...simulators, { id: "SIM-17-OTHER", name: "iPhone 17" }],
        requested: "iPhone 17",
      })
    ).toThrow("같은 이름의 Simulator가 여러 개입니다. UDID를 지정하세요.");
  });
});

describe("dev:worktree runtime 배정", () => {
  const availablePort = () => Promise.resolve(true);
  const deadProcess = () => false;
  const deviceA = { id: "SIM-A", name: "iPhone 17" };
  const deviceB = { id: "SIM-B", name: "iPhone 17 Pro" };

  test("두 worktree에 서로 다른 slot을 안정적으로 배정한다", async () => {
    const root = await temporaryRoot();
    const globalRuntimeDir = path.join(root, "global");
    const firstAssignment = path.join(root, "first", "assignment.json");
    const secondAssignment = path.join(root, "second", "assignment.json");
    const first = await reserveRuntime({
      assignmentPath: firstAssignment,
      device: deviceA,
      globalRuntimeDir,
      isPortAvailable: availablePort,
      isProcessAlive: deadProcess,
      pid: 101,
      worktreeRoot: "/repo/first",
    });
    const second = await reserveRuntime({
      assignmentPath: secondAssignment,
      device: deviceB,
      globalRuntimeDir,
      isPortAvailable: availablePort,
      isProcessAlive: (pid) => pid === 101,
      pid: 202,
      worktreeRoot: "/repo/second",
    });

    expect(first.plan).toEqual({
      apiPort: 3000,
      device: deviceA,
      metroPort: 8081,
      slot: 0,
    });
    expect(second.plan).toEqual({
      apiPort: 3001,
      device: deviceB,
      metroPort: 8082,
      slot: 1,
    });
    expect(JSON.parse(await readFile(firstAssignment, "utf8"))).toEqual({
      device: deviceA,
      slot: 0,
      version: 1,
    });

    await first.release();
    await second.release();
  });

  test("동시에 시작한 worktree가 같은 slot을 배정받지 않는다", async () => {
    const root = await temporaryRoot();
    const globalRuntimeDir = path.join(root, "global");
    const livePids = new Set([701, 702]);
    const [first, second] = await Promise.all([
      reserveRuntime({
        assignmentPath: path.join(root, "first", "assignment.json"),
        device: deviceA,
        globalRuntimeDir,
        isPortAvailable: availablePort,
        isProcessAlive: (pid) => livePids.has(pid),
        pid: 701,
        worktreeRoot: "/repo/concurrent-first",
      }),
      reserveRuntime({
        assignmentPath: path.join(root, "second", "assignment.json"),
        device: deviceB,
        globalRuntimeDir,
        isPortAvailable: availablePort,
        isProcessAlive: (pid) => livePids.has(pid),
        pid: 702,
        worktreeRoot: "/repo/concurrent-second",
      }),
    ]);

    expect(new Set([first.plan.slot, second.plan.slot])).toEqual(
      new Set([0, 1])
    );

    await first.release();
    await second.release();
  });

  test("관계없는 port 충돌은 건너뛰고 explicit slot에서는 실패한다", async () => {
    const root = await temporaryRoot();
    const unavailableSlotZeroPort = (port: number) =>
      Promise.resolve(port !== 3000 && port !== 8081);
    const automatic = await reserveRuntime({
      assignmentPath: path.join(root, "automatic", "assignment.json"),
      device: deviceA,
      globalRuntimeDir: path.join(root, "global"),
      isPortAvailable: unavailableSlotZeroPort,
      isProcessAlive: deadProcess,
      pid: 801,
      worktreeRoot: "/repo/automatic",
    });

    expect(automatic.plan.slot).toBe(1);
    await expect(
      reserveRuntime({
        assignmentPath: path.join(root, "explicit", "assignment.json"),
        device: deviceB,
        globalRuntimeDir: path.join(root, "explicit-global"),
        isPortAvailable: unavailableSlotZeroPort,
        isProcessAlive: deadProcess,
        pid: 802,
        requestedSlot: 0,
        worktreeRoot: "/repo/explicit",
      })
    ).rejects.toThrow("slot 0을 사용할 수 없습니다(API 3000, Metro 8081).");

    await automatic.release();
  });

  test("stale lock만 회수하고 live lock과 device는 빼앗지 않는다", async () => {
    const root = await temporaryRoot();
    const globalRuntimeDir = path.join(root, "global");
    const slotsDir = path.join(globalRuntimeDir, "slots");
    await mkdir(slotsDir, { recursive: true });
    await writeFile(
      path.join(slotsDir, "0.json"),
      JSON.stringify({
        apiPort: 3000,
        deviceId: "OLD-SIM",
        deviceName: "Old iPhone",
        metroPort: 8081,
        pid: 10,
        slot: 0,
        startedAt: "2026-07-29T00:00:00.000Z",
        version: 1,
        worktreeRoot: "/repo/old",
      })
    );

    const reclaimed = await reserveRuntime({
      assignmentPath: path.join(root, "new", "assignment.json"),
      device: deviceA,
      globalRuntimeDir,
      isPortAvailable: availablePort,
      isProcessAlive: deadProcess,
      pid: 303,
      requestedSlot: 0,
      worktreeRoot: "/repo/new",
    });

    expect(reclaimed.plan.slot).toBe(0);

    await expect(
      reserveRuntime({
        assignmentPath: path.join(root, "other", "assignment.json"),
        device: deviceA,
        globalRuntimeDir,
        isPortAvailable: availablePort,
        isProcessAlive: (pid) => pid === 303,
        pid: 404,
        requestedSlot: 1,
        worktreeRoot: "/repo/other",
      })
    ).rejects.toThrow("다른 활성 worktree가 같은 Simulator를 사용 중입니다.");

    await reclaimed.release();
  });

  test("dry-run은 assignment와 lock을 만들지 않는다", async () => {
    const root = await temporaryRoot();
    const globalRuntimeDir = path.join(root, "global");
    const assignmentPath = path.join(root, "worktree", "assignment.json");
    const dryRun = await reserveRuntime({
      assignmentPath,
      device: deviceA,
      dryRun: true,
      globalRuntimeDir,
      isPortAvailable: availablePort,
      isProcessAlive: deadProcess,
      pid: 505,
      worktreeRoot: "/repo/dry",
    });

    expect(dryRun.plan.slot).toBe(0);
    expect(await pathExists(assignmentPath)).toBe(false);
    expect(
      await pathExists(path.join(globalRuntimeDir, "slots", "0.json"))
    ).toBe(false);
  });

  test("손상된 assignment를 자동으로 덮어쓰지 않는다", async () => {
    const root = await temporaryRoot();
    const assignmentPath = path.join(root, "worktree", "assignment.json");
    await mkdir(path.dirname(assignmentPath), { recursive: true });
    await writeFile(assignmentPath, "{broken");

    await expect(
      reserveRuntime({
        assignmentPath,
        device: deviceA,
        globalRuntimeDir: path.join(root, "global"),
        isPortAvailable: availablePort,
        isProcessAlive: deadProcess,
        pid: 606,
        worktreeRoot: "/repo/broken",
      })
    ).rejects.toThrow(
      `runtime assignment가 손상되었습니다. 삭제 후 다시 실행하세요: ${assignmentPath}`
    );
    expect(await readFile(assignmentPath, "utf8")).toBe("{broken");
  });
});
