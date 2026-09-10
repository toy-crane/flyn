import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDeployment } from "@vercel/client";
import { spawn } from "bun";
import {
  VercelApiDelivery,
  vercelProject,
  vercelTeam,
} from "./vercel-delivery";

const ERROR_CODE = /^[a-zA-Z0-9_-]{1,80}$/;

export function createVercelRuntime(
  token: string,
  apiOrigin = "https://api.vercel.com"
) {
  if (!token) {
    throw new Error("Vercel 인증이 필요합니다.");
  }
  async function command(args: string[]) {
    const env: Record<string, string | undefined> = {
      ...process.env,
      VERCEL_ORG_ID: vercelTeam,
      VERCEL_PROJECT_ID: vercelProject,
    };
    env.GH_TOKEN = undefined;
    env.VERCEL_TOKEN = undefined;
    env.SUPABASE_ACCESS_TOKEN = undefined;
    env.SUPABASE_DB_PASSWORD = undefined;
    const config = mkdtempSync(join(tmpdir(), "flyn-vercel-config-"));
    try {
      const child = spawn(["vercel", ...args, "--global-config", config], {
        env,
        stderr: "pipe",
        stdout: "pipe",
      });
      const [, , code] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      if (code !== 0) {
        throw new Error(
          `Vercel ${args[0]} 실패. 원격 배포를 다시 확인해야 합니다.`
        );
      }
    } finally {
      rmSync(config, { force: true, recursive: true });
    }
  }
  async function api(path: string) {
    const response = await fetch(`${apiOrigin}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`Vercel 조회 실패 (${response.status})`);
    }
    return response.json();
  }
  const delivery = new VercelApiDelivery({
    api,
    deploy: async (request) => {
      const deploymentOptions = {
        meta: { flynCommitSHA: request.sha, flynRequestId: request.requestId },
        name: "flyn-api",
        project: vercelProject,
        regions: ["icn1"],
        target: "production",
      };
      for await (const event of createDeployment(
        {
          apiUrl: apiOrigin,
          path: process.cwd(),
          prebuilt: true,
          rootDirectory: "apps/api",
          teamId: vercelTeam,
          token,
          vercelOutputDir: join(process.cwd(), ".vercel/output"),
        },
        deploymentOptions
      )) {
        if (event.type === "error") {
          const { code } = event.payload;
          const hint =
            typeof code === "string" && ERROR_CODE.test(code)
              ? code
              : "unknown";
          throw new Error(
            `Vercel 배포 API 실패 (${hint}). 기존 요청을 먼저 조회해야 합니다.`
          );
        }
      }
    },
    probe: async () => {
      const health = await fetch("https://flyn-api.vercel.app/health", {
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
      const auth = await fetch("https://flyn-api.vercel.app/ai/episode", {
        body: "{}",
        headers: { "Content-Type": "application/json" },
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
      return (
        health.status === 200 &&
        JSON.stringify(await health.json()) === '{"status":"ok"}' &&
        auth.status === 401 &&
        JSON.stringify(await auth.json()) === '{"error":"Unauthorized."}'
      );
    },
  });
  return {
    delivery,
    prepare: async () => {
      const project = (await api(
        `/v9/projects/${vercelProject}?teamId=${vercelTeam}`
      )) as Record<string, unknown>;
      if (
        project.id !== vercelProject ||
        project.accountId !== vercelTeam ||
        project.rootDirectory !== "apps/api" ||
        project.framework !== "hono"
      ) {
        throw new Error("Flyn API 프로젝트 연결이 다릅니다.");
      }
      mkdirSync(".vercel", { recursive: true });
      writeFileSync(
        ".vercel/project.json",
        JSON.stringify({
          orgId: vercelTeam,
          projectId: vercelProject,
          projectName: "flyn-api",
          settings: {
            buildCommand: project.buildCommand ?? null,
            framework: "hono",
            installCommand: "bun install --frozen-lockfile",
            nodeVersion: project.nodeVersion,
            outputDirectory: project.outputDirectory ?? null,
            rootDirectory: "apps/api",
          },
        })
      );
      await command(["build", "--prod", "--yes"]);
    },
  };
}
