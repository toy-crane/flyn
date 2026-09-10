import { expect, test } from "bun:test";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "bun";
import { SupabaseDatabaseDelivery } from "./database-delivery";

const runtimeTest =
  process.env.RUN_DATABASE_DELIVERY_TESTS === "1" ? test : test.skip;

runtimeTest(
  "실제 DB 적용 응답을 잃어도 이력을 조회해 중복 적용 없이 복구한다",
  async () => {
    const root = mkdtempSync(join(tmpdir(), "flyn-delivery-db-"));
    const id = `flyn-delivery-${randomUUID().slice(0, 8)}`;
    const server = createServer();
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("임시 DB 포트를 확인하지 못했습니다.");
    }
    const { port } = address;
    await new Promise<void>((done) => server.close(() => done()));
    const env = {
      DOCKER_HOST: process.env.DOCKER_HOST,
      PATH: process.env.PATH,
    };
    const cli = resolve(import.meta.dir, "../../node_modules/.bin/supabase");
    const run = async (args: string[]) => {
      const child = spawn([cli, ...args, "--workdir", root, "--agent", "no"], {
        cwd: root,
        env,
        stderr: "pipe",
        stdout: "pipe",
      });
      const [stdout, stderr, code] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      if (code !== 0) {
        throw new Error(`임시 DB CLI 실패: ${stderr}`);
      }
      return stdout;
    };
    mkdirSync(join(root, "supabase/migrations"), { recursive: true });
    writeFileSync(
      join(root, "supabase/config.toml"),
      `project_id = "${id}"\n[db]\nport = ${port}\nmajor_version = 17\n[db.seed]\nenabled = false\n`
    );
    try {
      await run(["db", "start"]);
      const sql =
        "create table public.delivery_probe (id integer primary key); insert into public.delivery_probe values (1);";
      const version = "20990101000000";
      const hash = createHash("sha256").update(sql).digest("hex");
      writeFileSync(
        join(root, `supabase/migrations/${version}_probe.sql`),
        sql
      );
      let pushes = 0;
      const delivery = new SupabaseDatabaseDelivery({
        approved: { [version]: hash },
        migrations: [{ hash, version }],
        receiptId: `local:${id}`,
        run: async (args) => {
          const output = await run(
            args.map((arg) => (arg === "--linked" ? "--local" : arg))
          );
          if (args[0] === "db") {
            pushes += 1;
            throw new Error("응답 유실");
          }
          return output;
        },
        sha: "a".repeat(40),
      });
      const request = {
        remoteId: null,
        requestId: "fixture",
        service: "database" as const,
        sha: "a".repeat(40),
      };
      await expect(delivery.start(request)).rejects.toThrow("응답 유실");
      expect((await delivery.inspect(request)).status).toBe("success");
      expect((await delivery.start(request)).status).toBe("success");
      expect(pushes).toBe(1);
    } finally {
      await run(["stop", "--no-backup"]);
      rmSync(root, { force: true, recursive: true });
    }
  },
  180_000
);
