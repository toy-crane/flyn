import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { resolveModelId } from "../src/shared/model-id";
import { roleOwnershipCandidatePrompt } from "./role-ownership-candidate";
import { fixedScenarios, type Scenario } from "./role-ownership-cases";
import { roleOwnershipProblems } from "./role-ownership-checks";
import { sceneAnswer } from "./scene-answer";

interface Job {
  id: string;
  repetition: number;
  scenarioId: string;
  variant: "before" | "after";
}
interface Manifest {
  at: string;
  concurrency: number;
  jobs: Job[];
  model: string;
  scenarios: (Scenario & { after: string })[];
}
interface Trial extends Job {
  answer?: Awaited<ReturnType<typeof sceneAnswer>>;
  at: string;
  error?: string;
  manifestSha256: string;
  problems: string[];
}
const sha = (value: string) => createHash("sha256").update(value).digest("hex");

function prepare(directory: string) {
  if (existsSync(resolve(directory, "responses.jsonl"))) {
    throw new Error("Cannot rewrite a started evaluation");
  }
  const model = resolveModelId();
  if (model !== "openai/gpt-5.6-luna") {
    throw new Error("This evaluation is authorized for Luna only");
  }
  const scenarios = fixedScenarios().map((f) => ({
    ...f,
    after: roleOwnershipCandidatePrompt(f.script),
  }));
  if (scenarios.some((f) => f.before === f.after)) {
    throw new Error("Before and after prompts are identical");
  }
  const jobs: Job[] = scenarios.flatMap((f) =>
    (["before", "after"] as const).flatMap((variant) =>
      Array.from({ length: 5 }, (_, i) => ({
        id: `${f.id}-${variant}-${i + 1}`,
        repetition: i + 1,
        scenarioId: f.id,
        variant,
      }))
    )
  );
  jobs.sort((a, b) =>
    sha(`simple-rules:${a.id}`).localeCompare(sha(`simple-rules:${b.id}`))
  );
  const manifest: Manifest = {
    at: new Date().toISOString(),
    concurrency: 3,
    jobs,
    model,
    scenarios,
  };
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    resolve(directory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  process.stdout.write(`Prepared ${jobs.length} calls in ${directory}\n`);
}

async function run(directory: string) {
  const raw = readFileSync(resolve(directory, "manifest.json"), "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  if (
    manifest.model !== resolveModelId() ||
    manifest.model !== "openai/gpt-5.6-luna"
  ) {
    throw new Error("Model changed");
  }
  for (const f of manifest.scenarios) {
    if (f.after !== roleOwnershipCandidatePrompt(f.script)) {
      throw new Error(`Prompt changed after freeze: ${f.id}`);
    }
  }
  const file = resolve(directory, "responses.jsonl");
  const results: Trial[] = existsSync(file)
    ? readFileSync(file, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as Trial)
    : [];
  const done = new Set(results.map((r) => r.id));
  const jobs = manifest.jobs.filter((j) => !done.has(j.id));
  let cursor = 0;
  let errors = 0;
  async function call(job: Job) {
    const f = manifest.scenarios.find((s) => s.id === job.scenarioId);
    if (!f) {
      throw new Error(`Unknown scenario: ${job.scenarioId}`);
    }
    const trial: Trial = {
      ...job,
      at: new Date().toISOString(),
      manifestSha256: sha(raw),
      problems: [],
    };
    try {
      trial.answer = await sceneAnswer(
        f.script,
        f.messages,
        [],
        f[job.variant]
      );
      trial.problems = roleOwnershipProblems(trial.answer.scene, f);
    } catch (error) {
      trial.error = String(error)
        .replaceAll(
          process.env.AI_GATEWAY_API_KEY ?? "__no_key__",
          "[redacted]"
        )
        .slice(0, 1600);
      errors += 1;
    }
    appendFileSync(file, `${JSON.stringify(trial)}\n`);
    results.push(trial);
    process.stdout.write(
      `${results.length}/${manifest.jobs.length} ${job.id}: ${trial.error ?? (trial.problems.join(", ") || "기계 검사 통과")}\n`
    );
  }
  async function worker() {
    while (cursor < jobs.length && errors < 3) {
      const job = jobs[cursor];
      cursor += 1;
      if (job) {
        // biome-ignore lint/performance/noAwaitInLoops: 같은 worker는 앞 호출이 끝나야 다음 호출을 시작해 동시 호출 수를 제한한다.
        await call(job);
      }
    }
  }
  await Promise.all(
    Array.from({ length: manifest.concurrency }, () => worker())
  );
  const failed = results.filter(
    (r) => r.variant === "after" && (r.error || r.problems.length > 0)
  );
  writeFileSync(
    resolve(directory, "gate.json"),
    `${JSON.stringify({ complete: results.length === manifest.jobs.length, expected: manifest.jobs.length, failedAfterIds: failed.map((r) => r.id), recorded: results.length }, null, 2)}\n`
  );
  if (failed.length || results.length !== manifest.jobs.length) {
    process.exitCode = 1;
  }
}

const [command, output] = process.argv.slice(2);
if (!(output && (command === "prepare" || command === "run"))) {
  throw new Error(
    "Usage: bun run eval:role-ownership <prepare|run> <output-directory>"
  );
}
const outputDirectory = resolve(output);
if (command === "prepare") {
  prepare(outputDirectory);
} else {
  await run(outputDirectory);
}
