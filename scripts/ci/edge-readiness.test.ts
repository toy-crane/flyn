import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";

test("로컬 Supabase 설정은 건너뛰고 함수 설정만 Edge 변경으로 본다", () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-edge-config-"));
  try {
    const module = new URL("./edge-readiness.ts", import.meta.url).pathname;
    const child = spawnSync(
      [
        process.execPath,
        "-e",
        `import {mkdirSync,writeFileSync} from "node:fs";
import {spawnSync} from "bun";
	import {edgeChanged,edgeFunctionConfigurationChanged} from ${JSON.stringify(module)};
	function git(...args){const r=spawnSync(["git",...args]);if(r.exitCode!==0)throw new Error("git fixture failed");return r.stdout.toString().trim();}
	git("init","-q");git("config","user.name","Fixture");git("config","user.email","fixture@example.test");git("config","commit.gpgsign","false");
	mkdirSync("supabase");writeFileSync("supabase/config.toml","[api]\\nport=54321\\n[functions.delete-account]\\nverify_jwt=false\\n");git("add",".");git("commit","-qm","base");const base=git("rev-parse","HEAD");
	writeFileSync("supabase/config.toml","[api]\\nport=59999\\n[functions.delete-account]\\nverify_jwt=false\\n");git("add",".");git("commit","-qm","local");const local=git("rev-parse","HEAD");
	if(edgeChanged(base,local)||edgeFunctionConfigurationChanged(base,local))throw new Error("local config triggered edge");
	writeFileSync("supabase/config.toml","[api]\\nport=59999\\n[functions.delete-account]\\nverify_jwt=true\\n");git("add",".");git("commit","-qm","function");const head=git("rev-parse","HEAD");
	if(!edgeChanged(local,head)||!edgeFunctionConfigurationChanged(local,head))throw new Error("function configuration was skipped");`,
      ],
      { cwd: root }
    );
    expect(child.stderr.toString()).toBe("");
    expect(child.exitCode).toBe(0);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
