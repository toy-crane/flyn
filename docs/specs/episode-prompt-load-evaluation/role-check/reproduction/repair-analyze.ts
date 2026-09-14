import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const dir = resolve(import.meta.dir, "repair");
const read = (name: string) => JSON.parse(readFileSync(resolve(dir, name), "utf8"));
const write = (name: string, data: unknown) => writeFileSync(resolve(dir, name), JSON.stringify(data, null, 2) + "\n");
const rows = readFileSync(resolve(dir, "responses.jsonl"), "utf8").trim().split("\n").map(s => JSON.parse(s));
if (process.argv[2] === "mask") {
  const ordered = [...rows].sort((a, b) => a.response.id.localeCompare(b.response.id));
  const blind = ordered.map((r, i) => ({reviewId: `P${String(i + 1).padStart(3, "0")}`, fixtureId: r.fixtureId, dialogue: r.scene.dialogue}));
  write("masked-dialogue.json", blind);
  write("masked-map.json", Object.fromEntries(blind.map((b, i) => [b.reviewId, ordered[i].id])));
  writeFileSync(resolve(dir, "masked-dialogue.txt"), blind.map(b => `${b.reviewId} ${b.fixtureId} | ${b.dialogue.map((d: any) => `${d.speaker}: ${d.text}`).join(" | ")}`).join("\n") + "\n");
} else if (process.argv[2] === "summarize") {
  const m = read("manifest.json");
  const review = read("review.json");
  const map = read("masked-map.json");
  const notes = Object.fromEntries(review.observations.map((n: any) => [map[n.reviewId], n]));
  const baselineChecks = JSON.parse(readFileSync(resolve(import.meta.dir, "data/checks.json"), "utf8"));
  const hard = (note: any) => note?.categories.some((c: string) => ["wrong-owner", "unsupported-schedule"].includes(c)) ?? false;
  const checks = rows.map(r => ({id: r.id, sourceId: r.draftSourceId, originalHardError: hard(baselineChecks.find((c: any) => c.id === r.draftSourceId)?.note), repairedHardError: hard(notes[r.id]), observation: notes[r.id] ?? null, endingMatches: r.scene?.ending?.kind === "성공", utteranceCount: r.scene?.dialogue.length ?? 0, schemaValid: r.valid === true}));
  if (rows.length !== 40 || new Set(rows.map(r => r.draftSourceId)).size !== 40) throw new Error("Need every baseline draft once");
  const sum = (fn: (r: any) => number) => rows.reduce((s, r) => s + fn(r), 0);
  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length / 2) - 1];
  const summary = {n: rows.length, schemaValid: checks.filter(c => c.schemaValid).length, models: [...new Set(rows.map(r => r.response.modelId))], originalHardErrors: checks.filter(c => c.originalHardError).length, repairedHardErrors: checks.filter(c => c.repairedHardError).length, corrected: checks.filter(c => c.originalHardError && !c.repairedHardError).length, remaining: checks.filter(c => c.originalHardError && c.repairedHardError).length, newlyIntroduced: checks.filter(c => !c.originalHardError && c.repairedHardError).length, correctEndings: checks.filter(c => c.endingMatches).length, oneOrTwoUtterances: checks.filter(c => c.utteranceCount >= 1 && c.utteranceCount <= 2).length, repairOnlyCostUsd: sum(r => Number(r.gateway.cost)), pipelineCostWithDraftUsd: sum(r => r.totalCostWithDraftUsd), medianRepairElapsedMs: median(rows.map(r => r.elapsedMs)), estimatedMedianSerialFirstDialogueMs: median(rows.map(r => r.estimatedSerialFirstDialogueMs)), estimatedMedianSerialElapsedMs: median(rows.map(r => r.estimatedSerialElapsedMs)), byFixture: m.cases.map((f: any) => {const cs = checks.filter(c => rows.find(r => r.id === c.id).fixtureId === f.id); return {fixtureId: f.id, n: cs.length, roleErrors: cs.filter(c => c.repairedHardError).length, correctEnding: cs.filter(c => c.endingMatches).length};})};
  write("checks.json", checks);
  write("summary.json", summary);
  console.log(JSON.stringify(summary, null, 2));
} else {throw new Error("Use mask or summarize");}
