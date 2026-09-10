import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";
import { edgeFunctionConfigurationChanged } from "./edge-readiness";

test("로컬 Supabase 설정은 건너뛰고 함수 설정만 Edge 변경으로 본다", () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-edge-config-"));
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
    mkdirSync(join(root, "supabase"), { recursive: true });
    const config = join(root, "supabase/config.toml");
    writeFileSync(
      config,
      "[api]\nport=54321\n[functions.delete-account]\nverify_jwt=false\n"
    );
    git("add", ".");
    git("commit", "-qm", "base");
    const base = git("rev-parse", "HEAD");

    writeFileSync(
      config,
      "[api]\nport=59999\n[functions.delete-account]\nverify_jwt=false\n"
    );
    git("add", ".");
    git("commit", "-qm", "local port");
    const local = git("rev-parse", "HEAD");
    expect(edgeFunctionConfigurationChanged(base, local, root)).toBe(false);

    writeFileSync(
      config,
      "[api]\nport=59999\n[functions.delete-account]\nverify_jwt=true\n"
    );
    git("add", ".");
    git("commit", "-qm", "function config");
    const head = git("rev-parse", "HEAD");
    expect(edgeFunctionConfigurationChanged(local, head, root)).toBe(true);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("기준 커밋이 없으면 함수 설정을 바뀐 것으로 본다", () => {
  expect(edgeFunctionConfigurationChanged(null, "HEAD")).toBe(true);
});
