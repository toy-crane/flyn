import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";
import { pullFailureSummary } from "./vercel-runtime";

test("pull 오류 원인만 남기고 토큰과 다른 출력은 숨긴다", () => {
  expect(
    pullFailureSummary(
      "secret fixture-token\nError: Not authorized: fixture-token\nprivate env=value",
      "fixture-token"
    )
  ).toBe("Error: Not authorized: [redacted]");
  expect(pullFailureSummary("private env=value", "fixture-token")).toBe(
    "오류 요약 없음"
  );
});

test("실제 CLI 프로세스 경계에서 잠금 설치와 prebuilt 배포 및 비밀값 분리를 확인한다", () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-vercel-cli-"));
  try {
    writeFileSync(
      join(root, "vercel"),
      `#!${process.execPath}
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
if (process.env.VERCEL_TOKEN || process.env.GH_TOKEN || process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_DB_PASSWORD) process.exit(2);
if (args[args.indexOf("--token") + 1] !== "fixture-not-a-secret") process.exit(4);
appendFileSync("calls.jsonl", JSON.stringify(args.map((value, index) => args[index - 1] === "--token" ? "redacted" : value)) + "\\n");
if (args[0] === "pull") {
 mkdirSync(".vercel");
 writeFileSync(".vercel/project.json", JSON.stringify({projectId:"prj_nPla0LdaA37WCfo0uai0kuMBkgLC",orgId:"team_dinnDZJN7Ztt45FtgFkAAGad",settings:{rootDirectory:"apps/api"}}));
}
if (args[0] === "deploy") process.exit(1);
`,
      { mode: 0o700 }
    );
    const module = new URL("./vercel-runtime.ts", import.meta.url).pathname;
    const child = spawnSync(
      [
        process.execPath,
        "-e",
        `import {createVercelRuntime} from ${JSON.stringify(module)};
const runtime = createVercelRuntime("fixture-not-a-secret");
await runtime.prepare();
try { await runtime.delivery.start({service:"api",sha:"${"a".repeat(40)}",requestId:"fixture-request",remoteId:null}); process.exit(3); } catch (error) { if (!error.message.includes("Vercel deploy 실패")) throw error; }`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          GH_TOKEN: "must-not-inherit",
          PATH: `${root}:${process.env.PATH}`,
          SUPABASE_ACCESS_TOKEN: "must-not-inherit",
          SUPABASE_DB_PASSWORD: "must-not-inherit",
          VERCEL_TOKEN: "must-not-inherit",
        },
      }
    );
    expect(child.exitCode).toBe(0);
    const calls = readFileSync(join(root, "calls.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(calls.map((args) => args[0])).toEqual(["pull", "build", "deploy"]);
    expect(calls[2]).toContain("--prebuilt");
    expect(calls[2]).toContain("flynRequestId=fixture-request");
    expect(
      JSON.parse(readFileSync(join(root, ".vercel/project.json"), "utf8"))
        .settings.installCommand
    ).toBe("bun install --frozen-lockfile");
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
