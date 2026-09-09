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

function requireSql(to: string, version: string) {
  for (const file of ["before.sql", "after.test.sql"]) {
    const sqlPath = `supabase/upgrade-tests/${version}/${file}`;
    if (!git("show", `${to}:${sqlPath}`).trim()) {
      throw new Error(`보존 SQL이 비었습니다: ${sqlPath}`);
    }
  }
}

function upgradePlan(added: string[], paths: string[], to: string) {
  const upgrades: string[] = [];
  const versions = new Set(
    added.map((path) => path.split("/").at(-1)?.split("_")[0])
  );
  for (const path of paths) {
    const match = UPGRADE_PATH.exec(path);
    if (match) {
      versions.add(match[1]);
    }
  }
  for (const version of versions) {
    if (!(version && VERSION.test(version))) {
      throw new Error("잘못된 마이그레이션 버전입니다.");
    }
    const impactPath = `supabase/upgrade-tests/${version}/impact.json`;
    const found = spawnSync(["git", "show", `${to}:${impactPath}`]);
    if (found.exitCode !== 0) {
      throw new Error(
        `새 마이그레이션의 데이터 영향 설명이 필요합니다: ${impactPath}`
      );
    }
    const impact = JSON.parse(found.stdout.toString());
    if (
      !["none", "preserve"].includes(impact.impact) ||
      typeof impact.reason !== "string" ||
      !impact.reason.trim()
    ) {
      throw new Error(
        `데이터 영향은 none 또는 preserve와 이유를 적어야 합니다: ${impactPath}`
      );
    }
    if (impact.impact === "preserve") {
      requireSql(to, version);
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
