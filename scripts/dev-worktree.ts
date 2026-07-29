import os from "node:os";
import path from "node:path";
import {
  readRuntimeAssignment,
  reserveRuntime,
} from "./dev-worktree/allocator";
import { runRuntimeSession } from "./dev-worktree/orchestrator";
import {
  assertDevelopmentEnvironment,
  assertSupabaseRunning,
  loadServiceEnvironment,
} from "./dev-worktree/preflight";
import {
  formatDryRunPlan,
  parseDevWorktreeArgs,
  selectSimulator,
} from "./dev-worktree/runtime";
import {
  closeSimulatorSession,
  createSimulatorSessionName,
  developmentBuildCommand,
  hasDevelopmentBuild,
  listIosSimulators,
  openSimulatorSession,
} from "./dev-worktree/simulator";
import {
  launchDevelopmentServices,
  redactLogLine,
} from "./dev-worktree/supervisor";
import {
  assertCompatibleAgentDevice,
  checkSupabaseStatus,
  commandOutput,
  createShutdownSignal,
  isPortAvailable,
  isProcessAlive,
  resolveRepositoryContext,
  spawnServiceProcess,
  waitForUrl,
} from "./dev-worktree/system";

async function main() {
  const options = parseDevWorktreeArgs(process.argv.slice(2));
  const { repoId, worktreeRoot } = await resolveRepositoryContext(
    process.cwd()
  );
  const assignmentPath = path.join(
    worktreeRoot,
    ".flyn-runtime",
    "assignment.json"
  );
  const globalRuntimeDir = path.join(os.tmpdir(), "flyn-runtime", repoId);
  const [apiEnvironment, mobileEnvironment] = await Promise.all([
    loadServiceEnvironment(
      path.join(worktreeRoot, "apps/api/.env.local"),
      process.env
    ),
    loadServiceEnvironment(
      path.join(worktreeRoot, "apps/mobile/.env.local"),
      process.env
    ),
  ]);
  assertDevelopmentEnvironment({ apiEnvironment, mobileEnvironment });
  await assertSupabaseRunning(() => checkSupabaseStatus(worktreeRoot));

  const agentDeviceVersion = await commandOutput(["agent-device", "--version"]);
  assertCompatibleAgentDevice(agentDeviceVersion);
  const [assignment, availableSimulators] = await Promise.all([
    readRuntimeAssignment(assignmentPath),
    listIosSimulators(),
  ]);
  const device = selectSimulator({
    available: availableSimulators,
    requested: options.device,
    storedId: options.device ? undefined : assignment?.device.id,
  });
  const reservation = await reserveRuntime({
    assignmentPath,
    device,
    dryRun: options.dryRun,
    globalRuntimeDir,
    isPortAvailable,
    isProcessAlive,
    pid: process.pid,
    requestedSlot: options.slot,
    worktreeRoot,
  });
  const { plan } = reservation;

  if (options.dryRun) {
    process.stdout.write(
      `${formatDryRunPlan(plan, worktreeRoot)}\n[runtime] dry-run: assignment, lock, child process를 변경하지 않았습니다.\n`
    );
    return;
  }

  process.stdout.write(
    `[runtime] slot ${plan.slot} · API ${plan.apiPort} · Metro ${plan.metroPort} · ${plan.device.name} (${plan.device.id})\n`
  );

  if (!(await hasDevelopmentBuild(plan.device.id))) {
    await reservation.release();
    throw new Error(
      `Simulator에 com.odd.flyn development build가 없습니다.\n${developmentBuildCommand(
        plan.device.id,
        plan.metroPort
      )}`
    );
  }

  const sessionName = createSimulatorSessionName(repoId, plan.slot);
  const shutdownSignal = createShutdownSignal();

  try {
    await runRuntimeSession({
      closeSimulator: () => closeSimulatorSession(sessionName),
      launchServices: () =>
        launchDevelopmentServices({
          apiEnvironment,
          mobileEnvironment,
          plan,
          spawn: spawnServiceProcess,
          waitForUrl,
          worktreeRoot,
          writeLog: (line) => {
            process.stdout.write(`${line}\n`);
          },
        }),
      onCleanupError: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(
          `[runtime] cleanup 경고: ${redactLogLine(message)}\n`
        );
      },
      openSimulator: () => openSimulatorSession({ plan, sessionName }),
      reservation,
      waitForSignal: () => shutdownSignal.promise,
    });
  } finally {
    shutdownSignal.dispose();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[runtime] ${redactLogLine(message)}\n`);
  process.exitCode = 1;
});
