import { spawnSync } from "bun";

const SHA = /^[a-f0-9]{40}$/;
const REPOSITORY = "toy-crane/flyn";

type Fetcher = (
  url: string,
  init: RequestInit
) => Promise<Pick<Response, "json" | "ok" | "status">>;

interface Options {
  /** Injected so tests exercise the selection rules without the network. */
  fetch?: Fetcher;
  /** True when the commit exists in this checkout. */
  known?: (sha: string) => boolean;
  runId: string;
  token?: string;
  workflow: string;
}

export function commitInCheckout(sha: string) {
  return spawnSync(["git", "cat-file", "-e", `${sha}^{commit}`]).exitCode === 0;
}

/**
 * The commit of the newest successful `main` run of this workflow. Everything
 * changed since then is still undelivered, including work from failed runs.
 */
export async function lastSuccessfulSha(options: Options) {
  const call = options.fetch ?? globalThis.fetch;
  const known = options.known ?? commitInCheckout;
  const url = `https://api.github.com/repos/${REPOSITORY}/actions/workflows/${options.workflow}/runs?branch=main&event=push&status=success&per_page=20`;
  const response = await call(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : undefined),
    },
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`이전 성공 실행 조회 실패 (${response.status})`);
  }
  const result: unknown = await response.json();
  const runs = (result as { workflow_runs?: unknown }).workflow_runs;
  if (!Array.isArray(runs)) {
    throw new Error("이전 성공 실행 목록이 올바르지 않습니다.");
  }
  for (const run of runs as {
    head_branch?: unknown;
    head_sha?: unknown;
    id?: unknown;
  }[]) {
    if (run.head_branch !== "main" || String(run.id) === options.runId) {
      continue;
    }
    if (typeof run.head_sha !== "string" || !SHA.test(run.head_sha)) {
      throw new Error("이전 성공 실행의 커밋이 올바르지 않습니다.");
    }
    if (known(run.head_sha)) {
      return run.head_sha;
    }
    return null;
  }
  return null;
}
