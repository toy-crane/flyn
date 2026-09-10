import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync, TOML } from "bun";
import type { DeliveryRequest } from "./delivery-execution";
import { SupabaseEdgeDelivery } from "./edge-delivery";

const PROJECT = "owtajtnfleiobyfocdjy";
const NAME = /^[a-z][a-z0-9-]*$/;

export function edgeMarker(request: DeliveryRequest) {
  return `// Flyn delivery ${JSON.stringify({ requestId: request.requestId, sha: request.sha })}\n`;
}

export function matchesEdgeSources(
  downloaded: string,
  expectedRoot: string,
  names: string[],
  request: DeliveryRequest
) {
  for (const name of names) {
    if (
      !(
        existsSync(join(downloaded, name, "index.ts")) &&
        existsSync(join(downloaded, name, "deno.json"))
      )
    ) {
      return false;
    }
  }
  for (const entry of readdirSync(downloaded, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) {
      continue;
    }
    const path = join(entry.parentPath, entry.name);
    const relative = path.slice(downloaded.length + 1);
    const expected = join(expectedRoot, relative);
    if (!existsSync(expected)) {
      return false;
    }
    const prefix = names.some((name) => relative === `${name}/index.ts`)
      ? edgeMarker(request)
      : "";
    if (
      readFileSync(path, "utf8") !==
      prefix + readFileSync(expected, "utf8")
    ) {
      return false;
    }
  }
  return true;
}

export function loadEdgeRuntime(
  sha: string,
  root = process.cwd(),
  functionOrigin = `https://${PROJECT}.supabase.co/functions/v1`
) {
  if (
    spawnSync(["git", "rev-parse", "HEAD"], { cwd: root })
      .stdout.toString()
      .trim() !== sha ||
    spawnSync(["git", "status", "--porcelain"], { cwd: root })
      .stdout.toString()
      .trim()
  ) {
    throw new Error("Edge 체크아웃이 배포 커밋과 다릅니다.");
  }
  const functionsPath = join(root, "supabase/functions");
  const names = readdirSync(functionsPath)
    .filter(
      (name) =>
        NAME.test(name) && existsSync(join(functionsPath, name, "index.ts"))
    )
    .sort();
  if (!names.length) {
    throw new Error("배포할 Edge Function이 없습니다.");
  }
  const config = TOML.parse(
    readFileSync(join(root, "supabase/config.toml"), "utf8")
  ) as { functions: Record<string, { verify_jwt?: boolean }> };
  async function run(args: string[], cwd = root) {
    const child = spawn(
      [
        join(root, "node_modules/.bin/supabase"),
        ...args,
        "--project-ref",
        PROJECT,
        "--output-format",
        "json",
        "--agent",
        "no",
      ],
      {
        cwd,
        env: {
          ...process.env,
          EXPO_TOKEN: undefined,
          GH_TOKEN: undefined,
          SUPABASE_DB_PASSWORD: undefined,
          VERCEL_TOKEN: undefined,
        },
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const [out, , code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (code !== 0) {
      throw new Error(
        `Supabase functions ${args[1]} 실패. 기존 함수를 다시 확인해야 합니다.`
      );
    }
    return JSON.parse(out);
  }
  async function versions() {
    const result = await run(["functions", "list"]);
    if (!Array.isArray(result.functions)) {
      throw new Error("Edge 목록 응답이 올바르지 않습니다.");
    }
    return names.map((name) => {
      const found = result.functions.filter(
        (f: { slug: string }) => f.slug === name
      );
      const [item] = found;
      if (
        found.length !== 1 ||
        !item?.id ||
        item.status !== "ACTIVE" ||
        !Number.isInteger(item.version) ||
        item.verify_jwt !== (config.functions[name]?.verify_jwt ?? true)
      ) {
        return null;
      }
      return `${item.id}:${item.version}:${item.ezbr_sha256}`;
    });
  }
  const delivery = new SupabaseEdgeDelivery({
    deploy: async (request) => {
      const temp = mkdtempSync(join(tmpdir(), "flyn-edge-upload-"));
      try {
        cpSync(functionsPath, join(temp, "supabase/functions"), {
          recursive: true,
        });
        cpSync(
          join(root, "supabase/config.toml"),
          join(temp, "supabase/config.toml")
        );
        for (const name of names) {
          const path = join(temp, "supabase/functions", name, "index.ts");
          writeFileSync(path, edgeMarker(request) + readFileSync(path, "utf8"));
        }
        await run(
          ["functions", "deploy", ...names, "--use-api", "--workdir", temp],
          temp
        );
      } finally {
        rmSync(temp, { force: true, recursive: true });
      }
    },
    inspect: async (request) => {
      const before = await versions();
      if (before.some((version) => version === null)) {
        return null;
      }
      const temp = mkdtempSync(join(tmpdir(), "flyn-edge-read-"));
      try {
        // Download only the named functions. Extra remote functions are never deleted.
        for (const name of names) {
          // biome-ignore lint/performance/noAwaitInLoops: 함수별 소스를 같은 버전 조회 사이에서 확인한다.
          await run(
            ["functions", "download", name, "--use-api", "--workdir", temp],
            temp
          );
        }
        const downloaded = join(temp, "supabase/functions");
        if (!matchesEdgeSources(downloaded, functionsPath, names, request)) {
          return null;
        }
        const after = await versions();
        return JSON.stringify(before) === JSON.stringify(after)
          ? before.join(",")
          : null;
      } finally {
        rmSync(temp, { force: true, recursive: true });
      }
    },
    probe: async () => {
      for (const name of names) {
        // biome-ignore lint/performance/noAwaitInLoops: 배포 대상 각각의 인증 경계를 확인한다.
        const response = await fetch(`${functionOrigin}/${name}`, {
          body: "{}",
          headers: { "Content-Type": "application/json" },
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
        });
        if (response.status !== 401) {
          return false;
        }
      }
      return true;
    },
    sha,
  });
  return delivery;
}
