/**
 * Judgment harness — the regression gate for the turn-analysis prompt.
 *
 *   bun src/server/evals/judgment-eval.ts [--runs=3] [--case=<name>]
 *
 * Corrections and judgment share one prompt, so ANY turn-analysis prompt edit
 * (correction strength included) has to come back through here, not just
 * changes that look like judgment changes.
 *
 * Temperature 0 is not a seed: the same transcript can still drift. The gate
 * is therefore unanimity across runs on the clear-cut cases. A case that
 * flips is the signal this harness exists to catch — fix the prompt rather
 * than loosening the gate. `evidence` is printed for human reading, never
 * asserted.
 *
 * Needs AI_GATEWAY_API_KEY (bun loads .env.local). No dev server required —
 * it calls the analysis function directly.
 */
import { analyzeTurn } from "@/server/turn-analysis";

import type { JudgmentCase } from "./transcripts";
import { JUDGMENT_CASES } from "./transcripts";

type RunResult = {
  verdict: string;
  met: string[];
  evidence: string[];
  correctionCount: number;
};

function parseArg(name: string): string | null {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

async function runCase(testCase: JudgmentCase): Promise<RunResult> {
  const analysis = await analyzeTurn(testCase.request);
  return {
    verdict: analysis.achievement.verdict,
    met: analysis.achievement.conditions
      .filter((condition) => condition.met)
      .map((condition) => condition.id)
      .sort(),
    evidence: analysis.achievement.conditions.map(
      (condition) => `${condition.id}: ${condition.evidence}`,
    ),
    correctionCount: analysis.corrections.length,
  };
}

function agreesWithExpectation(
  testCase: JudgmentCase,
  result: RunResult,
): boolean {
  if (result.verdict !== testCase.expected.verdict) return false;
  if (testCase.expected.met === undefined) return true;
  const expected = [...testCase.expected.met].sort();
  return (
    result.met.length === expected.length &&
    result.met.every((id, i) => id === expected[i])
  );
}

const runs = Number(parseArg("runs") ?? 3);
const only = parseArg("case");
const cases = only
  ? JUDGMENT_CASES.filter((testCase) => testCase.name === only)
  : JUDGMENT_CASES;

if (cases.length === 0) {
  console.error(`알 수 없는 케이스: ${only}`);
  process.exit(1);
}

// Zero runs would make the unanimity check vacuously true — a gate that
// passes without asking the model anything.
if (!Number.isInteger(runs) || runs < 1) {
  console.error(`--runs는 1 이상의 정수여야 한다 (받은 값: ${parseArg("runs")})`);
  process.exit(1);
}

console.log(`판정 하니스 — 케이스 ${cases.length}개 × ${runs}런\n`);

let failed = 0;

for (const testCase of cases) {
  const results = await Promise.all(
    Array.from({ length: runs }, () => runCase(testCase)),
  );
  const passes = results.filter((result) =>
    agreesWithExpectation(testCase, result),
  ).length;
  const unanimous = passes === runs;
  if (!unanimous) failed += 1;

  const scope =
    testCase.expected.met === undefined ? "verdict만" : "verdict + 조건";
  console.log(
    `${unanimous ? "PASS" : "FAIL"}  ${testCase.name}  (${passes}/${runs} 일치, ${scope})`,
  );
  console.log(`      ${testCase.intent}`);
  console.log(
    `      기대: ${testCase.expected.verdict}${
      testCase.expected.met
        ? ` / met=[${[...testCase.expected.met].sort().join(", ")}]`
        : ""
    }`,
  );
  for (const [index, result] of results.entries()) {
    console.log(
      `      런 ${index + 1}: ${result.verdict} / met=[${result.met.join(", ")}] / 교정 ${result.correctionCount}건`,
    );
    for (const line of result.evidence) console.log(`         ${line}`);
  }
  console.log();
}

if (failed > 0) {
  console.error(`${failed}개 케이스가 기대 판정과 어긋남 — 판정 프롬프트 확인.`);
  process.exit(1);
}
console.log("모든 케이스가 기대 판정과 일치.");
