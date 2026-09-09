import { randomUUID } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { spawn, TOML } from "bun";

const PROJECT_ID = /^project_id\s*=.*$/m;
const DB_PORT = /(\[db\][\s\S]*?\nport\s*=\s*)\d+/;
const SHADOW_PORT = /(shadow_port\s*=\s*)\d+/;

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", done);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("임시 DB 포트를 배정하지 못했습니다.");
  }
  await new Promise<void>((done) => server.close(() => done()));
  return address.port;
}

export async function verifyDatabase(root = process.cwd()): Promise<void> {
  const temporary = mkdtempSync(join(tmpdir(), "flyn-db-ci-"));
  const target = join(temporary, "supabase");
  const source = join(root, "supabase");
  const cli = join(root, "node_modules/.bin/supabase");
  const id = `flyn-ci-${randomUUID().slice(0, 8)}`;
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !(
          key.startsWith("SUPABASE_") ||
          key.startsWith("PG") ||
          key === "DATABASE_URL"
        )
    )
  );
  const run = async (args: string[], capture = false) => {
    const child = spawn(
      [
        cli,
        ...args,
        "--workdir",
        temporary,
        "--agent",
        "no",
        "--output-format",
        "text",
      ],
      {
        cwd: temporary,
        env,
        stderr: "inherit",
        stdout: capture ? "pipe" : "inherit",
      }
    );
    const output = capture ? await new Response(child.stdout).text() : "";
    if ((await child.exited) !== 0) {
      throw new Error(`DB 검증 실패: supabase ${args.join(" ")}`);
    }
    return output;
  };
  let verificationError: unknown;
  try {
    mkdirSync(target);
    let config = readFileSync(join(source, "config.toml"), "utf8");
    const parsed = TOML.parse(config) as {
      db: { seed: { sql_paths: string[] } };
    };
    config = config.replace(PROJECT_ID, `project_id = "${id}"`);
    const dbPort = await freePort();
    const shadowPort = await freePort();
    config = config
      .replace(DB_PORT, `$1${dbPort}`)
      .replace(SHADOW_PORT, `$1${shadowPort}`);
    const isolated = TOML.parse(config) as {
      project_id: string;
      db: { port: number; shadow_port: number };
    };
    if (
      isolated.project_id !== id ||
      isolated.db.port !== dbPort ||
      isolated.db.shadow_port !== shadowPort ||
      dbPort === shadowPort
    ) {
      throw new Error(
        "임시 프로젝트 ID와 포트를 확인하지 못해 DB를 시작하지 않습니다."
      );
    }
    writeFileSync(join(target, "config.toml"), config);
    for (const directory of ["migrations", "schemas", "tests", "templates"]) {
      cpSync(join(source, directory), join(target, directory), {
        recursive: true,
      });
    }
    for (const seed of parsed.db.seed.sql_paths) {
      const path = resolve(source, seed);
      if (!(path.startsWith(`${source}${sep}`) && existsSync(path))) {
        throw new Error(
          `CI seed는 supabase 내부의 실제 파일이어야 합니다: ${seed}`
        );
      }
      const destination = resolve(target, seed);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(path, destination);
    }
    console.log(`격리된 DB 검증: ${id} (port ${dbPort})`);
    await run(["db", "start"]);
    await run(["db", "reset", "--local", "--yes"]);
    await run([
      "db",
      "lint",
      "--local",
      "--schema",
      "public",
      "--level",
      "error",
      "--fail-on",
      "error",
    ]);
    await run(["test", "db"]);
    const generated = await run(
      ["gen", "types", "typescript", "--local"],
      true
    );
    const committed = readFileSync(
      join(root, "packages/supabase/src/database.types.ts"),
      "utf8"
    );
    if (generated.trim() !== committed.trim()) {
      throw new Error(
        "DB 생성 타입이 커밋한 타입과 다릅니다. bun run db:types로 갱신하세요."
      );
    }
    const diff = await run(["db", "diff", "--schema", "public"], true);
    if (diff.trim()) {
      console.error(diff);
      throw new Error("선언형 스키마와 마이그레이션이 다릅니다.");
    }
    console.log("DB 마이그레이션·lint·pgTAP·타입·스키마 검증 통과");
  } catch (error) {
    verificationError = error;
  }
  // Only the unique project created above is stopped; preserve recovery config on cleanup failure.
  let cleanupError: unknown;
  try {
    if (existsSync(join(target, "config.toml"))) {
      await run(["stop", "--no-backup"]);
    }
    rmSync(temporary, { force: true, recursive: true });
  } catch (error) {
    cleanupError = error;
    console.error(
      `임시 DB 정리에 실패했습니다. 복구 설정을 보존합니다: ${temporary}`
    );
  }
  if (verificationError || cleanupError) {
    throw new AggregateError(
      [verificationError, cleanupError].filter(Boolean),
      "DB 검증 또는 정리 실패"
    );
  }
}
