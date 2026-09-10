import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { YAML } from "bun";

const forbiddenCommands =
  /--include-seed|--include-all|--debug|db reset|config push/;

test("운영 DB 연결 검사는 main 수동 실행에서만 비밀값을 사용한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/deployment-access.yml", import.meta.url),
      "utf8"
    )
  ) as {
    on: Record<string, unknown>;
    permissions: Record<string, string>;
    jobs: {
      supabase: {
        if: string;
        env?: unknown;
        steps: { env?: Record<string, string>; run?: string }[];
      };
    };
  };
  expect(Object.keys(workflow.on)).toEqual(["workflow_dispatch"]);
  expect(workflow.permissions).toEqual({ contents: "read" });
  const job = workflow.jobs.supabase;
  expect(job.if).toBe(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: GitHub expression, not JavaScript interpolation.
    "${{ github.ref == 'refs/heads/main' && github.repository == 'toy-crane/flyn' }}"
  );
  expect(job.env).toBeUndefined();
  const secretSteps = job.steps.filter((step) => step.env);
  expect(secretSteps).toHaveLength(1);
  expect(secretSteps[0]?.run).toContain(
    "bunx --no-install supabase db push --linked --dry-run --output-format text"
  );
  expect(secretSteps[0]?.run).toContain(
    "bunx --no-install supabase link --project-ref owtajtnfleiobyfocdjy"
  );
  expect(secretSteps[0]?.run).not.toMatch(forbiddenCommands);
});
