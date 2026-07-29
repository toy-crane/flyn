import { spawn } from "bun";
import type { RuntimePlan } from "./allocator";
import type { SimulatorDevice } from "./runtime";

export const AGENT_DEVICE_APP_NAME = "flyn (com.odd.flyn)";

interface AgentDeviceEnvelope {
  data?: unknown;
  success?: unknown;
}

interface AgentDeviceData {
  apps?: unknown;
  devices?: unknown;
}

interface AgentDevice {
  appleOs?: unknown;
  id?: unknown;
  kind?: unknown;
  name?: unknown;
  platform?: unknown;
}

function readSuccessfulData(
  value: unknown,
  command: "apps" | "devices"
): AgentDeviceData {
  if (
    typeof value !== "object" ||
    value === null ||
    (value as AgentDeviceEnvelope).success !== true ||
    typeof (value as AgentDeviceEnvelope).data !== "object" ||
    (value as AgentDeviceEnvelope).data === null
  ) {
    throw new Error(`agent-device ${command} 응답을 해석할 수 없습니다.`);
  }

  return (value as AgentDeviceEnvelope).data as AgentDeviceData;
}

export function parseIosSimulators(value: unknown): SimulatorDevice[] {
  const { devices } = readSuccessfulData(value, "devices");

  if (!Array.isArray(devices)) {
    throw new Error("agent-device devices 응답을 해석할 수 없습니다.");
  }

  return devices.flatMap((candidate: AgentDevice) => {
    if (
      candidate.platform !== "ios" ||
      candidate.appleOs !== "ios" ||
      candidate.kind !== "simulator" ||
      typeof candidate.id !== "string" ||
      typeof candidate.name !== "string"
    ) {
      return [];
    }

    return [{ id: candidate.id, name: candidate.name }];
  });
}

export function parseAgentDeviceApps(value: unknown): string[] {
  const { apps } = readSuccessfulData(value, "apps");

  if (!(Array.isArray(apps) && apps.every((app) => typeof app === "string"))) {
    throw new Error("agent-device apps 응답을 해석할 수 없습니다.");
  }

  return apps;
}

export function createSimulatorSessionName(repoId: string, slot: number) {
  return `flyn-${repoId}-slot-${slot}`;
}

export function developmentBuildCommand(deviceId: string, metroPort: number) {
  return `cd apps/mobile && bunx expo run:ios --device "${deviceId}" --port ${metroPort} --no-bundler`;
}

async function runAgentDeviceJson(args: string[]) {
  const child = spawn(["agent-device", ...args, "--json"], {
    stderr: "pipe",
    stdout: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  if (exitCode !== 0) {
    throw new Error(
      `agent-device ${args[0]} 실패(exit ${exitCode}): ${stderr.trim()}`
    );
  }

  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`agent-device ${args[0]} JSON 응답이 손상되었습니다.`, {
      cause: error,
    });
  }
}

export async function listIosSimulators() {
  return parseIosSimulators(await runAgentDeviceJson(["devices"]));
}

export async function hasDevelopmentBuild(deviceId: string) {
  const apps = parseAgentDeviceApps(
    await runAgentDeviceJson([
      "apps",
      "--platform",
      "ios",
      "--device",
      deviceId,
    ])
  );
  return apps.includes(AGENT_DEVICE_APP_NAME);
}

export async function openSimulatorSession({
  plan,
  sessionName,
}: {
  plan: RuntimePlan;
  sessionName: string;
}) {
  await runAgentDeviceJson([
    "open",
    "flyn",
    "--platform",
    "ios",
    "--device",
    plan.device.id,
    "--session",
    sessionName,
    "--metro-host",
    "127.0.0.1",
    "--metro-port",
    String(plan.metroPort),
    "--relaunch",
  ]);
}

export async function closeSimulatorSession(sessionName: string) {
  await runAgentDeviceJson(["close", "--session", sessionName]);
}
