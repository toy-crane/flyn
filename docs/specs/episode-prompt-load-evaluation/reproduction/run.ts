import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { jsonSchema, Output, streamText } from "ai";
import { episodeSystemPrompt } from "./src/features/episode/episode";
import { episodeSceneOutput, streamEpisodeScene, type EpisodeScene } from "./src/features/episode/scene";
import { resolveModelId } from "./src/shared/model-id";
import { fixtures, groupedStage, repo, script, type Fixture } from "./fixtures";

const arms = ["A", "B", "C", "D"] as const;
type Arm = typeof arms[number];
type Scene = { dialogue: {speaker: string; text: string}[]; ending?: null | Record<string, string> };
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const root = import.meta.dir;
const out = resolve(root, "primary");
const write = (name: string, data: unknown) => writeFileSync(resolve(out, name), JSON.stringify(data, null, 2) + "\n");
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }

async function condition(f: Fixture, arm: Arm) {
  const scenario = f.script ?? script;
  let system = episodeSystemPrompt(arm === "D" ? { ...scenario, stage: f.groupedStage ?? groupedStage } : scenario);
  const format = await episodeSceneOutput(scenario).responseFormat;
  assert(format?.type === "json" && format.schema, "Expected production JSON output");
  const schema = structuredClone(format.schema) as any;
  if (arm === "B" || arm === "C") {
    assert(system.split("\n기록:").length === 2, "Record marker changed");
    system = system.split("\n기록:")[0]!.trimEnd();
    if (arm === "B") {
      assert(system.includes("결말과 기록을 함께 남긴다."), "Ending instruction changed");
      system = system.replace("결말과 기록을 함께 남긴다.", "결말을 남긴다.");
      const ending = schema.properties.ending.anyOf[1];
      for (const key of ["choice", "relationship", "question", "level"]) delete ending.properties[key];
      ending.required = ending.required.filter((key: string) => ["kind", "outcome"].includes(key));
    } else {
      system = system.split("\n결말:")[0]!.trimEnd() + `\n\n사건의 기준:\n- 성공: ${scenario.endings.success}\n- 타협: ${scenario.endings.compromise}\n- 실패: ${scenario.endings.failure}`;
      delete schema.properties.ending;
      schema.required = ["dialogue"];
      assert(!system.includes("ending"), "C must not request ending output");
    }
  }
  return { arm, system, schema, promptSha256: sha(system), schemaSha256: sha(JSON.stringify(schema)) };
}

function valid(value: unknown, f: Fixture, arm: Arm): value is Scene {
  const v = value as Scene | undefined;
  const keys = arm === "C" ? ["dialogue"] : ["dialogue", "ending"];
  if (!v || typeof v !== "object" || Object.keys(v).sort().join() !== keys.sort().join()) return false;
  if (!Array.isArray(v.dialogue) || !v.dialogue.length || !v.dialogue.every(d => d && Object.keys(d).sort().join() === "speaker,text" && (f.script ?? script).cast.some(c => c.name === d.speaker) && typeof d.text === "string" && d.text.trim())) return false;
  if (arm === "C" || v.ending === null) return true;
  const endingKeys = arm === "B" ? ["kind", "outcome"] : ["choice", "kind", "level", "outcome", "question", "relationship"];
  return !!v.ending && typeof v.ending === "object" && Object.keys(v.ending).sort().join() === endingKeys.sort().join() && ["성공", "타협", "실패"].includes(v.ending.kind!) && Object.values(v.ending).every(s => typeof s === "string" && s.trim());
}

const command = process.argv[2] ?? "prepare";
if (command === "prepare") {
  assert(!existsSync(resolve(out, "responses.jsonl")), "Do not rewrite a started experiment");
  mkdirSync(out, { recursive: true });
  const model = resolveModelId();
  assert(model === "openai/gpt-5.6-luna", "Only Luna is authorized for this experiment");
  assert(script.cast.every(c => c.persona.length > 10), "Missing character persona");
  const factLines = (s: string) => s.split("\n").filter(l => l.startsWith("- ")).sort();
  assert(JSON.stringify(factLines(script.stage)) === JSON.stringify(factLines(groupedStage)), "D changed stage facts");
  const cases = await Promise.all(fixtures.map(async f => ({ ...f, script: f.script ?? script, conditions: await Promise.all(arms.map(a => condition(f, a))) })));
  const jobs = fixtures.flatMap(f => arms.flatMap(arm => Array.from({length: 5}, (_, i) => ({ id: `${f.id}-${arm}-${i + 1}`, fixtureId: f.id, arm, repetition: i + 1 }))));
  jobs.sort((a, b) => sha(`20260914-luna:${a.id}`).localeCompare(sha(`20260914-luna:${b.id}`)));
  const manifest = { createdAt: new Date().toISOString(), baseCommit: execFileSync("git", ["rev-parse", "HEAD"], {cwd: repo, encoding: "utf8"}).trim(), model, aiVersion: "7.0.58", calls: jobs.length, concurrency: 3, timeoutMs: 120000, maxRetries: 0, sampling: "production defaults; no explicit temperature, seed, reasoning effort or token limit", memories: [], randomization: "sort SHA256 of 20260914-luna:jobId", cases, jobs };
  write("manifest.json", manifest);
  write("preflight.json", { okay: true, model, calls: jobs.length, factsPreservedInD: true, fixtureCount: cases.length, finalInputs: cases.map(f => ({ id: f.id, last: f.messages.at(-1), expectedEnding: f.expectedEnding })), schemaFields: cases[0]!.conditions.map(c => ({ arm: c.arm, top: c.schema.required, ending: c.schema.properties.ending?.anyOf[1].required })) });
  console.log(JSON.stringify({ prepared: out, calls: jobs.length, model }));
} else if (command === "run") {
  const manifestText = readFileSync(resolve(out, "manifest.json"), "utf8");
  const manifest = JSON.parse(manifestText);
  assert(resolveModelId() === manifest.model && manifest.model === "openai/gpt-5.6-luna", "Model config changed");
  assert(process.env.AI_GATEWAY_API_KEY, "Missing Gateway credential");
  for (const f of fixtures) {
    const frozen = manifest.cases.find((c: Fixture) => c.id === f.id);
    assert(JSON.stringify(f.messages) === JSON.stringify(frozen.messages), "Fixture changed after freeze");
    for (const arm of arms) {
      const current = await condition(f, arm);
      const saved = frozen.conditions.find((c: {arm: Arm}) => c.arm === arm);
      assert(current.promptSha256 === saved.promptSha256 && current.schemaSha256 === saved.schemaSha256, "Prompt/schema changed after freeze");
    }
  }
  const file = resolve(out, "responses.jsonl");
  const previous: any[] = existsSync(file) ? readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
  const done = new Set(previous.map(r => r.id));
  const pending = manifest.jobs.filter((j: {id: string}) => !done.has(j.id));
  let cursor = 0;
  let completed = previous.length;
  let consecutiveErrors = 0;
  const sanitize = (error: unknown) => String(error instanceof Error ? `${error.name}: ${error.message}` : error).replaceAll(process.env.AI_GATEWAY_API_KEY!, "[redacted]").slice(0, 1800);
  async function worker() {
    while (cursor < pending.length && consecutiveErrors < 3) {
      const job = pending[cursor++];
      const f = manifest.cases.find((c: Fixture) => c.id === job.fixtureId);
      const c = f.conditions.find((x: {arm: Arm}) => x.arm === job.arm);
      const start = performance.now();
      const deltas: {elapsedMs: number; text: string}[] = [];
      const errors: string[] = [];
      const record: any = {...job, requestedAt: new Date().toISOString(), model: manifest.model, manifestSha256: sha(manifestText)};
      const output = job.arm === "A" || job.arm === "D" ? episodeSceneOutput(f.script) : Output.object({schema: jsonSchema<Scene>(c.schema, {validate: value => valid(value, f, job.arm) ? {success: true, value} : {success: false, error: new Error("Invalid reduced scene")}})});
      const result = streamText({ model: manifest.model, system: c.system, messages: f.messages, output, maxRetries: manifest.maxRetries, abortSignal: AbortSignal.timeout(manifest.timeoutMs), onError: ({error}) => { errors.push(sanitize(error)); } });
      try {
        await streamEpisodeScene({ partialOutputStream: result.partialOutputStream, output: Promise.resolve({dialogue: [], ending: null} as EpisodeScene) }, {merge() {throw new Error("No stream merge in eval");}, onError: undefined, write(chunk) {if (chunk.type === "text-delta") deltas.push({elapsedMs: Math.round(performance.now() - start), text: chunk.delta});}}, f.script);
        record.scene = await result.output;
        record.valid = valid(record.scene, f, job.arm);
        consecutiveErrors = 0;
      } catch (e) { record.error = sanitize(e); consecutiveErrors += 1; }
      record.elapsedMs = Math.round(performance.now() - start);
      record.firstDialogueMs = deltas[0]?.elapsedMs ?? null;
      record.deltas = deltas;
      record.streamErrors = errors;
      const extras = await Promise.allSettled([result.text, result.usage, result.finishReason, result.finalStep]);
      for (const [i, key] of ["rawText", "usage", "finishReason", "step"].entries()) {
        const r = extras[i]!;
        if (r.status !== "fulfilled") continue;
        if (key === "step") {
          const step = r.value as any;
          record.response = {modelId: step.response?.modelId, id: step.response?.id, timestamp: step.response?.timestamp};
          const meta = step.providerMetadata?.gateway;
          record.gateway = meta ? { cost: meta.cost, marketCost: meta.marketCost, generationId: meta.generationId, routing: meta.routing } : undefined;
          record.warnings = step.warnings;
        } else record[key] = r.value;
      }
      appendFileSync(file, JSON.stringify(record) + "\n");
      completed += 1;
      console.log(JSON.stringify({ completed, total: manifest.calls, id: job.id, okay: record.valid ?? false, elapsedMs: record.elapsedMs, firstDialogueMs: record.firstDialogueMs, error: record.error }));
    }
  }
  await Promise.all(Array.from({length: manifest.concurrency}, () => worker()));
  assert(completed === manifest.calls, `Stopped after repeated errors: ${completed}/${manifest.calls}`);
  console.log("COMPLETE");
} else { throw new Error("Use prepare or run"); }
