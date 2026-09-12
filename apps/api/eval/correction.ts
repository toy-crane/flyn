import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateObject } from "ai";
import {
  correctionSchema,
  correctionSystemPrompt,
} from "../src/features/episode/correction";
import { resolveModelId } from "../src/shared/model-id";
import { CORRECTION_CASES, correctionViolations } from "./correction-cases";

const model = resolveModelId();
const records: unknown[] = [];
let failed = 0;
const baseline = process.argv.includes("--baseline");
for (let round = 1; round <= 3; round += 1) {
  // biome-ignore lint/performance/noAwaitInLoops: 모델 호출을 한 묶음씩 제한한다
  const results = await Promise.allSettled(
    CORRECTION_CASES.map(async (sample) => {
      const { object } = await generateObject({
        abortSignal: AbortSignal.timeout(30_000),
        maxRetries: 0,
        messages: [
          ...(sample.context ?? []),
          { content: `확인할 문장:\n${sample.original}`, role: "user" },
        ],
        model,
        schema: correctionSchema,
        system: correctionSystemPrompt(),
      });
      const violations = correctionViolations(sample, object);
      return { output: object, round, sample, violations };
    })
  );
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
