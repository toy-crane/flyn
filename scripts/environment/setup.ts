import { lstatSync, readFileSync, symlinkSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseEnv } from "node:util";

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

function readEnvironmentValues(
  file: string
): Record<string, string | undefined> {
  let contents: string;

  try {
    contents = readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`${file}을 읽지 못했습니다.`, { cause: error });
  }

  try {
    return parseEnv(contents);
  } catch (error) {
    throw new Error(`${file}의 dotenv 형식을 확인해 주세요.`, {
      cause: error,
    });
  }
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
  scope?: "all" | "supabase";
}

export interface WorktreeEnvironmentResult {
  linked: string[];
  primaryRoot: string;
  reused: string[];
}

export async function prepareWorktreeEnvironment({
  cwd,
  scope = "all",
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

  const environmentFiles =
    scope === "supabase"
      ? ENVIRONMENT_FILES.filter((file) => file.path === "supabase/.env")
      : ENVIRONMENT_FILES;

  for (const file of environmentFiles) {
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
