import { readFileSync, writeFileSync } from "node:fs";
import { stripVTControlCharacters } from "node:util";
import { spawn } from "bun";
import {
  VercelApiDelivery,
  vercelProject,
  vercelTeam,
} from "./vercel-delivery";

export function pullFailureSummary(stderr: string, token: string) {
  const line = stripVTControlCharacters(stderr)
    .split("\n")
    .find((value) => value.startsWith("Error:"));
  return line
    ? line.replaceAll(token, "[redacted]").slice(0, 500)
    : "오류 요약 없음";
}

export function createVercelRuntime(token: string) {
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
    env.SUPABASE_ACCESS_TOKEN = undefined;
    env.SUPABASE_DB_PASSWORD = undefined;
    const child = spawn(
      ["vercel", ...args, "--scope", "odd-inc", "--token", token],
      { env, stderr: "pipe", stdout: "pipe" }
    );
    const [, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (code !== 0) {
      throw new Error(
        `Vercel ${args[0]} 실패. 원격 배포를 다시 확인해야 합니다.${args[0] === "pull" ? ` ${pullFailureSummary(stderr, token)}` : ""}`
      );
    }
  }
  const delivery = new VercelApiDelivery({
    api: async (path) => {
      const response = await fetch(`https://api.vercel.com${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`Vercel 조회 실패 (${response.status})`);
      }
      return response.json();
    },
    deploy: (request) =>
      command([
        "deploy",
        "--prebuilt",
        "--prod",
        "--yes",
        "--meta",
        `flynCommitSHA=${request.sha}`,
        "--meta",
        `flynRequestId=${request.requestId}`,
      ]),
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
      await command(["pull", "--yes", "--environment=production"]);
      const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
      if (
        project.projectId !== vercelProject ||
        project.orgId !== vercelTeam ||
        project.settings?.rootDirectory !== "apps/api"
      ) {
        throw new Error("Flyn API 프로젝트 연결이 다릅니다.");
      }
      project.settings.installCommand = "bun install --frozen-lockfile";
      writeFileSync(".vercel/project.json", JSON.stringify(project));
      await command(["build", "--prod", "--yes"]);
    },
  };
}
