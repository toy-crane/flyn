import { runOrThrow } from "./command";

/** Explicit user requests only. This raises one host process, not every emulator. */
export async function activateHostProcess(pid: number): Promise<void> {
  if (!Number.isSafeInteger(pid) || pid <= 1) {
    throw new Error("창을 표시할 프로세스가 올바르지 않습니다.");
  }
  await runOrThrow([
    "osascript",
    "-l",
    "JavaScript",
    "-e",
    `ObjC.import('AppKit'); const app = $.NSRunningApplication.runningApplicationWithProcessIdentifier(${pid}); if (!app || !app.activateWithOptions(3)) { throw new Error('기기 창을 활성화하지 못했습니다.'); }`,
  ]);
}
