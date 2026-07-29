import path from "node:path";
import type { RuntimePlan } from "./allocator";

export const MAX_DEV_SLOT = 99;

export interface DevWorktreeArgs {
  device?: string;
  dryRun: boolean;
  slot?: number;
}

export interface RuntimePorts {
  apiPort: number;
  metroPort: number;
}

export interface SimulatorDevice {
  id: string;
  name: string;
}

export function selectSimulator({
  available,
  requested,
  storedId,
}: {
  available: SimulatorDevice[];
  requested?: string;
  storedId?: string;
}): SimulatorDevice {
  if (requested) {
    const byId = available.find(({ id }) => id === requested);

    if (byId) {
      return byId;
    }

    const byName = available.filter(({ name }) => name === requested);

    if (byName.length > 1) {
      throw new Error(
        "같은 이름의 Simulator가 여러 개입니다. UDID를 지정하세요."
      );
    }

    if (byName[0]) {
      return byName[0];
    }

    throw new Error(`iOS Simulator를 찾을 수 없습니다: ${requested}`);
  }

  if (!storedId) {
    throw new Error("첫 실행에는 --device로 iOS Simulator를 지정해야 합니다.");
  }

  const stored = available.find(({ id }) => id === storedId);

  if (!stored) {
    throw new Error(
      "저장된 iOS Simulator를 찾을 수 없습니다. --device로 다시 지정하세요."
    );
  }

  return stored;
}

export function portsForSlot(slot: number): RuntimePorts {
  if (!Number.isInteger(slot) || slot < 0 || slot > MAX_DEV_SLOT) {
    throw new Error(`slot은 0부터 ${MAX_DEV_SLOT} 사이여야 합니다.`);
  }

  return {
    apiPort: 3000 + slot,
    metroPort: 8081 + slot,
  };
}

export function formatDryRunPlan(plan: RuntimePlan, worktreeRoot: string) {
  const mobileRoot = path.join(worktreeRoot, "apps/mobile");
  return [
    `[runtime] worktree: ${worktreeRoot}`,
    `[runtime] slot ${plan.slot} · API ${plan.apiPort} · Metro ${plan.metroPort} · ${plan.device.name} (${plan.device.id})`,
    `[runtime] transformer cache: ${path.join(
      mobileRoot,
      ".expo/metro-cache"
    )}`,
    `[runtime] file-map cache: ${path.join(
      mobileRoot,
      ".expo/metro-file-map"
    )}`,
    `[runtime] API command: (cd apps/api && PORT=${plan.apiPort} bun run dev)`,
    `[runtime] Metro command: (cd apps/mobile && bunx expo start --dev-client --localhost --port ${plan.metroPort})`,
  ].join("\n");
}

export function parseDevWorktreeArgs(argv: string[]): DevWorktreeArgs {
  const parsed: DevWorktreeArgs = { dryRun: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (argument === "--") {
      continue;
    }

    if (argument === "--slot") {
      const rawSlot = argv[index + 1];
      const slot = Number(rawSlot);

      if (
        rawSlot === undefined ||
        rawSlot.trim() === "" ||
        !Number.isInteger(slot)
      ) {
        throw new Error(`slot은 0부터 ${MAX_DEV_SLOT} 사이여야 합니다.`);
      }

      portsForSlot(slot);
      parsed.slot = slot;
      index += 1;
      continue;
    }

    if (argument === "--device") {
      const device = argv[index + 1]?.trim();

      if (!device) {
        throw new Error("--device에는 Simulator 이름이나 UDID가 필요합니다.");
      }

      parsed.device = device;
      index += 1;
      continue;
    }

    throw new Error(`지원하지 않는 옵션입니다: ${argument}`);
  }

  return parsed;
}
