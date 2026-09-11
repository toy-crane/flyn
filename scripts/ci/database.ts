import { spawnSync } from "bun";
import { verifyDatabase } from "./database-verify";

function git(...args: string[]): string {
  const result = spawnSync(["git", ...args]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString());
  }
  return result.stdout.toString();
}

const UPGRADE_PATH = /^supabase\/upgrade-tests\/(\d{14})\//;
const VERSION = /^\d{14}$/;
const PRESERVATION_FILES = ["before.sql", "after.test.sql"];

/**
 * A version has a data preservation case when its folder holds the two SQL
 * files. Whether a migration needs one is a review question, not a CI rule.
 */
function preservationCase(to: string, version: string) {
  const folder = `supabase/upgrade-tests/${version}/`;
  const present = new Set(
    git("ls-tree", "-r", "--name-only", to, "--", folder)
      .split("\n")
      .filter(Boolean)
      .map((path) => path.slice(folder.length))
  );
  const found = PRESERVATION_FILES.filter((file) => present.has(file));
  if (found.length === 0) {
    return false;
  }
  if (found.length !== PRESERVATION_FILES.length) {
    throw new Error(
      `보존 검사는 before.sql과 after.test.sql이 함께 있어야 합니다: ${folder}`
    );
  }
  for (const file of PRESERVATION_FILES) {
    if (!git("show", `${to}:${folder}${file}`).trim()) {
      throw new Error(`보존 SQL이 비었습니다: ${folder}${file}`);
    }
  }
  return true;
}

function upgradePlan(added: string[], paths: string[], to: string) {
  const versions = new Set(
    added.map((path) => path.split("/").at(-1)?.split("_")[0])
  );
  for (const path of paths) {
    const match = UPGRADE_PATH.exec(path);
    if (match) {
      versions.add(match[1]);
    }
  }
  const upgrades: string[] = [];
  for (const version of versions) {
    if (!(version && VERSION.test(version))) {
      throw new Error("잘못된 마이그레이션 버전입니다.");
    }
    if (preservationCase(to, version)) {
      upgrades.push(version);
    }
  }
  return versions.size ? upgrades : undefined;
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
  const added = git(
    "diff",
    "--name-only",
    "--diff-filter=A",
    from,
    to,
    "--",
    "supabase/migrations/"
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  const upgrades = upgradePlan(added, paths, to);
  const database = paths.some(
    (path) =>
      path.startsWith("supabase/") ||
      path.startsWith("packages/supabase/") ||
      path.startsWith("scripts/ci/") ||
      path.startsWith("scripts/integration/") ||
      path.startsWith(".github/workflows/") ||
      ["package.json", "bun.lock", "scripts/package.json"].includes(path)
  );
  return { database, ...(upgrades === undefined ? {} : { upgrades }) };
}

const [command, baseRef, headRef] = process.argv.slice(2);
if (command === "verify") {
  const upgrades =
    baseRef && headRef ? (plan(baseRef, headRef).upgrades ?? []) : [];
  await verifyDatabase(process.cwd(), upgrades);
} else if (command === "upgrade" && baseRef) {
  await verifyDatabase(process.cwd(), [baseRef], true);
} else if (command === "plan" && baseRef && headRef) {
  console.log(JSON.stringify(plan(baseRef, headRef)));
} else {
  throw new Error(
    "사용법: bun scripts/ci/database.ts plan <base> <head> | verify [base head] | upgrade <version>"
  );
}
