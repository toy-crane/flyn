import { spawnSync } from "bun";

export const edgePaths = [
  "supabase/functions",
  "packages",
  "package.json",
  "bun.lock",
  "tsconfig.json",
  ":(exclude)**/README.md",
];

export function edgeChanged(base: string | null, sha: string) {
  if (!base) {
    return true;
  }
  if (
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha]).exitCode !== 0
  ) {
    throw new Error("Edge 성공 커밋보다 이전 버전은 배포하지 않습니다.");
  }
  const diff = spawnSync([
    "git",
    "diff",
    "--quiet",
    base,
    sha,
    "--",
    ...edgePaths,
  ]);
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
