import path from "node:path";
import type { RuntimePlan } from "./allocator";

type Environment = Record<string, string | undefined>;

export interface ServiceSpec {
  command: string[];
  cwd: string;
  environment: Environment;
  name: "api" | "metro";
  port: number;
}

export interface ServiceProcess {
  exited: Promise<number>;
  name: string;
  stop: () => Promise<void>;
}

interface LaunchDevelopmentServicesOptions {
  apiEnvironment: Environment;
  mobileEnvironment: Environment;
  plan: RuntimePlan;
  shutdown?: Promise<NodeJS.Signals>;
  spawn: (spec: ServiceSpec, onLine: (line: string) => void) => ServiceProcess;
  waitForUrl: (url: string, timeoutMs: number) => Promise<void>;
  worktreeRoot: string;
  writeLog?: (line: string) => void;
}

export interface DevelopmentServices {
  stop: () => Promise<void>;
  waitForFailure: () => Promise<never>;
}

const SECRET_ASSIGNMENT =
  /\b((?:AI_GATEWAY_API_KEY|SUPABASE_SECRET_KEY|SUPABASE_JWKS)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,}]+)/giu;
const AUTHORIZATION_HEADER =
  /\b(authorization\s*:\s*)(?:bearer\s+)?[^\s,}]+/giu;

export class RuntimeShutdownError extends Error {
  constructor() {
    super("개발 런타임 종료 요청");
    this.name = "RuntimeShutdownError";
  }
}

function nodeOptionsWithIpv4DnsFirst(existing: string | undefined) {
  const option = "--dns-result-order=ipv4first";

  if (existing?.includes(option)) {
    return existing;
  }

  return [existing, option].filter(Boolean).join(" ");
}

export function redactLogLine(line: string) {
  return line
    .replace(SECRET_ASSIGNMENT, "$1[REDACTED]")
    .replace(AUTHORIZATION_HEADER, "$1[REDACTED]");
}

async function waitForService(
  service: ServiceProcess,
  url: string,
  timeoutMs: number,
  waitForUrl: LaunchDevelopmentServicesOptions["waitForUrl"],
  shutdown?: Promise<NodeJS.Signals>
) {
  const pending = [
    waitForUrl(url, timeoutMs),
    service.exited.then((code) => {
      throw new Error(
        `${service.name} process가 준비 전에 종료되었습니다(exit ${code}).`
      );
    }),
  ];

  if (shutdown) {
    pending.push(
      shutdown.then(() => {
        throw new RuntimeShutdownError();
      })
    );
  }

  await Promise.race(pending);
}

export async function launchDevelopmentServices(
  options: LaunchDevelopmentServicesOptions
): Promise<DevelopmentServices> {
  const processes: ServiceProcess[] = [];
  let stopPromise: Promise<void> | undefined;
  const stop = () => {
    stopPromise ??= Promise.all(processes.map((child) => child.stop())).then(
      () => undefined
    );
    return stopPromise;
  };
  const writeLog = options.writeLog ?? (() => undefined);
  const spawn = (spec: ServiceSpec) => {
    const service = options.spawn(spec, (line) => {
      writeLog(`[${spec.name}:${spec.port}] ${redactLogLine(line)}`);
    });
    processes.push(service);
    return service;
  };

  try {
    const api = spawn({
      command: ["bun", "run", "dev"],
      cwd: path.join(options.worktreeRoot, "apps/api"),
      environment: {
        ...options.apiEnvironment,
        PORT: String(options.plan.apiPort),
      },
      name: "api",
      port: options.plan.apiPort,
    });
    await waitForService(
      api,
      `http://127.0.0.1:${options.plan.apiPort}/health`,
      15_000,
      options.waitForUrl,
      options.shutdown
    );

    const metro = spawn({
      command: [
        "bunx",
        "expo",
        "start",
        "--dev-client",
        "--localhost",
        "--port",
        String(options.plan.metroPort),
      ],
      cwd: path.join(options.worktreeRoot, "apps/mobile"),
      environment: {
        ...options.mobileEnvironment,
        EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${options.plan.apiPort}`,
        NODE_OPTIONS: nodeOptionsWithIpv4DnsFirst(
          options.mobileEnvironment.NODE_OPTIONS
        ),
      },
      name: "metro",
      port: options.plan.metroPort,
    });
    await waitForService(
      metro,
      `http://127.0.0.1:${options.plan.metroPort}/status`,
      45_000,
      options.waitForUrl,
      options.shutdown
    );
  } catch (error) {
    await stop();
    throw error;
  }

  return {
    stop,
    waitForFailure: async () => {
      const failure = await Promise.race(
        processes.map((child) =>
          child.exited.then((code) => ({ code, name: child.name }))
        )
      );
      await stop();
      throw new Error(
        `${failure.name} process가 종료되었습니다(exit ${failure.code}).`
      );
    },
  };
}

interface ProcessGroupSystem {
  delay: (durationMs: number) => Promise<void>;
  isAlive: (pid: number) => boolean;
  kill: (pid: number, signal: NodeJS.Signals) => void;
}

export async function terminateProcessGroup(
  pid: number,
  system: ProcessGroupSystem
) {
  if (!system.isAlive(pid)) {
    return;
  }

  try {
    system.kill(-pid, "SIGTERM");
  } catch {
    return;
  }

  await system.delay(5000);

  if (system.isAlive(pid)) {
    try {
      system.kill(-pid, "SIGKILL");
    } catch {
      // 종료 경쟁에서 이미 끝난 process group은 성공으로 취급한다.
    }
  }
}
