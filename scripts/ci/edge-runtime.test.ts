import { expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve, spawn } from "bun";

test("CLI 경계에서 요청 표식과 원격 소스를 확인하고 응답 유실을 중복 배포 없이 복구한다", async () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-edge-fixture-"));
  const server = serve({
    fetch: () => new Response(null, { status: 401 }),
    port: 0,
  });
  try {
    mkdirSync(join(root, "supabase/functions/delete-account"), {
      recursive: true,
    });
    mkdirSync(join(root, "node_modules/.bin"), { recursive: true });
    writeFileSync(join(root, ".gitignore"), "node_modules\n.remote\ncount\n");
    writeFileSync(
      join(root, "supabase/config.toml"),
      "[functions.delete-account]\nverify_jwt = true\n"
    );
    writeFileSync(
      join(root, "supabase/functions/delete-account/index.ts"),
      "export default {};"
    );
    writeFileSync(
      join(root, "supabase/functions/delete-account/deno.json"),
      "{}"
    );
    writeFileSync(
      join(root, "node_modules/.bin/supabase"),
      `#!${process.execPath}
import {cpSync,existsSync,mkdirSync,writeFileSync,readFileSync} from "node:fs";
import {join} from "node:path";
const root=${JSON.stringify(root)};
const args=process.argv.slice(2);
if(process.env.GH_TOKEN || process.env.VERCEL_TOKEN || process.env.EXPO_TOKEN || process.env.SUPABASE_DB_PASSWORD) process.exit(4);
if(args[args.indexOf("--project-ref")+1] !== "owtajtnfleiobyfocdjy" || args.includes("--prune")) process.exit(5);
const work=args[args.indexOf("--workdir")+1];
if(args[1]==="deploy") {
 cpSync(join(work,"supabase/functions"),join(root,".remote"),{recursive:true});
 writeFileSync(join(root,"count"),String(Number(existsSync(join(root,"count"))?readFileSync(join(root,"count"),"utf8"):0)+1));
 process.exit(1);
}
if(args[1]==="list") console.log(JSON.stringify({functions:[{slug:"delete-account",id:"fixture",version:2,ezbr_sha256:"fixture-hash",status:"ACTIVE",verify_jwt:true}]}));
if(args[1]==="download") {
 mkdirSync(join(work,"supabase"),{recursive:true});
 cpSync(join(root,".remote"),join(work,"supabase/functions"),{recursive:true});
 console.log("{}");
}
`,
      { mode: 0o700 }
    );
    const module = new URL("./edge-runtime.ts", import.meta.url).pathname;
    const script = `import {spawnSync} from "bun";
import {loadEdgeRuntime} from ${JSON.stringify(module)};
for (const args of [["init","-q"],["add","."],["-c","user.name=Fixture","-c","user.email=fixture@example.test","-c","commit.gpgsign=false","commit","-qm","fixture"]]) { if(spawnSync(["git",...args]).exitCode!==0) process.exit(5); }
const sha=spawnSync(["git","rev-parse","HEAD"]).stdout.toString().trim();
const runtime=loadEdgeRuntime(sha,process.cwd(),${JSON.stringify(server.url.origin)});
const request={service:"edge",sha,requestId:"fixture-request",remoteId:null};
try { await runtime.start(request); process.exit(2); } catch(error) { if(!error.message.includes("deploy 실패")) throw error; }
const observed=await runtime.inspect(request);
if(observed.status!=="success") throw new Error("inspect failed");
const wrong=await runtime.inspect({...request,requestId:"different-request"});
if(wrong.status!=="pending") throw new Error("wrong request accepted");`;
    const child = spawn([process.execPath, "-e", script], {
      cwd: root,
      env: {
        ...process.env,
        EXPO_TOKEN: "sentinel",
        GH_TOKEN: "sentinel",
        SUPABASE_DB_PASSWORD: "sentinel",
        VERCEL_TOKEN: "sentinel",
      },
      stderr: "pipe",
      stdout: "pipe",
    });
    const error = await new Response(child.stderr).text();
    expect(error).toBe("");
    expect(await child.exited).toBe(0);
    expect(readFileSync(join(root, "count"), "utf8")).toBe("1");
    expect(
      readFileSync(
        join(root, "supabase/functions/delete-account/index.ts"),
        "utf8"
      )
    ).toBe("export default {};");
  } finally {
    await server.stop(true);
    rmSync(root, { force: true, recursive: true });
  }
});
