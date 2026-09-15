import { argv, cwd, exit, stderr, stdout } from "node:process";

import { prepareWorktreeEnvironment } from "./setup";

async function main(): Promise<void> {
  const args = argv.slice(2).filter((argument) => argument !== "--");
  const [scope] = args;

  if (args.length > 1 || (scope && scope !== "supabase")) {
    throw new Error("사용법: bun run env:setup [-- supabase]");
  }

  const result = await prepareWorktreeEnvironment({
    cwd: cwd(),
    scope: scope === "supabase" ? "supabase" : "all",
  });

  stdout.write(
    `환경 파일을 확인했습니다. 새 연결 ${result.linked.length}개, 기존 파일 ${result.reused.length}개.\n`
  );
}

main().catch((error: unknown) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  exit(1);
});
