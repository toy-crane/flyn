import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const out = resolve(import.meta.dir, "primary");
const read = (name: string) => JSON.parse(readFileSync(resolve(out, name), "utf8"));
const write = (name: string, value: unknown) => writeFileSync(resolve(out, name), JSON.stringify(value, null, 2) + "\n");
const rows = readFileSync(resolve(out, "responses.jsonl"), "utf8").trim().split("\n").map(s => JSON.parse(s));
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
if (process.argv[2] === "mask") {
  const shuffled = [...rows].sort((a, b) => sha(`review-before-unmask:${a.id}`).localeCompare(sha(`review-before-unmask:${b.id}`)));
  const blind = shuffled.map((r, i) => ({reviewId: `R${String(i + 1).padStart(3, "0")}`, fixtureId: r.fixtureId, dialogue: r.scene?.dialogue ?? null, error: r.error ?? null}));
  write("blind-dialogue.json", blind);
  write("blind-map.json", Object.fromEntries(blind.map((b, i) => [b.reviewId, shuffled[i].id])));
  writeFileSync(resolve(out, "blind-dialogue.txt"), blind.map(b => `${b.reviewId} ${b.fixtureId} | ${(b.dialogue ?? []).map((d: any) => `${d.speaker}: ${d.text}`).join(" | ")}`).join("\n") + "\n");
  console.log(`Masked ${blind.length} responses`);
} else if (process.argv[2] === "summarize") {
  const manifest = read("manifest.json");
  const notes = read("dialogue-review.json");
  const map = read("blind-map.json");
  const annotations = Object.fromEntries(notes.observations.map((n: any) => [map[n.reviewId], n]));
  if (rows.length !== manifest.calls || new Set(rows.map(r => r.id)).size !== manifest.calls) throw new Error("Missing/duplicate calls");
  const fById = Object.fromEntries(manifest.cases.map((f: any) => [f.id, f]));
  const detailed = rows.map(r => ({id: r.id, arm: r.arm, fixtureId: r.fixtureId, requestSucceeded: !r.error, schemaValid: r.valid === true, allowedSpeakers: r.scene?.dialogue.every((d: any) => fById[r.fixtureId].script.cast.some((c: any) => c.name === d.speaker)), oneOrTwoUtterances: r.scene?.dialogue.length >= 1 && r.scene.dialogue.length <= 2, expectedEnding: fById[r.fixtureId].expectedEnding, actualEnding: r.scene?.ending?.kind ?? null, endingMatches: r.arm === "C" ? null : (r.scene?.ending?.kind ?? null) === fById[r.fixtureId].expectedEnding, forbiddenUserWordInRecords: ["A", "D"].includes(r.arm) && r.scene?.ending ? ["choice", "relationship", "question", "level"].some(k => r.scene.ending[k].includes("사용자")) : null, dialogueObservation: annotations[r.id] ?? null}));
  const percentile = (values: number[], p: number) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
  };
  const sum = (rs: any[], fn: (r: any) => number) => rs.reduce((s, r) => s + fn(r), 0);
  const summaries = ["A", "B", "C", "D"].map(arm => {
    const rs = rows.filter(r => r.arm === arm);
    const ds = detailed.filter(r => r.arm === arm);
    const issueCount = (category: string) => ds.filter(d => d.dialogueObservation?.category === category).length;
    return {arm, n: rs.length, successful: ds.filter(d => d.requestSucceeded).length, schemaValid: ds.filter(d => d.schemaValid).length, oneOrTwoUtterances: ds.filter(d => d.oneOrTwoUtterances).length, correctEndings: arm === "C" ? null : ds.filter(d => d.endingMatches).length, endingDenominator: arm === "C" ? 0 : ds.length, meetingOwnerErrors: issueCount("meeting-owner"), inventedUserWork: issueCount("unsupported-work"), ambiguousDeadline: issueCount("ambiguous-deadline"), medianFirstDialogueMs: percentile(rs.map(r => r.firstDialogueMs), .5), p90FirstDialogueMs: percentile(rs.map(r => r.firstDialogueMs), .9), medianTotalMs: percentile(rs.map(r => r.elapsedMs), .5), p90TotalMs: percentile(rs.map(r => r.elapsedMs), .9), inputTokens: sum(rs, r => r.usage.inputTokens), outputTokens: sum(rs, r => r.usage.outputTokens), cachedReadTokens: sum(rs, r => r.usage.inputTokenDetails?.cacheReadTokens ?? 0), cachedWriteTokens: sum(rs, r => r.usage.inputTokenDetails?.cacheWriteTokens ?? 0), reasoningTokens: sum(rs, r => r.usage.outputTokenDetails?.reasoningTokens ?? 0), gatewayCostUsd: sum(rs, r => Number(r.gateway.cost)), byFixture: manifest.cases.map((f: any) => {const subset = ds.filter(d => d.fixtureId === f.id); return {fixtureId: f.id, n: subset.length, meetingOwnerErrors: subset.filter(d => d.dialogueObservation?.category === "meeting-owner").length, inventedUserWork: subset.filter(d => d.dialogueObservation?.category === "unsupported-work").length, ambiguousDeadline: subset.filter(d => d.dialogueObservation?.category === "ambiguous-deadline").length, correctEndings: arm === "C" ? null : subset.filter(d => d.endingMatches).length};})};
  });
  write("mechanical-checks.json", detailed);
  // A narrow regression flag for these six fixtures, where only Owen has a meeting.
  // This does not establish ownership in arbitrary dialogue or replace reading the output.
  const meetingFlag = (dialogue: any[]) => dialogue.some(d => d.speaker === "Owen" && /\b(?:your meeting|have a good meeting)\b/i.test(d.text));
  const oldEvidence = JSON.parse(readFileSync(resolve(process.cwd(), "../../docs/follow-ups/evidence/multi-person-dialogue-role-confusion/multi-cast-runtime-dialogue.json"), "utf8"));
  if (!meetingFlag(oldEvidence.observedTurns[2].dialogue)) throw new Error("Regression flag missed known old error");
  const meetingIds = rows.filter(r => meetingFlag(r.scene?.dialogue ?? [])).map(r => r.id).sort();
  const reviewedMeetingIds = detailed.filter(d => d.dialogueObservation?.category === "meeting-owner").map(d => d.id).sort();
  if (JSON.stringify(meetingIds) !== JSON.stringify(reviewedMeetingIds)) throw new Error("Check mechanical flag versus recorded reading");
  write("regression-check.json", {scope: "Six fixtures where Owen alone has a meeting. A phrase flag, not a general ownership judge.", knownOldErrorDetected: true, flagMatchesRecordedObservations: true, currentMeetingErrorIds: meetingIds, forbiddenUserWordInRecords: detailed.filter(d => d.forbiddenUserWordInRecords).map(d => d.id)});
  write("summary.json", {calls: rows.length, requestedModels: [...new Set(rows.map(r => r.model))], returnedModels: [...new Set(rows.map(r => r.response?.modelId))], providers: [...new Set(rows.map(r => r.gateway?.routing?.finalProvider))], providerAttempts: [...new Set(rows.map(r => r.gateway?.routing?.totalProviderAttemptCount))], gatewayCostUsd: sum(rows, r => Number(r.gateway.cost)), quantileMethod: "nearest-rank", firstRequest: rows.map(r => r.requestedAt).sort()[0], lastRequest: rows.map(r => r.requestedAt).sort().at(-1), arms: summaries});
  console.log(JSON.stringify(summaries, null, 2));
} else { throw new Error("Use mask or summarize"); }
