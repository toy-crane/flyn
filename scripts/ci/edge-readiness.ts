import { spawnSync, TOML } from "bun";

function stable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stable);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)])
    );
  }
  return value;
}

function functionConfiguration(ref: string, root: string) {
  const result = spawnSync(["git", "show", `${ref}:supabase/config.toml`], {
    cwd: root,
  });
  if (result.exitCode !== 0) {
    throw new Error("Edge 함수 설정을 읽지 못했습니다.");
  }
  const config = TOML.parse(result.stdout.toString()) as {
    functions?: unknown;
  };
  return JSON.stringify(stable(config.functions ?? {}));
}

/**
 * Only `[functions.*]` counts as a production Edge setting. Local ports and
 * Studio settings never gate a production deploy.
 */
export function edgeFunctionConfigurationChanged(
  base: string | null,
  sha: string,
  root = process.cwd()
) {
  return (
    !base ||
    functionConfiguration(base, root) !== functionConfiguration(sha, root)
  );
}
