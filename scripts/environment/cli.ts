import { cwd, exit, stderr, stdout } from "node:process";

import { prepareWorktreeEnvironment } from "./setup";

async function main(): Promise<void> {
  const result = await prepareWorktreeEnvironment({ cwd: cwd() });

  stdout.write(
    `환경 파일을 확인했습니다. 새 연결 ${result.linked.length}개, 기존 파일 ${result.reused.length}개.\n`
  );
}

main().catch((error: unknown) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  exit(1);
});
