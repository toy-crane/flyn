import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";

test("함수 설정만 바뀌어도 건너뛰지 않으며 별도 검토 전에 후속 배포를 막는다", () => {
  const root = mkdtempSync(join(tmpdir(), "flyn-edge-config-"));
  try {
    const module = new URL("./edge-readiness.ts", import.meta.url).pathname;
    const child = spawnSync(
      [
        process.execPath,
        "-e",
        `import {mkdirSync,writeFileSync} from "node:fs";
import {spawnSync} from "bun";
import {edgeChanged,requireReviewedEdgeConfiguration} from ${JSON.stringify(module)};
function git(...args){const r=spawnSync(["git",...args]);if(r.exitCode!==0)throw new Error("git fixture failed");return r.stdout.toString().trim();}
git("init","-q");git("config","user.name","Fixture");git("config","user.email","fixture@example.test");git("config","commit.gpgsign","false");
mkdirSync("supabase");writeFileSync("supabase/config.toml","[functions.delete-account]\\nverify_jwt=false\\n");git("add",".");git("commit","-qm","base");const base=git("rev-parse","HEAD");
writeFileSync("supabase/config.toml","[functions.delete-account]\\nverify_jwt=true\\n");git("add",".");git("commit","-qm","change");const head=git("rev-parse","HEAD");
if(!edgeChanged(base,head))throw new Error("configuration was skipped");
try{requireReviewedEdgeConfiguration(base,head);process.exit(3);}catch(error){if(!error.message.includes("별도 검토"))throw error;}`,
      ],
      { cwd: root }
    );
    expect(child.stderr.toString()).toBe("");
    expect(child.exitCode).toBe(0);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
