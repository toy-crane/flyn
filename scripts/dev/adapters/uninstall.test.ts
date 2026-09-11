import { afterEach, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "./command";

const DESTRUCTIVE_COMMAND = /erase|wipe|keychain/;
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

async function probe(platform: string, installed: boolean, fails = false) {
  const directory = mkdtempSync(join(tmpdir(), "flyn-uninstall-"));
  directories.push(directory);
  const bin = join(directory, "bin");
  mkdirSync(bin);
  const log = join(directory, "commands");
  const program = `#!/bin/sh
printf '%s\\n' "$*" >> "$PROBE_LOG"
case "$*" in
  *listapps*) printf '{ "com.example.app" = { CFBundleIdentifier = "com.example.app"; }; }';;
  *"pm list packages"*) [ "$INSTALLED" = 1 ] && echo 'package:com.example.app';;
  *"getprop sys.boot_completed"*) echo 1;;
  *uninstall*) [ "$FAIL_DELETE" = 1 ] && exit 1;;
esac
exit 0
`;
  writeFileSync(
    join(bin, "xcrun"),
    installed
      ? program
      : program.replace(
          '{ "com.example.app" = { CFBundleIdentifier = "com.example.app"; }; }',
          "{}"
        ),
    { mode: 0o755 }
  );
  const adb = join(bin, "adb");
  writeFileSync(adb, program, { mode: 0o755 });
  const iosPath = join(import.meta.dir, "ios.ts");
  const androidPath = join(import.meta.dir, "android.ts");
  const script =
    platform === "ios"
      ? `import {uninstallApp} from ${JSON.stringify(iosPath)}; await uninstallApp("device", "com.example.app");`
      : `import {uninstallApk} from ${JSON.stringify(androidPath)}; await uninstallApk({adb: ${JSON.stringify(adb)}}, "emulator-5554", "com.example.app");`;
  const result = await run([process.execPath, "-e", script], {
    env: {
      ...process.env,
      FAIL_DELETE: fails ? "1" : "0",
      INSTALLED: installed ? "1" : "0",
      PATH: `${bin}:${process.env.PATH}`,
      PROBE_LOG: log,
    } as Record<string, string>,
  });
  const commands = readFileSync(log, "utf8");
  return { ...result, commands };
}

// The iOS adapter reads simctl's plist output through macOS `plutil`, which the
// Linux CI runners do not have. Those cases run on a developer's Mac instead.
const needsMac = (platform: string) =>
  platform === "ios" && process.platform !== "darwin";

for (const platform of ["ios", "android"]) {
  test.skipIf(needsMac(platform))(
    `${platform}: 플린 패키지만 삭제하고 기기 데이터는 건드리지 않는다`,
    async () => {
      const result = await probe(platform, true);
      expect(result.code).toBe(0);
      expect(result.commands).toContain("uninstall");
      expect(result.commands).toContain("com.example.app");
      expect(result.commands).not.toMatch(DESTRUCTIVE_COMMAND);
    }
  );
  test.skipIf(needsMac(platform))(
    `${platform}: 이미 앱이 없으면 반납을 계속한다`,
    async () => {
      const result = await probe(platform, false);
      expect(result.code).toBe(0);
      expect(result.commands).not.toContain("uninstall");
    }
  );
  test.skipIf(needsMac(platform))(
    `${platform}: 삭제 실패를 성공으로 처리하지 않는다`,
    async () => {
      expect((await probe(platform, true, true)).code).not.toBe(0);
    }
  );
}
