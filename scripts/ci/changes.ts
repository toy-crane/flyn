import { join } from "node:path";
import { spawnSync } from "bun";

/** Workspace packages whose deploy target is a service. */
const servicePackages = {
  api: "@repo/api",
  mobile: "@repo/mobile",
} as const;

/** Files outside any workspace package that still change what the checks prove. */
const infrastructurePrefixes = [".github/", "scripts/"];
const infrastructureFiles = [
  "biome.jsonc",
  "bun.lock",
  "package.json",
  "tsconfig.json",
  "turbo.json",
];

export interface ChangeInputs {
  /** Package names reported by `turbo query affected`. */
  affected: string[];
  /** Paths changed between the base commit and this commit. */
  paths: string[];
}

export interface ChangePlan {
  api: boolean;
  database: boolean;
  edge: boolean;
  mobile: boolean;
  validate: boolean;
}

function documentation(path: string) {
  return (
    path.startsWith("docs/") ||
    path === "README.md" ||
    path.endsWith("/README.md")
  );
}

export function planChanges({ affected, paths }: ChangeInputs): ChangePlan {
  const code = paths.filter((path) => !documentation(path));
  const database = code.some((path) => path.startsWith("supabase/migrations/"));
  // Edge functions resolve their imports through Deno, never through workspace packages.
  const edge = code.some(
    (path) =>
      path.startsWith("supabase/functions/") || path === "supabase/config.toml"
  );
  const infrastructure = code.some(
    (path) =>
      infrastructurePrefixes.some((prefix) => path.startsWith(prefix)) ||
      infrastructureFiles.includes(path)
  );
  return {
    api: affected.includes(servicePackages.api),
    database,
    edge,
    mobile: affected.includes(servicePackages.mobile),
    validate: affected.length > 0 || infrastructure || database || edge,
  };
}

/** Resolved from this file so the judgment works from any working directory. */
export const repoRoot = new URL("../../", import.meta.url).pathname;

function git(root: string, ...args: string[]) {
  const result = spawnSync(["git", ...args], { cwd: root });
  if (result.exitCode !== 0) {
    throw new Error("변경 판정에 필요한 Git 정보를 읽지 못했습니다.");
  }
  return result.stdout.toString();
}

/**
 * `turbo query affected` also counts uncommitted work, so a dirty checkout
 * would widen the judgment. Every CI job checks out a clean tree.
 */
export function requireCleanCheckout(root = repoRoot) {
  if (git(root, "status", "--porcelain").trim()) {
    throw new Error("변경 판정은 깨끗한 체크아웃에서만 정확합니다.");
  }
}

export function changedPaths(base: string, sha: string, root = repoRoot) {
  return git(root, "diff", "--name-only", "--no-renames", "-z", base, sha, "--")
    .split("\0")
    .filter(Boolean);
}

export function affectedPackages(base: string, sha: string, root = repoRoot) {
  const result = spawnSync(
    [
      join(repoRoot, "node_modules/.bin/turbo"),
      "query",
      "affected",
      "--base",
      base,
      "--head",
      sha,
    ],
    { cwd: root, env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" } }
  );
  if (result.exitCode !== 0) {
    throw new Error("영향받은 패키지를 확인하지 못했습니다.");
  }
  const parsed: unknown = JSON.parse(result.stdout.toString());
  const items = (parsed as { data?: { affectedTasks?: { items?: unknown } } })
    .data?.affectedTasks?.items;
  if (!Array.isArray(items)) {
    throw new Error("영향 판정 응답이 올바르지 않습니다.");
  }
  const names = new Set<string>();
  for (const item of items) {
    const name = (item as { package?: { name?: unknown } }).package?.name;
    if (typeof name !== "string" || !name) {
      throw new Error("영향 판정 응답에 패키지 이름이 없습니다.");
    }
    names.add(name);
  }
  return [...names].sort();
}
