import { readFileSync } from "node:fs";
import { join } from "node:path";

const HEALTH_TIMEOUT_MS = 3000;
const SECTION_PATTERN = /^\s*\[([^\]]+)\]\s*$/;
const PORT_PATTERN = /^\s*port\s*=\s*(.*?)\s*(?:#.*)?$/;
const NUMBER_PATTERN = /^\d+$/;

/** Sections of `supabase/config.toml` whose `port` the repository reads. */
export type SupabasePortSection = "api" | "local_smtp";

/**
 * Only a literal number counts. An `env(...)` value would make the stack's
 * port depend on whichever shell started it, and every worktree and script
 * here has to agree on one number without starting the stack first.
 */
export function parseSupabasePort(
  contents: string,
  section: SupabasePortSection
): number {
  let inSection = false;

  for (const line of contents.split("\n")) {
    const heading = SECTION_PATTERN.exec(line);

    if (heading) {
      inSection = heading[1]?.trim() === section;
      continue;
    }

    if (!inSection) {
      continue;
    }

    const match = PORT_PATTERN.exec(line);

    if (!match) {
      continue;
    }

    const value = match[1] ?? "";

    if (!NUMBER_PATTERN.test(value)) {
      throw new Error(
        `supabase/config.toml의 [${section}] port가 숫자가 아닙니다: ${value}. 포트는 숫자로 적어야 합니다.`
      );
    }

    return Number.parseInt(value, 10);
  }

  throw new Error(
    `supabase/config.toml에서 [${section}] port를 찾지 못했습니다.`
  );
}

/**
 * Every worktree shares one local stack, so the port comes from the committed
 * config rather than a constant that would drift the moment it is changed.
 */
export function readSupabasePort(
  repositoryRoot: string,
  section: SupabasePortSection
): number {
  const file = join(repositoryRoot, "supabase", "config.toml");
  let contents: string;

  try {
    contents = readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`${file}을 읽지 못했습니다.`, { cause: error });
  }

  return parseSupabasePort(contents, section);
}

export function readSupabaseApiPort(repositoryRoot: string): number {
  return readSupabasePort(repositoryRoot, "api");
}

/** Mailpit's web interface, where the local stack leaves the mail it sends. */
export function readSupabaseMailpitPort(repositoryRoot: string): number {
  return readSupabasePort(repositoryRoot, "local_smtp");
}

/**
 * A port that answers is not enough — some other program could hold it. The
 * session must not start or reset the stack, so it only looks.
 */
export async function isSupabaseRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/auth/v1/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });

    return response.ok;
  } catch {
    return false;
  }
}
