import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const dir = resolve(import.meta.dir, "data");
const read = (name: string) => JSON.parse(readFileSync(resolve(dir, name), "utf8"));
const write = (name: string, value: unknown) => writeFileSync(resolve(dir, name), JSON.stringify(value, null, 2) + "\n");
const rows = readFileSync(resolve(dir, "responses.jsonl"), "utf8").trim().split("\n").map(s => JSON.parse(s));
const scenes = rows.filter(r => r.arm !== "facts");
const m = read("manifest.json");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
if (process.argv[2] === "mask") {
  if (rows.length !== 160 || scenes.length !== 120) throw new Error("Incomplete run");
  const ordered = [...scenes].sort((a, b) => sha(`roles-blind:${a.id}`).localeCompare(sha(`roles-blind:${b.id}`)));
  const blind = ordered.map((r, i) => ({reviewId: `V${String(i + 1).padStart(3, "0")}`, fixtureId: r.fixtureId, dialogue: r.scene?.dialogue ?? [], error: r.error ?? null}));
  write("blind-dialogue.json", blind);
  write("blind-map.json", Object.fromEntries(blind.map((b, i) => [b.reviewId, ordered[i].id])));
  writeFileSync(resolve(dir, "blind-dialogue.txt"), blind.map(b => `${b.reviewId} ${b.fixtureId} | ${b.dialogue.map((d: any) => `${d.speaker}: ${d.text}`).join(" | ")}`).join("\n") + "\n");
  console.log(`Masked ${blind.length} scene outputs`);
} else if (process.argv[2] === "summarize") {
  if (rows.length !== m.calls || new Set(rows.map(r => r.id)).size !== m.calls) throw new Error("Missing or duplicate call");
  const notes = read("review.json");
  const map = read("blind-map.json");
  const notesByJob = Object.fromEntries(notes.observations.map((n: any) => [map[n.reviewId], n]));
  const facts = rows.filter(r => r.arm === "facts");
  const index = Object.fromEntries(rows.map(r => [r.id, r]));
  const canon = (xs: any[]) => xs.map(x => `${x.person}:${x.event}`).sort().join("|");
  const factChecks = facts.map(r => ({id: r.id, expected: m.cases.find((f: any) => f.id === r.fixtureId).expectedAppointments, actual: r.facts?.appointments ?? null, match: r.facts && canon(r.facts.appointments) === canon(m.cases.find((f: any) => f.id === r.fixtureId).expectedAppointments)}));
  const checks = scenes.map(r => {
    const f = m.cases.find((f: any) => f.id === r.fixtureId);
    const note = notesByJob[r.id] ?? null;
    return {id: r.id, fixtureId: r.fixtureId, arm: r.arm, schemaValid: r.valid === true, firstDialogueMs: r.firstDialogueMs, elapsedMs: r.elapsedMs, utterances: r.scene?.dialogue.length ?? 0, endingMatches: r.scene?.ending?.kind === f.expectedEnding, note, requiredMention: f.requiredMention, factSourceMatches: r.factSourceId ? index[r.factSourceId].factsMatch : null};
  });
  const total = (rs: any[], fn: (r: any) => number) => rs.reduce((n, r) => n + fn(r), 0);
  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length / 2) - 1];
  const arms = ["A", "R", "S"].map(arm => {
    const rs = scenes.filter(r => r.arm === arm);
    const cs = checks.filter(c => c.arm === arm);
    const issues = (rs: any[], code: string) => rs.filter(r => r.note?.categories.includes(code)).length;
    return {arm, n: rs.length, schemaValid: cs.filter(c => c.schemaValid).length, wrongOwner: issues(cs, "wrong-owner"), unsupportedSchedule: issues(cs, "unsupported-schedule"), ambiguous: issues(cs, "ambiguous-target"), missingRequired: issues(cs, "missing-required"), requiredResponseCount: cs.filter(c => c.requiredMention.length).length, correctEnding: cs.filter(c => c.endingMatches).length, oneOrTwoUtterances: cs.filter(c => c.utterances >= 1 && c.utterances <= 2).length, sceneCostUsd: total(rs, r => Number(r.gateway?.cost ?? 0)), totalCostWithExtractionUsd: total(rs, r => Number(r.gateway?.cost ?? 0) + (r.factSourceId ? Number(index[r.factSourceId].gateway?.cost ?? 0) : 0)), medianSceneFirstDialogueMs: median(rs.map(r => r.firstDialogueMs)), medianSceneElapsedMs: median(rs.map(r => r.elapsedMs)), estimatedSerialFirstDialogueMs: median(rs.map(r => r.firstDialogueMs + (r.factSourceId ? index[r.factSourceId].elapsedMs : 0))), estimatedSerialElapsedMs: median(rs.map(r => r.elapsedMs + (r.factSourceId ? index[r.factSourceId].elapsedMs : 0))), byFixture: m.cases.map((f: any) => {const subset = cs.filter(c => c.fixtureId === f.id); return {fixtureId: f.id, wrongOwner: issues(subset, "wrong-owner"), unsupportedSchedule: issues(subset, "unsupported-schedule"), ambiguous: issues(subset, "ambiguous-target"), missingRequired: issues(subset, "missing-required"), correctEnding: subset.filter(c => c.endingMatches).length};})};
  });
  const summary = {calls: rows.length, requestErrors: rows.filter(r => r.error).map(r => ({id: r.id, error: r.error})), models: [...new Set(rows.map(r => r.response?.modelId))], providers: [...new Set(rows.map(r => r.gateway?.routing?.finalProvider))], costUsd: total(rows, r => Number(r.gateway?.cost ?? 0)), factExtraction: {n: facts.length, exactMatches: factChecks.filter(f => f.match).length, costUsd: total(facts, r => Number(r.gateway?.cost ?? 0)), medianMs: median(facts.map(f => f.elapsedMs))}, arms};
  write("fact-checks.json", factChecks);
  write("checks.json", checks);
  write("summary.json", summary);
  console.log(JSON.stringify(summary, null, 2));
} else {throw new Error("Use mask or summarize");}
