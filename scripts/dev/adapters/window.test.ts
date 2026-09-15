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

const WINDOW_MUTATION = /osascript|emu kill|emulator -avd/;
const UNRELATED_OR_DESTRUCTIVE =
  /emulator-6542 emu kill|wipe-data|uninstall|erase/;
const ACTIVATE_OR_KILL = /osascript|emu kill/;
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

async function probe(
  platform: "ios" | "android",
  foreground: boolean,
  mode: string
) {
  const dir = mkdtempSync(join(tmpdir(), "flyn-window-"));
  dirs.push(dir);
  const bin = join(dir, "bin");
  mkdirSync(bin);
  const log = join(dir, "commands");
  const program = `#!/bin/sh
printf '%s %s\\n' "$(basename "$0")" "$*" >> "$PROBE_LOG"
case "$(basename "$0"):$*" in
  'adb:devices')
    echo 'List of devices attached'
    if [ ! -f "$PROBE_DIR/killed" ]; then
      printf 'emulator-6540\\tdevice\\n'
      printf 'emulator-6542\\tdevice\\n'
    fi;;
  'adb:-s emulator-6540 emu avd name') echo ours;;
  'adb:-s emulator-6542 emu avd name') echo other;;
  *discoverypath*) echo /tmp/avd/running/pid_901.ini; echo OK;;
  *'emu kill') touch "$PROBE_DIR/killed";;
  *'getprop sys.boot_completed')
    while [ ! -f "$PROBE_DIR/launched" ]; do sleep 0.01; done
    echo 1;;
  'emulator:'*) touch "$PROBE_DIR/launched";;
  'ps:-axo pid=,args=')
    echo '902 /Xcode/Simulator.app/Contents/MacOS/Simulator -CurrentDeviceUDID other'
    if [ "$MODE" = visible ]; then
      echo '901 /Xcode/Simulator.app/Contents/MacOS/Simulator -CurrentDeviceUDID ours'
    fi;;
  'ps:'*)
    if [ "$MODE" = mismatch ]; then
      echo 'qemu -avd other -port 6540 -qt-hide-window'
    elif [ "$MODE" = hidden ] || [ "$MODE" = delayed ]; then
      echo 'qemu -avd ours -port 6540 -qt-hide-window'
    else
      echo 'qemu -avd ours -port 6540'
    fi;;
esac
`;
  for (const name of ["adb", "emulator", "ps", "open", "osascript"]) {
    writeFileSync(join(bin, name), program, { mode: 0o755 });
  }
  const sdk = {
    adb: join(bin, "adb"),
    emulator: join(bin, "emulator"),
    root: dir,
  };
  const source =
    platform === "ios"
      ? `import {openSimulatorApp} from ${JSON.stringify(join(import.meta.dir, "ios.ts"))}; await openSimulatorApp("ours", ${foreground});`
      : `import {startEmulator} from ${JSON.stringify(join(import.meta.dir, "android.ts"))}; await startEmulator({sdk:${JSON.stringify(sdk)}, avdName:"ours", port:6540, logPath:${JSON.stringify(join(dir, "device.log"))},foreground:${foreground}});`;
  const delayedSource = `
import {createServer} from "node:net";
import {existsSync} from "node:fs";
const server = createServer();
await new Promise(resolve => server.listen(6540, "0.0.0.0", resolve));
const timer = setInterval(() => {
  if (existsSync(${JSON.stringify(join(dir, "killed"))})) {
    clearInterval(timer);
    setTimeout(() => server.close(), 500);
  }
}, 10);
${source.split("; await")[0]};
try { await ${source.split("; await")[1]} } finally { clearInterval(timer); server.close(); }
`;
  const result = await run(
    [process.execPath, "-e", mode === "delayed" ? delayedSource : source],
    {
      env: {
        ...process.env,
        MODE: mode,
        PATH: `${bin}:${process.env.PATH}`,
        PROBE_DIR: dir,
        PROBE_LOG: log,
      } as Record<string, string>,
    }
  );
  return { ...result, commands: readFileSync(log, "utf8") };
}

test("기본 실행은 호스트 창을 활성화하거나 실행 중 Android를 재시작하지 않는다", async () => {
  const ios = await probe("ios", false, "visible");
  expect(ios.code).toBe(0);
  expect(ios.commands).toBe("open -g -a Simulator\n");
  const android = await probe("android", false, "hidden");
  expect(android.code).toBe(0);
  expect(android.commands).not.toMatch(WINDOW_MUTATION);
});

test("iOS는 요청한 UDID의 창만 재사용하고 없으면 별도 창을 연다", async () => {
  const existing = await probe("ios", true, "visible");
  expect(existing.code).toBe(0);
  expect(existing.commands).toContain(
    "runningApplicationWithProcessIdentifier(901)"
  );
  expect(existing.commands).not.toContain(
    "runningApplicationWithProcessIdentifier(902)"
  );
  expect(existing.commands).not.toContain("open -n");
  const fresh = await probe("ios", true, "hidden");
  expect(fresh.code).toBe(0);
  expect(fresh.commands).toContain(
    "open -n -a Simulator --args -CurrentDeviceUDID ours"
  );
});

test("숨긴 Android는 해당 AVD만 창 모드로 재시작하고 데이터를 지우지 않는다", async () => {
  const result = await probe("android", true, "hidden");
  expect(result.code).toBe(0);
  expect(result.commands).toContain("adb -s emulator-6540 emu kill");
  expect(result.commands).toContain(
    "emulator -avd ours -port 6540 -no-boot-anim\n"
  );
  expect(result.commands).not.toMatch(UNRELATED_OR_DESTRUCTIVE);
});

test("보이는 Android는 해당 프로세스만 활성화하고 재시작하지 않는다", async () => {
  const result = await probe("android", true, "visible");
  expect(result.code).toBe(0);
  expect(result.commands).toContain(
    "runningApplicationWithProcessIdentifier(901)"
  );
  expect(result.commands).not.toContain("emu kill");
});

test("AVD와 프로세스가 다르면 창을 활성화하거나 기기를 종료하지 않는다", async () => {
  const result = await probe("android", true, "mismatch");
  expect(result.code).not.toBe(0);
  expect(result.commands).not.toMatch(ACTIVATE_OR_KILL);
});

test("Android 종료 뒤 콘솔 포트 해제가 늦어져도 재시작을 기다린다", async () => {
  const result = await probe("android", true, "delayed");
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
  expect(result.commands).toContain(
    "emulator -avd ours -port 6540 -no-boot-anim\n"
  );
});
