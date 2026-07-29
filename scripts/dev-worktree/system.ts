import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { spawn } from "bun";
import type { ServiceProcess, ServiceSpec } from "./supervisor";
import { terminateProcessGroup } from "./supervisor";

const SEMANTIC_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)/u;
const LINE_BREAK_PATTERN = /\r?\n/u;

function delay(durationMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export function deriveRepositoryId(gitCommonDirectory: string) {
  return createHash("sha256")
    .update(gitCommonDirectory)
    .digest("hex")
    .slice(0, 16);
}

export function assertCompatibleAgentDevice(versionOutput: string) {
  const match = versionOutput.trim().match(SEMANTIC_VERSION_PATTERN);

  if (!match) {
    throw new Error(
      `agent-device version을 확인할 수 없습니다: ${versionOutput.trim()}`
    );
  }

  const [, majorText, minorText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);

  if (major === 0 && minor < 20) {
    throw new Error("dev:worktree에는 agent-device 0.20.0 이상이 필요합니다.");
  }
}

export async function commandOutput(command: string[], cwd?: string) {
  const child = spawn(command, {
    cwd,
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
      `${command[0]} 명령이 실패했습니다(exit ${exitCode}): ${stderr.trim()}`
    );
  }

  return stdout.trim();
}

export async function resolveRepositoryContext(cwd: string) {
  const worktreeRoot = await commandOutput(
    ["git", "rev-parse", "--show-toplevel"],
    cwd
  );
  const rawCommonDirectory = await commandOutput(
    ["git", "rev-parse", "--git-common-dir"],
    worktreeRoot
  );
  const gitCommonDirectory = await realpath(
    path.resolve(worktreeRoot, rawCommonDirectory)
  );

  return {
    repoId: deriveRepositoryId(gitCommonDirectory),
    worktreeRoot,
  };
}

export function isProcessAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "EPERM"
    );
  }
}

export function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();
    server.unref();
    server.once("error", () => {
      resolve(false);
    });
    server.listen({ exclusive: true, host: "127.0.0.1", port }, () => {
      server.close((error) => {
        resolve(!error);
      });
    });
  });
}

export async function checkSupabaseStatus(worktreeRoot: string) {
  const child = spawn(["bunx", "supabase", "status"], {
    cwd: worktreeRoot,
    stderr: "ignore",
    stdout: "ignore",
  });
  return (await child.exited) === 0;
}

async function pumpLines(
  stream: ReadableStream<Uint8Array>,
  onLine: (line: string) => void
) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buffered = "";

  for (;;) {
    // 로그는 child가 출력할 때마다 순서대로 전달해야 한다.
    // biome-ignore lint/performance/noAwaitInLoops: stream reader contract
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffered += decoder.decode(value, { stream: true });
    const lines = buffered.split(LINE_BREAK_PATTERN);
    buffered = lines.pop() ?? "";
    for (const line of lines) {
      onLine(line);
    }
  }

  buffered += decoder.decode();

  if (buffered) {
    onLine(buffered);
  }
}

export function spawnServiceProcess(
  spec: ServiceSpec,
  onLine: (line: string) => void
): ServiceProcess {
  const child = spawn(spec.command, {
    cwd: spec.cwd,
    detached: true,
    env: spec.environment,
    stderr: "pipe",
    stdin: "ignore",
    stdout: "pipe",
  });
  pumpLines(child.stdout, onLine).catch((error: unknown) => {
    onLine(`stdout 읽기 실패: ${String(error)}`);
  });
  pumpLines(child.stderr, onLine).catch((error: unknown) => {
    onLine(`stderr 읽기 실패: ${String(error)}`);
  });

  return {
    exited: child.exited,
    name: spec.name,
    stop: () =>
      terminateProcessGroup(child.pid, {
        delay: (durationMs) =>
          Promise.race([delay(durationMs), child.exited.then(() => undefined)]),
        isAlive: isProcessAlive,
        kill: process.kill,
      }),
  };
}

export async function isReadyResponse(url: string, response: Response) {
  if (!response.ok) {
    return false;
  }

  if (url.endsWith("/status")) {
    return true;
  }

  if (url.endsWith("/health")) {
    const body = (await response.json()) as { status?: unknown };
    return body.status === "ok";
  }

  return true;
}

export async function waitForUrl(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const remainingMs = Math.max(1, deadline - Date.now());
      // readiness probe는 이전 요청 결과에 따라 다음 요청을 보낸다.
      // biome-ignore lint/performance/noAwaitInLoops: bounded readiness polling
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Math.min(1000, remainingMs)),
      });

      if (await isReadyResponse(url, response)) {
        return;
      }
    } catch {
      // 준비 중의 connection refusal와 요청 timeout은 재시도한다.
    }

    await delay(250);
  }

  throw new Error(`${url}이 ${timeoutMs / 1000}초 안에 준비되지 않았습니다.`);
}

export function createShutdownSignal() {
  let resolveSignal: (signal: NodeJS.Signals) => void = () => undefined;
  const promise = new Promise<NodeJS.Signals>((resolve) => {
    resolveSignal = resolve;
  });
  const onSigint = () => resolveSignal("SIGINT");
  const onSigterm = () => resolveSignal("SIGTERM");
  process.once("SIGINT", onSigint);
  process.once("SIGTERM", onSigterm);

  return {
    dispose: () => {
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigterm);
    },
    promise,
  };
}
