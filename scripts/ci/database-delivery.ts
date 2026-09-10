import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "bun";
import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

const VERSION = /^\d{14}$/;
const HASH = /^[a-f0-9]{64}$/;
const SHA = /^[a-f0-9]{40}$/;
const MIGRATION_FILE = /^\d{14}_.+\.sql$/;
const PROJECT = "owtajtnfleiobyfocdjy";

export function loadDatabaseDelivery({
  sha,
  receiptId,
  root = process.cwd(),
}: {
  sha: string;
  receiptId: string;
  root?: string;
}) {
  const git = (...args: string[]) => {
    const result = spawnSync(["git", ...args], { cwd: root });
    if (result.exitCode !== 0) {
      throw new Error("DB 배포 체크아웃을 확인하지 못했습니다.");
    }
    return result.stdout.toString().trim();
  };
  if (
    git("rev-parse", "HEAD") !== sha ||
    git("status", "--porcelain", "--untracked-files=all", "--", "supabase")
  ) {
    throw new Error("DB 배포 체크아웃이 대상 커밋과 다릅니다.");
  }
  const migrations = readdirSync(join(root, "supabase/migrations"))
    .filter((name) => MIGRATION_FILE.test(name))
    .sort()
    .map((name) => ({
      hash: createHash("sha256")
        .update(readFileSync(join(root, "supabase/migrations", name)))
        .digest("hex"),
      version: name.slice(0, 14),
    }));
  const approvalPath = join(root, "supabase/deployment-approvals.json");
  const rawApprovals: unknown = existsSync(approvalPath)
    ? JSON.parse(readFileSync(approvalPath, "utf8"))
    : {};
  if (
    !rawApprovals ||
    Array.isArray(rawApprovals) ||
    typeof rawApprovals !== "object"
  ) {
    throw new Error("DB 자동 배포 승인 목록이 올바르지 않습니다.");
  }
  const approved: Record<string, string> = {};
  for (const [version, hash] of Object.entries(rawApprovals)) {
    if (
      !VERSION.test(version) ||
      typeof hash !== "string" ||
      !HASH.test(hash)
    ) {
      throw new Error("DB 자동 배포 승인 해시가 올바르지 않습니다.");
    }
    approved[version] = hash;
  }
  return new SupabaseDatabaseDelivery({
    approved,
    migrations,
    receiptId,
    run: async (args) => {
      if (
        readFileSync(
          join(root, "supabase/.temp/project-ref"),
          "utf8"
        ).trim() !== PROJECT
      ) {
        throw new Error("Flyn 운영 프로젝트 연결이 필요합니다.");
      }
      const child = spawn(
        [join(root, "node_modules/.bin/supabase"), ...args, "--agent", "no"],
        {
          cwd: root,
          stderr: "pipe",
          stdout: "pipe",
        }
      );
      const [stdout, , code] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      if (code !== 0) {
        // CLI diagnostics may contain connection details. Keep them out of CI logs.
        throw new Error(
          `Supabase ${args[0]} ${args[1]} 실패. 원격 이력을 다시 확인해야 합니다.`
        );
      }
      return stdout;
    },
    sha,
  });
}

export interface DatabaseMigration {
  hash: string;
  version: string;
}

interface DatabaseDeliveryOptions {
  approved: Record<string, string>;
  migrations: DatabaseMigration[];
  receiptId: string;
  run: (args: string[]) => Promise<string>;
  sha: string;
}

export class SupabaseDatabaseDelivery {
  private readonly options: DatabaseDeliveryOptions;

  constructor(options: DatabaseDeliveryOptions) {
    this.options = options;
    if (
      !(SHA.test(options.sha) && options.receiptId) ||
      options.migrations.length === 0 ||
      options.migrations.some(
        (migration, index) =>
          !(VERSION.test(migration.version) && HASH.test(migration.hash)) ||
          (index > 0 &&
            migration.version <= (options.migrations[index - 1]?.version ?? ""))
      )
    ) {
      throw new Error("배포 커밋과 마이그레이션 이력이 올바르지 않습니다.");
    }
  }

  private async pending(request: DeliveryRequest) {
    if (request.service !== "database" || request.sha !== this.options.sha) {
      throw new Error("검증한 DB 배포 커밋과 요청이 다릅니다.");
    }
    const result = JSON.parse(
      await this.options.run([
        "migration",
        "list",
        "--linked",
        "--output-format",
        "json",
      ])
    );
    if (
      !Array.isArray(result.migrations) ||
      result.migrations.length !== this.options.migrations.length
    ) {
      throw new Error("원격 마이그레이션 이력을 확인하지 못했습니다.");
    }
    const pending: DatabaseMigration[] = [];
    for (const [index, migration] of this.options.migrations.entries()) {
      const row = result.migrations[index];
      if (
        !row ||
        row.local !== migration.version ||
        (row.remote !== "" && row.remote !== migration.version) ||
        (pending.length > 0 && row.remote !== "")
      ) {
        throw new Error("로컬과 원격 마이그레이션 순서가 다릅니다.");
      }
      if (row.remote === "") {
        pending.push(migration);
      }
    }
    return pending;
  }

  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    const pending = await this.pending(request);
    return {
      remoteId: request.remoteId ?? this.options.receiptId,
      status: pending.length === 0 ? "success" : "pending",
    };
  }

  async prepare(request: DeliveryRequest) {
    const pending = await this.pending(request);
    for (const migration of pending) {
      if (this.options.approved[migration.version] !== migration.hash) {
        throw new Error(`검토한 SQL 해시가 필요합니다: ${migration.version}`);
      }
    }
    return pending;
  }

  async start(request: DeliveryRequest): Promise<DeliveryObservation> {
    const pending = await this.prepare(request);
    if (pending.length > 0) {
      await this.options.run([
        "db",
        "push",
        "--linked",
        "--yes",
        "--output-format",
        "json",
      ]);
    }
    return this.inspect(request);
  }
}
