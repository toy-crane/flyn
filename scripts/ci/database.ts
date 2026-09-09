import { spawnSync } from "bun";
import { verifyDatabase } from "./database-verify";

function git(...args: string[]): string {
  const result = spawnSync(["git", ...args]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString());
  }
  return result.stdout.toString();
}

function plan(base: string, head: string) {
  const from = git("rev-parse", "--verify", `${base}^{commit}`).trim();
  const to = git("rev-parse", "--verify", `${head}^{commit}`).trim();
  const paths = git("diff", "--name-only", "--no-renames", "-z", from, to)
    .split("\0")
    .filter(Boolean);
  const changedHistory = git(
    "diff",
    "--name-only",
    "--no-renames",
    "--diff-filter=MDT",
    "-z",
    from,
    to,
    "--",
    "supabase/migrations/"
  )
    .split("\0")
    .filter(Boolean);
  if (changedHistory.length > 0) {
    throw new Error(
      `기존 마이그레이션을 수정하거나 삭제할 수 없습니다: ${changedHistory.join(", ")}`
    );
  }
  const database = paths.some(
    (path) =>
      path.startsWith("supabase/") ||
      path.startsWith("packages/supabase/") ||
      path.startsWith("scripts/ci/") ||
      path.startsWith("scripts/integration/") ||
      path.startsWith(".github/workflows/") ||
      ["package.json", "bun.lock", "scripts/package.json"].includes(path)
  );
  console.log(JSON.stringify({ database }));
}

const [command, baseRef, headRef] = process.argv.slice(2);
if (command === "verify") {
  await verifyDatabase();
} else if (command === "plan" && baseRef && headRef) {
  plan(baseRef, headRef);
} else {
  throw new Error(
    "사용법: bun scripts/ci/database.ts plan <base> <head> | verify"
  );
}
