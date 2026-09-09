import { spawnSync } from "bun";

const SERVICES = ["database", "edge", "api", "mobile"] as const;
const SHA = /^[a-f0-9]{40}$/;

function git(...args: string[]) {
  const result = spawnSync(["git", ...args]);
  if (result.exitCode !== 0) {
    throw new Error("배포 기준 커밋을 확인하지 못했습니다.");
  }
  return result.stdout.toString().trim();
}

function commit(value: string | undefined) {
  if (!(value && SHA.test(value))) {
    throw new Error("배포 대상과 서비스별 마지막 성공 SHA 4개가 필요합니다.");
  }
  return git("rev-parse", "--verify", `${value}^{commit}`);
}

function plan(args: string[]) {
  if (args.length !== 5) {
    throw new Error(
      "plan <target> <database> <edge> <api> <mobile> SHA가 필요합니다."
    );
  }
  const sha = commit(args[0]);
  const result: {
    sha: string;
    database: string[];
    edge: string[];
    api: string[];
    mobile: string[];
    manual: string[];
  } = { api: [], database: [], edge: [], manual: [], mobile: [], sha };
  for (const [index, service] of SERVICES.entries()) {
    const base = commit(args[index + 1]);
    git("merge-base", "--is-ancestor", base, sha);
    const files = git(
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      base,
      sha,
      "--"
    )
      .split("\0")
      .filter(Boolean);
    if (service === "database") {
      result.manual = files.filter(
        (path) =>
          path === "supabase/config.toml" ||
          path === "supabase/seed.sql" ||
          path === "supabase/seed-story-covers.sql" ||
          path.startsWith("supabase/story-covers/") ||
          path.startsWith("supabase/templates/") ||
          path.startsWith("supabase/seeds/")
      );
    }
    result[service] = files.filter((path) => {
      if (
        path.startsWith("docs/") ||
        path === "README.md" ||
        path.endsWith("/README.md")
      ) {
        return false;
      }
      if (service === "database") {
        return path.startsWith("supabase/migrations/");
      }
      if (
        path.startsWith("packages/") ||
        ["package.json", "bun.lock", "tsconfig.json"].includes(path)
      ) {
        return true;
      }
      if (service === "edge") {
        return path.startsWith("supabase/functions/");
      }
      return path.startsWith(`apps/${service}/`);
    });
  }
  return result;
}

try {
  if (process.argv[2] !== "plan") {
    throw new Error(
      "지원하는 명령은 plan입니다. 이 명령은 원격 서비스를 변경하지 않습니다."
    );
  }
  console.log(JSON.stringify(plan(process.argv.slice(3))));
} catch (error) {
  console.error(error instanceof Error ? error.message : "배포 대상 판정 실패");
  process.exitCode = 1;
}
