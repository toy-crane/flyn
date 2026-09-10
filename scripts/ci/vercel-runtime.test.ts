import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve, spawn } from "bun";

test("공식 배포 클라이언트는 프로젝트와 요청 ID를 보내고 불명확한 실패를 재요청하지 않는다", async () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-vercel-upload-"));
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  const server = serve({
    fetch: async (request) => {
      requests.push({
        body: (await request.json()) as Record<string, unknown>,
        path: new URL(request.url).pathname,
      });
      return Response.json(
        { error: { code: "unavailable", message: "fixture" } },
        { status: 503 }
      );
    },
    port: 0,
  });
  try {
    mkdirSync(join(root, ".vercel/output/static"), { recursive: true });
    writeFileSync(
      join(root, ".vercel/output/config.json"),
      JSON.stringify({ version: 3 })
    );
    writeFileSync(join(root, ".vercel/output/static/index.html"), "fixture");
    writeFileSync(join(root, ".env"), "MUST_NOT_UPLOAD=private");
    const module = new URL("./vercel-runtime.ts", import.meta.url).pathname;
    const child = spawn(
      [
        process.execPath,
        "-e",
        `import {createVercelRuntime} from ${JSON.stringify(module)};
try { await createVercelRuntime("fixture", ${JSON.stringify(server.url.origin)}).delivery.start({service:"api",sha:"${"a".repeat(40)}",requestId:"fixture-request",remoteId:null}); process.exit(3); }
catch(error) { if (!error.message.includes("Vercel 배포 API 실패")) throw error; }`,
      ],
      { cwd: root, stderr: "pipe", stdout: "pipe" }
    );
    const error = await new Response(child.stderr).text();
    expect(error).toBe("");
    expect(await child.exited).toBe(0);
    expect(requests).toHaveLength(1);
    const [first] = requests;
    if (!first) {
      throw new Error("배포 요청이 없습니다.");
    }
    expect(first.path.endsWith("/deployments")).toBe(true);
    expect(first.body).toMatchObject({
      meta: { flynCommitSHA: "a".repeat(40), flynRequestId: "fixture-request" },
      project: "prj_nPla0LdaA37WCfo0uai0kuMBkgLC",
      target: "production",
    });
    expect(JSON.stringify(requests)).not.toContain("MUST_NOT_UPLOAD");
    expect(JSON.stringify(requests)).not.toContain('".env"');
  } finally {
    await server.stop(true);
    rmSync(root, { force: true, recursive: true });
  }
});
