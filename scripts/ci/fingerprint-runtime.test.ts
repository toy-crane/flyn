import { expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "bun";

const runtimeTest =
  process.env.RUN_FINGERPRINT_RUNTIME_TESTS === "1" ? test : test.skip;
const repository = resolve(import.meta.dir, "../..");
const HASH = /^[a-f0-9]{40}$/;

runtimeTest(
  "실제 Expo fingerprint는 화면 코드와 네이티브 변경을 구분하고 설정 누락을 거절한다",
  () => {
    const root = mkdtempSync(join(tmpdir(), "flyn-fingerprint-test-"));
    const env = {
      ...Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) =>
            !(
              key.startsWith("EXPO_PUBLIC_") ||
              key === "MOBILE_EXPO_STATIC_CONFIG" ||
              key === "JEST_WORKER_ID"
            )
        )
      ),
      EXPO_PUBLIC_API_URL: "https://api.example.test",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ci-ios.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "ci-web.apps.googleusercontent.com",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
      EXPO_PUBLIC_SUPABASE_URL: "https://database.example.test",
      EXPO_PUBLIC_SUPPORT_EMAIL: "support@example.test",
      EXPO_PUBLIC_WEB_URL: "https://web.example.test",
    };
    const calculate = (environment = env) =>
      spawnSync(
        [
          "node",
          join(repository, "scripts/ci/fingerprint.cjs"),
          join(root, "apps/mobile"),
        ],
        { cwd: root, env: environment }
      );
    try {
      const archive = spawnSync(
        [
          "git",
          "archive",
          "HEAD",
          "apps/mobile",
          "packages",
          "package.json",
          "bun.lock",
        ],
        { cwd: repository }
      );
      expect(archive.exitCode).toBe(0);
      const extracted = spawnSync(["tar", "-x", "-C", root], {
        stdin: archive.stdout,
      });
      expect(extracted.exitCode).toBe(0);
      symlinkSync(join(repository, "node_modules"), join(root, "node_modules"));
      symlinkSync(
        join(repository, "apps/mobile/node_modules"),
        join(root, "apps/mobile/node_modules")
      );
      const first = calculate();
      if (first.exitCode !== 0) {
        throw new Error(first.stderr.toString());
      }
      expect(first.stdout.toString().trim()).toMatch(HASH);
      mkdirSync(join(root, "apps/mobile/src/ci-fixture"));
      writeFileSync(
        join(root, "apps/mobile/src/ci-fixture/screen.tsx"),
        "export const title = 'JS-only change';\n"
      );
      const javascript = calculate();
      expect(javascript.exitCode).toBe(0);
      expect(javascript.stdout.toString()).toBe(first.stdout.toString());
      const path = join(root, "apps/mobile/app.json");
      const app = JSON.parse(readFileSync(path, "utf8"));
      app.expo.ios.infoPlist = {
        ...app.expo.ios.infoPlist,
        FlynNativeFixture: true,
      };
      writeFileSync(path, JSON.stringify(app));
      const native = calculate();
      expect(native.exitCode).toBe(0);
      expect(native.stdout.toString()).not.toBe(first.stdout.toString());
      const missing = calculate({
        ...env,
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "",
      });
      expect(missing.exitCode).not.toBe(0);
      expect(missing.stderr.toString()).toContain(
        "Invalid mobile environment variables"
      );
      writeFileSync(
        join(root, "apps/mobile/react-native.config.js"),
        "throw new Error('broken native autolinking');\n"
      );
      const broken = calculate();
      expect(broken.exitCode).not.toBe(0);
      expect(broken.stderr.toString()).toContain("완전한 iOS fingerprint");
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  },
  120_000
);
