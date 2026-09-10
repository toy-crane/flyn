import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve, spawn } from "bun";

test("프로젝트 API만 조회하고 빌드 프로세스에는 토큰이나 토큰 인자를 주지 않는다", async () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-vercel-build-"));
  const requests: string[] = [];
  const server = serve({
    fetch: (request) => {
      requests.push(new URL(request.url).pathname);
      if (
        !request.url.includes("/v9/projects/prj_nPla0LdaA37WCfo0uai0kuMBkgLC")
      ) {
        return new Response(null, { status: 403 });
      }
      return Response.json({
        accountId: "team_dinnDZJN7Ztt45FtgFkAAGad",
        framework: "hono",
        id: "prj_nPla0LdaA37WCfo0uai0kuMBkgLC",
        nodeVersion: "24.x",
        rootDirectory: "apps/api",
      });
    },
    port: 0,
  });
  try {
    writeFileSync(
      join(root, "vercel"),
      `#!${process.execPath}
import {writeFileSync} from "node:fs";
if (process.env.VERCEL_TOKEN || process.env.GH_TOKEN || process.argv.includes("--token")) process.exit(2);
if (process.argv[2] !== "build") process.exit(3);
writeFileSync("built", "yes");
`,
      { mode: 0o700 }
    );
    const module = new URL("./vercel-runtime.ts", import.meta.url).pathname;
    const child = spawn(
      [
        process.execPath,
        "-e",
        `import {createVercelRuntime} from ${JSON.stringify(module)}; await createVercelRuntime("fixture", ${JSON.stringify(server.url.origin)}).prepare();`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          GH_TOKEN: "must-not-inherit",
          PATH: `${root}:${process.env.PATH}`,
          VERCEL_TOKEN: "must-not-inherit",
        },
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const error = await new Response(child.stderr).text();
    expect(error).toBe("");
    expect(await child.exited).toBe(0);
    expect(requests).toEqual(["/v9/projects/prj_nPla0LdaA37WCfo0uai0kuMBkgLC"]);
    expect(readFileSync(join(root, "built"), "utf8")).toBe("yes");
    expect(
      JSON.parse(readFileSync(join(root, ".vercel/project.json"), "utf8"))
        .settings.installCommand
    ).toBe("bun install --frozen-lockfile");
  } finally {
    await server.stop(true);
    rmSync(root, { force: true, recursive: true });
  }
});
