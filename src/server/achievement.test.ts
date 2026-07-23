import { describe, expect, test } from "bun:test";

import { SCENARIO_SUGGESTIONS } from "@/lib/fixtures";

import { reconcileJudgment } from "./achievement";

const CONDITIONS = SCENARIO_SUGGESTIONS[0]!.achievementConditions;
const [FIRST, SECOND] = CONDITIONS as [
  (typeof CONDITIONS)[number],
  (typeof CONDITIONS)[number],
];

describe("reconcileJudgment", () => {
  test("keeps the scenario's conditions, in the scenario's order", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: [
        { id: SECOND.id, met: false, evidence: "b" },
        { id: FIRST.id, met: true, evidence: "a" },
      ],
      verdict: "in-progress",
    });
    expect(result.conditions.map((c) => c.id)).toEqual([FIRST.id, SECOND.id]);
    expect(result.conditions[0]!.evidence).toBe("a");
  });

  test("a renamed id reads as unjudged rather than silently missing", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: [{ id: FIRST.id.replace("-", "_"), met: true, evidence: "a" }],
      verdict: "in-progress",
    });
    expect(result.conditions).toHaveLength(CONDITIONS.length);
    expect(result.conditions.every((c) => !c.met)).toBe(true);
  });

  test("conditions the scenario never declared are dropped", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: [
        ...CONDITIONS.map((c) => ({ id: c.id, met: true, evidence: "y" })),
        { id: "invented", met: true, evidence: "z" },
      ],
      verdict: "success",
    });
    expect(result.conditions.map((c) => c.id)).toEqual(
      CONDITIONS.map((c) => c.id),
    );
  });

  test("a success claimed with an unmet condition is downgraded", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: [
        { id: FIRST.id, met: true, evidence: "a" },
        { id: SECOND.id, met: false, evidence: "b" },
      ],
      verdict: "success",
    });
    expect(result.verdict).toBe("in-progress");
  });

  test("every condition met is a success even if the model hedged", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: CONDITIONS.map((c) => ({ id: c.id, met: true, evidence: "y" })),
      verdict: "in-progress",
    });
    expect(result.verdict).toBe("success");
  });

  test("failure is the model's to call and passes through", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: CONDITIONS.map((c) => ({ id: c.id, met: true, evidence: "y" })),
      verdict: "failure",
    });
    expect(result.verdict).toBe("failure");
  });

  test("an empty judgment leaves every condition unmet and in-progress", () => {
    const result = reconcileJudgment(CONDITIONS, {
      conditions: [],
      verdict: "success",
    });
    expect(result.conditions).toHaveLength(CONDITIONS.length);
    expect(result.verdict).toBe("in-progress");
  });

  test("a scenario with no conditions never reads as success", () => {
    expect(reconcileJudgment([], { conditions: [], verdict: "success" })).toEqual(
      { conditions: [], verdict: "in-progress" },
    );
  });
});
