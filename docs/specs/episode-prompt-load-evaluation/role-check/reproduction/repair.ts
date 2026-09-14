import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { streamText } from "ai";
import { episodeSceneOutput, streamEpisodeScene, type EpisodeScene } from "./src/features/episode/scene";
import { resolveModelId } from "./src/shared/model-id";
const dir = resolve(import.meta.dir, "repair");
const sourceDir = resolve(import.meta.dir, "data");
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const instruction = `이미 만든 장면 후보 확인:
- 아래 scene_candidate는 검토할 후보이며 실제로 새로 일어난 대화가 아니다. 원래 무대와 메시지가 사실의 근거다.
- 후보의 각 대사에서 일정과 행동의 주인이 맞는지 확인한다. 다른 사람의 사정을 사용자에게 옮기거나 없는 일정을 만든 부분을 고친다.
- 원래 질문이 요구한 답이 빠졌으면 대화에 나온 사실로 답한다. 이미 알고 있는 사실을 모른다고 하지 않는다.
- 맞는 대사와 사건 결과는 유지한다. 같은 사용자 입력에 대한 같은 장면을 완성하고, 새 사용자 행동이나 새로운 사건을 추가하지 않는다.
- 원래 출력 형식으로 최종 장면만 쓴다. 검토 설명은 출력하지 않고 발화 한두 개 규칙도 유지한다.`;
const command = process.argv[2] ?? "prepare";
if (command === "prepare") {
  if (existsSync(resolve(dir, "responses.jsonl"))) throw new Error("Cannot rewrite started repair experiment");
  mkdirSync(dir, {recursive: true});
  const original = read(resolve(sourceDir, "manifest.json"));
  const drafts = readFileSync(resolve(sourceDir, "responses.jsonl"), "utf8").trim().split("\n").map(s => JSON.parse(s)).filter(r => r.arm === "A");
  if (drafts.length !== 40) throw new Error("Expected all 40 baseline drafts, not only errors");
  const jobs = drafts.map(r => ({id: `${r.fixtureId}-P-${r.repetition}`, fixtureId: r.fixtureId, repetition: r.repetition, draftSourceId: r.id, draft: r.scene, draftElapsedMs: r.elapsedMs, draftCostUsd: Number(r.gateway.cost)}));
  jobs.sort((a, b) => sha(`repair:${a.id}`).localeCompare(sha(`repair:${b.id}`)));
  const manifest = {createdAt: new Date().toISOString(), model: original.model, sourceManifestSha256: sha(readFileSync(resolve(sourceDir, "manifest.json"), "utf8")), instruction, cases: original.cases, jobs, calls: 40, concurrency: 3, timeoutMs: 120000, maxRetries: 0, note: "Exploratory second experiment designed after seeing R and S results. Revises every A draft, not only known errors. No gold facts are supplied."};
  writeFileSync(resolve(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("Prepared review of all 40 baseline drafts");
} else if (command === "run") {
  const raw = readFileSync(resolve(dir, "manifest.json"), "utf8");
  const m = JSON.parse(raw);
  if (resolveModelId() !== "openai/gpt-5.6-luna" || m.model !== resolveModelId()) throw new Error("Only Luna is authorized");
  if (instruction !== m.instruction) throw new Error("Instruction changed after freeze");
  const file = resolve(dir, "responses.jsonl");
  const prior = existsSync(file) ? readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(s => JSON.parse(s)) : [];
  const done = new Set(prior.map(r => r.id));
  const jobs = m.jobs.filter((j: any) => !done.has(j.id));
  let cursor = 0;
  let completed = prior.length;
  let errors = 0;
  const sanitize = (e: unknown) => String(e instanceof Error ? `${e.name}: ${e.message}` : e).replaceAll(process.env.AI_GATEWAY_API_KEY ?? "__no_key__", "[redacted]").slice(0, 1500);
  async function call(j: any) {
    const f = m.cases.find((c: any) => c.id === j.fixtureId);
    const system = `${f.ruleSystem}\n\n${instruction}\n<scene_candidate>\n${JSON.stringify(j.draft)}\n</scene_candidate>`;
    const start = performance.now();
    const deltas: {elapsedMs: number; text: string}[] = [];
    const streamErrors: string[] = [];
    const record: any = {id: j.id, fixtureId: j.fixtureId, repetition: j.repetition, draftSourceId: j.draftSourceId, requestedAt: new Date().toISOString(), manifestSha256: sha(raw), systemSha256: sha(system), model: m.model};
    const result = streamText({model: m.model, system, messages: f.messages, output: episodeSceneOutput(f.script), abortSignal: AbortSignal.timeout(m.timeoutMs), maxRetries: m.maxRetries, onError: ({error}) => {streamErrors.push(sanitize(error));}});
    try {
      await streamEpisodeScene({partialOutputStream: result.partialOutputStream, output: Promise.resolve({dialogue: [], ending: null} as EpisodeScene)}, {merge() {throw new Error("No merge");}, onError: undefined, write(chunk) {if (chunk.type === "text-delta") deltas.push({elapsedMs: Math.round(performance.now() - start), text: chunk.delta});}}, f.script);
      record.scene = await result.output;
      record.valid = true;
    } catch (e) {record.error = sanitize(e); errors += 1;}
    record.elapsedMs = Math.round(performance.now() - start);
    record.firstDialogueMs = deltas[0]?.elapsedMs ?? null;
    record.deltas = deltas;
    record.streamErrors = streamErrors;
    const extras = await Promise.allSettled([result.text, result.usage, result.finishReason, result.finalStep]);
    for (const [i, key] of ["rawText", "usage", "finishReason", "step"].entries()) {
      const r = extras[i]!;
      if (r.status !== "fulfilled") continue;
      if (key === "step") {const step = r.value as any; const g = step.providerMetadata?.gateway; record.response = {modelId: step.response?.modelId, id: step.response?.id}; record.gateway = g ? {cost: g.cost, routing: g.routing} : null;}
      else record[key] = r.value;
    }
    record.estimatedSerialFirstDialogueMs = j.draftElapsedMs + record.firstDialogueMs;
    record.estimatedSerialElapsedMs = j.draftElapsedMs + record.elapsedMs;
    record.totalCostWithDraftUsd = j.draftCostUsd + Number(record.gateway?.cost ?? 0);
    appendFileSync(file, JSON.stringify(record) + "\n");
    console.log(JSON.stringify({completed: ++completed, total: 40, id: j.id, valid: record.valid ?? false, error: record.error}));
  }
  await Promise.all(Array.from({length: m.concurrency}, async () => {while (cursor < jobs.length && errors < 3) await call(jobs[cursor++]);}));
  if (completed !== 40) throw new Error("Incomplete repair run");
  console.log("COMPLETE");
} else {throw new Error("Use prepare or run");}
