import { spawnSync } from "bun";
import { edgeFunctionConfigurationChanged } from "./edge-readiness";

export const reviewEnvironment = "flyn-production-review";
export const automaticEnvironment = "flyn-production-automatic";

function pathChanged(
  base: string | null,
  sha: string,
  path: string,
  root: string
) {
  if (!base) {
    return true;
  }
  if (
    spawnSync(["git", "merge-base", "--is-ancestor", base, sha], {
      cwd: root,
    }).exitCode !== 0
  ) {
    throw new Error("운영 성공 커밋보다 이전 버전은 검토하지 않습니다.");
  }
  const result = spawnSync(["git", "diff", "--quiet", base, sha, "--", path], {
    cwd: root,
  });
  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw new Error("운영 검토 대상 변경을 확인하지 못했습니다.");
  }
  return result.exitCode === 1;
}

export function databaseReviewRequired(
  base: string | null,
  sha: string,
  root = process.cwd()
) {
  return pathChanged(base, sha, "supabase/migrations", root);
}

export function edgeConfigurationReviewRequired(
  base: string | null,
  sha: string,
  root = process.cwd()
) {
  return edgeFunctionConfigurationChanged(base, sha, root);
}

/**
 * Judged from the commit range alone, so the planning job needs no production
 * credentials. An extra approval is possible after a failed run; a missed one
 * is not.
 */
export function productionReviewEnvironments(
  base: string | null,
  sha: string,
  root = process.cwd()
) {
  return {
    database: databaseReviewRequired(base, sha, root)
      ? reviewEnvironment
      : automaticEnvironment,
    edge: edgeConfigurationReviewRequired(base, sha, root)
      ? reviewEnvironment
      : automaticEnvironment,
  };
}
