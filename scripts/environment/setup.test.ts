import { describe, expect, test } from "bun:test";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "bun";

import { prepareWorktreeEnvironment } from "./setup";

const ENV_FILES = {
  "apps/api/.env.local": [
    "AI_GATEWAY_API_KEY=test-key",
    "AI_GATEWAY_MODEL=openai/test-model",
    "SUPABASE_URL=http://127.0.0.1:54321",
    "SUPABASE_JWKS_URL=http://127.0.0.1:54321/auth/v1/.well-known/jwks.json",
    "SUPABASE_PUBLISHABLE_KEY=sb_publishable_test",
  ].join("\n"),
  "apps/mobile/.env.local": [
    "EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321",
    "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test",
    "EXPO_PUBLIC_API_URL=http://127.0.0.1:3901",
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=test-web.apps.googleusercontent.com",
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=test-ios.apps.googleusercontent.com",
    "EXPO_PUBLIC_WEB_URL=http://127.0.0.1:4321",
    "EXPO_PUBLIC_SUPPORT_EMAIL=support@example.com",
  ].join("\n"),
  "supabase/.env":
    "SUPABASE_AUTH_GOOGLE_CLIENT_IDS=test-web.apps.googleusercontent.com",
} as const;

function runGit(cwd: string, args: string[]): void {
  const result = spawnSync(["git", ...args], { cwd });

  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString());
  }
}

async function withLinkedWorktree(
  run: (paths: { primary: string; worktree: string }) => Promise<void>
): Promise<void> {
  const fixture = mkdtempSync(join(tmpdir(), "flyn-worktree-env-"));
  const primary = join(fixture, "primary");
  const worktree = join(fixture, "worktree");

  mkdirSync(primary);
  runGit(primary, ["init", "--initial-branch=main"]);
  runGit(primary, ["config", "user.email", "test@example.com"]);
  runGit(primary, ["config", "user.name", "Test"]);

  for (const relativePath of Object.keys(ENV_FILES)) {
    const directory = join(primary, relativePath, "..");

    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, ".gitkeep"), "");
  }

  runGit(primary, ["add", "."]);
  runGit(primary, ["commit", "-m", "fixture"]);
  runGit(primary, ["worktree", "add", "--detach", worktree, "HEAD"]);

  for (const [relativePath, contents] of Object.entries(ENV_FILES)) {
    writeFileSync(join(primary, relativePath), `${contents}\n`);
  }

  try {
    await run({ primary: realpathSync.native(primary), worktree });
  } finally {
    rmSync(fixture, { force: true, recursive: true });
  }
}

describe("prepareWorktreeEnvironment", () => {
  test("빠진 환경 파일을 기본 checkout의 원본에 연결한다", async () => {
    await withLinkedWorktree(async ({ primary, worktree }) => {
      await prepareWorktreeEnvironment({ cwd: worktree });

      for (const relativePath of Object.keys(ENV_FILES)) {
        expect(readlinkSync(join(worktree, relativePath))).toBe(
          join(primary, relativePath)
        );
      }
    });
  });

  test("필수 키가 비어 있으면 값을 숨기고 어떤 파일도 연결하지 않는다", async () => {
    await withLinkedWorktree(async ({ primary, worktree }) => {
      writeFileSync(
        join(primary, "apps/api/.env.local"),
        ENV_FILES["apps/api/.env.local"].replace(
          "AI_GATEWAY_MODEL=openai/test-model",
          "AI_GATEWAY_MODEL="
        )
      );

      const error = await prepareWorktreeEnvironment({ cwd: worktree }).catch(
        (cause: unknown) => cause
      );
      const message = error instanceof Error ? error.message : String(error);

      expect(message).toContain("apps/api/.env.local");
      expect(message).toContain("AI_GATEWAY_MODEL");
      expect(message).not.toContain("test-key");

      for (const relativePath of Object.keys(ENV_FILES)) {
        expect(existsSync(join(worktree, relativePath))).toBe(false);
      }
    });
  });

  test("Bun이 빈 값으로 읽는 주석과 따옴표 표기도 거부한다", async () => {
    await Promise.all(
      ["# TODO", " # TODO", '"" # TODO'].map((emptyValue) =>
        withLinkedWorktree(async ({ primary, worktree }) => {
          writeFileSync(
            join(primary, "apps/api/.env.local"),
            ENV_FILES["apps/api/.env.local"].replace(
              "AI_GATEWAY_MODEL=openai/test-model",
              `AI_GATEWAY_MODEL=${emptyValue}`
            )
          );

          await expect(
            prepareWorktreeEnvironment({ cwd: worktree })
          ).rejects.toThrow("AI_GATEWAY_MODEL");

          for (const relativePath of Object.keys(ENV_FILES)) {
            expect(existsSync(join(worktree, relativePath))).toBe(false);
          }
        })
      )
    );
  });

  test("Supabase 준비는 Supabase 파일만 연결하고 검사한다", async () => {
    await withLinkedWorktree(async ({ primary, worktree }) => {
      rmSync(join(primary, "apps/api/.env.local"));
      rmSync(join(primary, "apps/mobile/.env.local"));

      const result = await prepareWorktreeEnvironment({
        cwd: worktree,
        scope: "supabase",
      });

      expect(result.linked).toEqual([
        join(realpathSync.native(worktree), "supabase/.env"),
      ]);
      expect(existsSync(join(worktree, "apps/api/.env.local"))).toBe(false);
      expect(existsSync(join(worktree, "apps/mobile/.env.local"))).toBe(false);
      expect(readlinkSync(join(worktree, "supabase/.env"))).toBe(
        join(primary, "supabase/.env")
      );
    });
  });

  test("끊어진 기존 symlink가 있으면 다른 파일도 먼저 연결하지 않는다", async () => {
    await withLinkedWorktree(async ({ worktree }) => {
      const brokenLink = join(worktree, "apps/mobile/.env.local");

      symlinkSync(join(worktree, "missing-mobile-env"), brokenLink);

      await expect(
        prepareWorktreeEnvironment({ cwd: worktree })
      ).rejects.toThrow("apps/mobile/.env.local");
      expect(existsSync(join(worktree, "apps/api/.env.local"))).toBe(false);
      expect(readlinkSync(brokenLink)).toBe(
        join(worktree, "missing-mobile-env")
      );
      expect(existsSync(join(worktree, "supabase/.env"))).toBe(false);
    });
  });

  test("기존 일반 파일을 보존하고 반복 실행해도 연결을 바꾸지 않는다", async () => {
    await withLinkedWorktree(async ({ worktree }) => {
      const apiEnv = join(worktree, "apps/api/.env.local");
      const worktreeContents = `${ENV_FILES["apps/api/.env.local"]}\nWORKTREE_ONLY=yes\n`;

      writeFileSync(apiEnv, worktreeContents);

      const first = await prepareWorktreeEnvironment({ cwd: worktree });
      const second = await prepareWorktreeEnvironment({ cwd: worktree });

      expect(first.linked).toHaveLength(2);
      expect(readFileSync(apiEnv, "utf8")).toBe(worktreeContents);
      expect(lstatSync(apiEnv).isSymbolicLink()).toBe(false);
      expect(second.linked).toEqual([]);
      expect(second.reused).toEqual(Object.keys(ENV_FILES));
    });
  });

  test("원본 파일이 없으면 어떤 대상도 연결하지 않는다", async () => {
    await withLinkedWorktree(async ({ primary, worktree }) => {
      rmSync(join(primary, "supabase/.env"));

      await expect(
        prepareWorktreeEnvironment({ cwd: worktree })
      ).rejects.toThrow("supabase/.env");

      for (const relativePath of Object.keys(ENV_FILES)) {
        expect(existsSync(join(worktree, relativePath))).toBe(false);
      }
    });
  });

  test("기본 checkout에서는 원본 파일을 검사만 한다", async () => {
    await withLinkedWorktree(async ({ primary }) => {
      const result = await prepareWorktreeEnvironment({ cwd: primary });

      expect(result.linked).toEqual([]);
      expect(result.reused).toEqual(Object.keys(ENV_FILES));

      for (const relativePath of Object.keys(ENV_FILES)) {
        expect(lstatSync(join(primary, relativePath)).isSymbolicLink()).toBe(
          false
        );
      }
    });
  });

  test("환경이 필요한 공식 명령만 준비 명령을 먼저 실행한다", () => {
    const repositoryRoot = resolve(import.meta.dir, "..", "..");
    const rootPackage = JSON.parse(
      readFileSync(join(repositoryRoot, "package.json"), "utf8")
    ) as { scripts: Record<string, string> };
    const apiPackage = JSON.parse(
      readFileSync(join(repositoryRoot, "apps/api/package.json"), "utf8")
    ) as { scripts: Record<string, string> };
    const environmentConfig = readFileSync(
      join(repositoryRoot, ".codex/environments/environment.toml"),
      "utf8"
    );
    const devCli = readFileSync(
      join(repositoryRoot, "scripts/dev/cli.ts"),
      "utf8"
    );

    expect(rootPackage.scripts.dev).toBe("bun scripts/dev/cli.ts");
    expect(rootPackage.scripts["db:start"]).toStartWith(
      "bun run env:setup -- supabase &&"
    );
    expect(rootPackage.scripts["auth:otp"]).toStartWith("bun run env:setup &&");
    expect(rootPackage.scripts["dev:status"]).not.toContain("env:setup");
    expect(rootPackage.scripts["dev:stop"]).not.toContain("env:setup");
    expect(rootPackage.scripts["dev:remove"]).not.toContain("env:setup");
    expect(devCli).toContain(
      "await prepareWorktreeEnvironment({ cwd: directory })"
    );

    for (const [name, command] of Object.entries(apiPackage.scripts)) {
      if (name === "dev" || name.startsWith("eval:")) {
        expect(command).toStartWith("bun run --cwd ../.. env:setup &&");
      }
    }

    expect(environmentConfig).toContain("bun run env:setup\nbun install");
  });
});
