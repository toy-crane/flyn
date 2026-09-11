import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "bun";
import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

const VERSION = /^\d{14}$/;
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
    .map((name) => name.slice(0, 14));
  return new SupabaseDatabaseDelivery({
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

interface DatabaseDeliveryOptions {
  /** Migration versions in the checkout, oldest first. */
  migrations: string[];
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
        (version, index) =>
          !VERSION.test(version) ||
          (index > 0 && version <= (options.migrations[index - 1] ?? ""))
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
    const pending: string[] = [];
    for (const [index, version] of this.options.migrations.entries()) {
      const row = result.migrations[index];
      if (
        !row ||
        row.local !== version ||
        (row.remote !== "" && row.remote !== version) ||
        (pending.length > 0 && row.remote !== "")
      ) {
        throw new Error("로컬과 원격 마이그레이션 순서가 다릅니다.");
      }
      if (row.remote === "") {
        pending.push(version);
      }
    }
    return pending;
  }

  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    const pending = await this.pending(request);
    if (pending.length > 0) {
      // Unapplied migrations mean nothing has started, not work in flight.
      // A receipt here would make the caller wait for a push it never made.
      return { remoteId: request.remoteId, status: "pending" };
    }
    return {
      remoteId: request.remoteId ?? this.options.receiptId,
      status: "success",
    };
  }

  async start(request: DeliveryRequest): Promise<DeliveryObservation> {
    // The human gate is the pull request merge, and a statement that drops
    // data also needed an approval label there. Reaching this line means the
    // change was already approved.
    const pending = await this.pending(request);
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
