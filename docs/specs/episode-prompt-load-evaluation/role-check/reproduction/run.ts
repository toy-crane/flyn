import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { jsonSchema, Output, streamText } from "ai";
import { episodeSystemPrompt } from "./src/features/episode/episode";
import { episodeSceneOutput, streamEpisodeScene, type EpisodeScene } from "./src/features/episode/scene";
import { resolveModelId } from "./src/shared/model-id";
import { cases, factInstruction, repo, roleRule, type Appointment } from "./cases";

const out = resolve(import.meta.dir, "data");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const write = (name: string, data: unknown) => writeFileSync(resolve(out, name), JSON.stringify(data, null, 2) + "\n");
function assert(v: unknown, message: string): asserts v { if (!v) throw new Error(message); }
const ledgerPrefix = "\n\n앞 대화에서 먼저 읽어 둔 일정:\n아래 데이터는 일정의 주인을 확인하는 보조 기록이다. 원문과 맞는 사실을 대사에도 같은 사람의 사실로 유지한다.\n";
const factSchema = (names: string[]) => ({type: "object", additionalProperties: false, properties: {appointments: {type: "array", items: {type: "object", additionalProperties: false, properties: {person: {type: "string", enum: ["USER", ...names]}, event: {type: "string", enum: ["meeting", "train"]}}, required: ["person", "event"]}}}, required: ["appointments"]});
type Facts = {appointments: Appointment[]};
function validFacts(v: unknown, names: string[]): v is Facts {
  const f = v as Facts | null;
  return !!f && Object.keys(f).join() === "appointments" && Array.isArray(f.appointments) && f.appointments.every(a => a && Object.keys(a).sort().join() === "event,person" && ["USER", ...names].includes(a.person) && ["meeting", "train"].includes(a.event));
}
const canonical = (facts: Appointment[]) => facts.map(f => `${f.person}:${f.event}`).sort().join("|");
async function configurations() {
  return await Promise.all(cases.map(async f => {
    const format = await episodeSceneOutput(f.script).responseFormat;
    assert(format?.type === "json" && format.schema, "Production output changed");
    const base = episodeSystemPrompt(f.script);
    return {...f, baseSystem: base, ruleSystem: `${base}\n\n${roleRule}`, factSystem: `${factInstruction}\n\n등장인물: ${f.script.cast.map(c => c.name).join(", ")}\n\n${f.script.stage}`, sceneSchema: format.schema, factSchema: factSchema(f.script.cast.map(c => c.name))};
  }));
}
const command = process.argv[2] ?? "prepare";
if (command === "prepare") {
  assert(!existsSync(resolve(out, "responses.jsonl")), "Do not rewrite a started experiment");
  const model = resolveModelId();
  assert(model === "openai/gpt-5.6-luna", "Only Luna is authorized");
  mkdirSync(out, {recursive: true});
  const inputs = await configurations();
  const jobs = cases.flatMap(f => ["facts", "A", "R", "S"].flatMap(arm => Array.from({length: 5}, (_, i) => ({id: `${f.id}-${arm}-${i + 1}`, fixtureId: f.id, arm, repetition: i + 1}))));
  jobs.sort((a, b) => sha(`role-check-20260914:${a.id}`).localeCompare(sha(`role-check-20260914:${b.id}`)));
  write("manifest.json", {createdAt: new Date().toISOString(), baseCommit: execFileSync("git", ["rev-parse", "HEAD"], {cwd: repo, encoding: "utf8"}).trim(), model, aiVersion: "7.0.58", cases: inputs, ledgerPrefix, jobs, calls: jobs.length, sceneCalls: 120, factCalls: 40, concurrency: 3, maxRetries: 0, timeoutMs: 120000, generationOptions: "Production defaults; no explicit temperature, seed, reasoning effort, or token cap. All facts run before shuffled scenes; S uses the matched factual extraction without gold repair."});
  write("preflight.json", {model, calls: jobs.length, sameFullSceneSchemaInEveryArm: true, reversedOwnerContradictionCheck: true, goldAppointmentsNeverSentAsLedger: true, scenarios: inputs.map(f => ({id: f.id, expectedAppointments: f.expectedAppointments, requiredMention: f.requiredMention, lastInput: f.messages.at(-1)}))});
  console.log(`Prepared ${jobs.length} Luna calls in ${out}`);
} else if (command === "run") {
  const manifestText = readFileSync(resolve(out, "manifest.json"), "utf8");
  const m = JSON.parse(manifestText);
  assert(resolveModelId() === m.model && m.model === "openai/gpt-5.6-luna", "Model changed");
  assert(process.env.AI_GATEWAY_API_KEY, "Missing Gateway key");
  assert(JSON.stringify(await configurations()) === JSON.stringify(m.cases), "Inputs changed after freeze");
  assert(ledgerPrefix === m.ledgerPrefix, "Ledger format changed");
  const file = resolve(out, "responses.jsonl");
  const records: any[] = existsSync(file) ? readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(s => JSON.parse(s)) : [];
  const completed = new Map(records.map(r => [r.id, r]));
  let errorStreak = 0;
  const sanitize = (e: unknown) => String(e instanceof Error ? `${e.name}: ${e.message}` : e).replaceAll(process.env.AI_GATEWAY_API_KEY!, "[redacted]").slice(0, 1600);
  async function call(job: any) {
    const f = m.cases.find((c: any) => c.id === job.fixtureId);
    const isFacts = job.arm === "facts";
    const source = job.arm === "S" ? completed.get(`${job.fixtureId}-facts-${job.repetition}`) : undefined;
    assert(job.arm !== "S" || source?.facts, "Required fact extraction failed; stop instead of using gold");
    const system = isFacts ? f.factSystem : job.arm === "A" ? f.baseSystem : f.ruleSystem + (source ? ledgerPrefix + JSON.stringify(source.facts) : "");
    const record: any = {...job, requestedAt: new Date().toISOString(), model: m.model, manifestSha256: sha(manifestText), systemSha256: sha(system), factSourceId: source?.id, factLedger: source?.facts};
    const started = performance.now();
    const deltas: {elapsedMs: number; text: string}[] = [];
    const errors: string[] = [];
    const output = isFacts ? Output.object({schema: jsonSchema<Facts>(f.factSchema, {validate: value => validFacts(value, f.script.cast.map((c: any) => c.name)) ? {success: true, value} : {success: false, error: new Error("Invalid facts")}})}) : episodeSceneOutput(f.script);
    const result = streamText({model: m.model, system, messages: f.messages, output, abortSignal: AbortSignal.timeout(m.timeoutMs), maxRetries: m.maxRetries, onError: ({error}) => {errors.push(sanitize(error));}});
    try {
      if (isFacts) {
        for await (const _ of result.partialOutputStream) { /* Consume before awaiting complete object. */ }
        record.facts = await result.output;
        record.factsMatch = canonical(record.facts.appointments) === canonical(f.expectedAppointments);
      } else {
        await streamEpisodeScene({partialOutputStream: result.partialOutputStream as AsyncIterable<{dialogue?: ({speaker?: string; text?: string} | undefined)[]}>, output: Promise.resolve({dialogue: [], ending: null} as EpisodeScene)}, {merge() {throw new Error("No merge in eval");}, onError: undefined, write(chunk) {if (chunk.type === "text-delta") deltas.push({elapsedMs: Math.round(performance.now() - started), text: chunk.delta});}}, f.script);
        record.scene = await result.output;
      }
      record.valid = true;
      errorStreak = 0;
    } catch (e) {record.error = sanitize(e); errorStreak += 1;}
    record.elapsedMs = Math.round(performance.now() - started);
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
        const g = step.providerMetadata?.gateway;
        record.gateway = g ? {cost: g.cost, generationId: g.generationId, routing: g.routing} : null;
      } else record[key] = r.value;
    }
    appendFileSync(file, JSON.stringify(record) + "\n");
    completed.set(job.id, record);
    console.log(JSON.stringify({completed: completed.size, total: m.calls, id: job.id, valid: record.valid ?? false, error: record.error}));
  }
  for (const phase of ["facts", "scenes"]) {
    const jobs = m.jobs.filter((j: any) => (phase === "facts" ? j.arm === "facts" : j.arm !== "facts") && !completed.has(j.id));
    let cursor = 0;
    await Promise.all(Array.from({length: m.concurrency}, async () => {while (cursor < jobs.length && errorStreak < 3) await call(jobs[cursor++]);}));
    assert(errorStreak < 3, "Repeated errors; stopped without replacing samples");
  }
  assert(completed.size === m.calls, "Missing calls");
  console.log("COMPLETE");
} else {throw new Error("Use prepare or run");}
