import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";
import {
  databaseReviewRequired,
  edgeConfigurationReviewRequired,
  productionReviewEnvironments,
} from "./production-review";

test("DB 마이그레이션과 운영 함수 설정만 별도 승인을 요구한다", () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-production-review-"));
  const git = (...args: string[]) => {
    const result = spawnSync(["git", ...args], { cwd: root });
    if (result.exitCode !== 0) {
      throw new Error(result.stderr.toString());
    }
    return result.stdout.toString().trim();
  };
  try {
    git("init", "-q");
    git("config", "user.name", "Fixture");
    git("config", "user.email", "fixture@example.test");
    git("config", "commit.gpgsign", "false");
    mkdirSync(join(root, "supabase/migrations"), { recursive: true });
    writeFileSync(
      join(root, "supabase/config.toml"),
      "[api]\nport=54321\n[functions.delete-account]\nverify_jwt=true\n"
    );
    writeFileSync(
      join(root, "supabase/migrations/20260101000000_base.sql"),
      "select 1;\n"
    );
    git("add", ".");
    git("commit", "-qm", "base");
    const base = git("rev-parse", "HEAD");

    writeFileSync(
      join(root, "supabase/config.toml"),
      "[api]\nport=59999\n[functions.delete-account]\nverify_jwt=true\n"
    );
    git("add", ".");
    git("commit", "-qm", "local config");
    const localConfig = git("rev-parse", "HEAD");
    expect(databaseReviewRequired(base, localConfig, root)).toBe(false);
    expect(edgeConfigurationReviewRequired(base, localConfig, root)).toBe(
      false
    );

    writeFileSync(
      join(root, "supabase/migrations/20260102000000_new.sql"),
      "select 2;\n"
    );
    git("add", ".");
    git("commit", "-qm", "migration");
    const migration = git("rev-parse", "HEAD");
    expect(databaseReviewRequired(localConfig, migration, root)).toBe(true);
    expect(edgeConfigurationReviewRequired(localConfig, migration, root)).toBe(
      false
    );

    writeFileSync(
      join(root, "supabase/config.toml"),
      "[api]\nport=59999\n[functions.delete-account]\nverify_jwt=false\n"
    );
    git("add", ".");
    git("commit", "-qm", "function config");
    const functionConfig = git("rev-parse", "HEAD");
    expect(databaseReviewRequired(migration, functionConfig, root)).toBe(false);
    expect(
      edgeConfigurationReviewRequired(migration, functionConfig, root)
    ).toBe(true);
    expect(
      productionReviewEnvironments(localConfig, functionConfig, root)
    ).toEqual({
      database: "flyn-production-review",
      edge: "flyn-production-review",
    });
    expect(productionReviewEnvironments(migration, migration, root)).toEqual({
      database: "flyn-production-automatic",
      edge: "flyn-production-automatic",
    });
    expect(productionReviewEnvironments(null, functionConfig, root)).toEqual({
      database: "flyn-production-review",
      edge: "flyn-production-review",
    });
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
