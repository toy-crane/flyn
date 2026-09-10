import { spawnSync, TOML } from "bun";

export const edgePaths = [
  "supabase/functions",
  "packages",
  "package.json",
  "bun.lock",
  "tsconfig.json",
  ":(exclude)**/README.md",
];

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

export function edgeChanged(
  base: string | null,
  sha: string,
  root = process.cwd()
) {
  if (!base) {
    return true;
  }
  if (
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha], {
      cwd: root,
    }).exitCode !== 0
  ) {
    throw new Error("Edge 성공 커밋보다 이전 버전은 배포하지 않습니다.");
  }
  if (edgeFunctionConfigurationChanged(base, sha, root)) {
    return true;
  }
  const diff = spawnSync(
    ["git", "diff", "--quiet", base, sha, "--", ...edgePaths],
    { cwd: root }
  );
  if (diff.exitCode !== 0 && diff.exitCode !== 1) {
    throw new Error("Edge 변경 확인 실패");
  }
  return diff.exitCode === 1;
}

export function requireEdgeReady(base: string | null, sha: string) {
  if (edgeChanged(base, sha)) {
    throw new Error("이 커밋의 Edge Function을 먼저 배포해야 합니다.");
  }
}
