import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  type CorrectionDraft,
  correctionSystemPrompt,
  judgeExpression,
} from "../src/features/episode/correction";
import { resolveModelId } from "../src/shared/model-id";
import {
  CORRECTION_CASES,
  type CorrectionCase,
  correctionViolations,
} from "./correction-cases";

const model = resolveModelId();
const records: unknown[] = [];
let failed = 0;
const baseline = process.argv.includes("--baseline");
const CONCURRENCY = 2;
interface EvaluationRecord {
  output: CorrectionDraft;
  round: number;
  sample: CorrectionCase;
  violations: string[];
}
for (let round = 1; round <= 3; round += 1) {
  const results: PromiseSettledResult<EvaluationRecord>[] = [];
  for (let start = 0; start < CORRECTION_CASES.length; start += CONCURRENCY) {
    const batch = CORRECTION_CASES.slice(start, start + CONCURRENCY);
    // biome-ignore lint/performance/noAwaitInLoops: 게이트웨이 시간 제한을 피하려고 동시 호출 수를 제한한다
    const settled = await Promise.allSettled(
      batch.map(async (sample) => {
        const result = await judgeExpression({
          context: sample.context ?? [],
          messageId: `evaluation-${round}`,
          model,
          original: sample.original,
          signal: AbortSignal.timeout(30_000),
        });
        const object: CorrectionDraft =
          result.status === "corrected"
            ? {
                entries: result.correction.entries,
                fixed: result.correction.fixed,
                review: result.correction.review,
                status: "corrected",
              }
            : {
                entries: [],
                fixed: result.status === "natural" ? sample.original : "",
                review: null,
                status: result.status,
              };
        const violations = correctionViolations(sample, object);
        return { output: object, round, sample, violations };
      })
    );
    results.push(...settled);
  }
  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      records.push(result.value);
      if (result.value.violations.length) {
        failed += 1;
        console.log(
          `${round}회 ${result.value.sample.name}: ${result.value.violations.join(", ")}`
        );
      }
    } else {
      failed += 1;
      records.push({
        error: String(result.reason),
        round,
        sample: CORRECTION_CASES[index],
      });
      console.log(
        `${round}회 ${CORRECTION_CASES[index]?.name}: ${String(result.reason)}`
      );
    }
  }
  console.log(`${round}회 완료`);
}
const directory = join(import.meta.dir, "results");
await mkdir(directory, { recursive: true });
const path = join(
  directory,
  `correction-${baseline ? "baseline" : "candidate"}-${Date.now()}.json`
);
await writeFile(
  path,
  JSON.stringify(
    {
      failed,
      model,
      prompt: correctionSystemPrompt(),
      recordedAt: new Date().toISOString(),
      records,
    },
    null,
    2
  )
);
console.log(
  `${records.length}개 중 ${records.length - failed}개 통과. 기록: ${path}`
);
if (failed) {
  process.exitCode = 1;
}
