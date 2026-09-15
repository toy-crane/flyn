import { lstatSync, readFileSync, symlinkSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { readGitContext } from "../dev/adapters/git";

const ENVIRONMENT_FILES = [
  {
    path: "apps/api/.env.local",
    requiredKeys: [
      "AI_GATEWAY_API_KEY",
      "AI_GATEWAY_MODEL",
      "SUPABASE_URL",
      "SUPABASE_JWKS_URL",
      "SUPABASE_PUBLISHABLE_KEY",
    ],
  },
  {
    path: "apps/mobile/.env.local",
    requiredKeys: [
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "EXPO_PUBLIC_API_URL",
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
      "EXPO_PUBLIC_WEB_URL",
      "EXPO_PUBLIC_SUPPORT_EMAIL",
    ],
  },
  {
    path: "supabase/.env",
    requiredKeys: ["SUPABASE_AUTH_GOOGLE_CLIENT_IDS"],
  },
] as const;

const ENV_LINE_PATTERN =
  /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

function pathExists(path: string): boolean {
  try {
    lstatSync(path);

    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function readEnvironmentValues(file: string): Record<string, string> {
  let contents: string;

  try {
    contents = readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`${file}을 읽지 못했습니다.`, { cause: error });
  }

  const values: Record<string, string> = {};

  for (const line of contents.split("\n")) {
    const match = ENV_LINE_PATTERN.exec(line);

    if (!match?.[1]) {
      continue;
    }

    const raw = (match[2] ?? "").trim();
    const [quote] = raw;
    const isQuoted =
      (quote === '"' || quote === "'") && raw.length > 1 && raw.endsWith(quote);

    values[match[1]] = isQuoted
      ? raw.slice(1, -1).trim()
      : (raw.split(" #")[0] ?? "").trim();
  }

  return values;
}

function validateEnvironmentFile(
  file: string,
  relativePath: string,
  requiredKeys: readonly string[]
): void {
  const values = readEnvironmentValues(file);
  const missingKeys = requiredKeys.filter((key) => !values[key]?.trim());

  if (missingKeys.length > 0) {
    throw new Error(
      `${relativePath}에서 값이 필요한 키를 확인해 주세요: ${missingKeys.join(", ")}`
    );
  }
}

export interface PrepareWorktreeEnvironmentOptions {
  cwd: string;
}

export interface WorktreeEnvironmentResult {
  linked: string[];
  primaryRoot: string;
  reused: string[];
}

export async function prepareWorktreeEnvironment({
  cwd,
}: PrepareWorktreeEnvironmentOptions): Promise<WorktreeEnvironmentResult> {
  const git = await readGitContext(cwd);

  if (basename(git.commonDirectory) !== ".git") {
    throw new Error(
      `${git.commonDirectory}에서 기본 checkout을 안전하게 찾지 못했습니다. 일반 non-bare Git 저장소에서 실행해 주세요.`
    );
  }

  const primaryRoot = dirname(git.commonDirectory);
  const links: Array<{ source: string; target: string }> = [];
  const reused: string[] = [];

  for (const file of ENVIRONMENT_FILES) {
    const target = join(git.worktreePath, file.path);
    const source = join(primaryRoot, file.path);
    const targetExists = pathExists(target);
    const candidate = targetExists ? target : source;

    validateEnvironmentFile(candidate, file.path, file.requiredKeys);

    if (targetExists) {
      reused.push(file.path);
    } else {
      links.push({ source, target });
    }
  }

  for (const link of links) {
    symlinkSync(link.source, link.target);
  }

  return {
    linked: links.map((link) => link.target),
    primaryRoot,
    reused,
  };
}
