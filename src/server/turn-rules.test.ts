import { describe, expect, test } from "bun:test";

import { MAX_TURNS } from "@/types/story";

import { resolveTurnPlan } from "./turn-rules";

describe("resolveTurnPlan", () => {
  test("continues mid-story while the verdict is in-progress", () => {
    expect(resolveTurnPlan({ verdict: "in-progress", turnCount: 12 })).toEqual({
      shouldEnd: false,
      endingKind: null,
    });
  });

  test("success verdict closes the session", () => {
    expect(resolveTurnPlan({ verdict: "success", turnCount: 12 })).toEqual({
      shouldEnd: true,
      endingKind: "success",
    });
  });

  test("failure verdict closes the session", () => {
    expect(resolveTurnPlan({ verdict: "failure", turnCount: 3 })).toEqual({
      shouldEnd: true,
      endingKind: "failure",
    });
  });

  test("the final allowed turn forces an ending", () => {
    expect(
      resolveTurnPlan({ verdict: "in-progress", turnCount: MAX_TURNS - 1 }),
    ).toEqual({ shouldEnd: true, endingKind: "forced" });
  });

  test("the turn before the ceiling still continues", () => {
    expect(
      resolveTurnPlan({ verdict: "in-progress", turnCount: MAX_TURNS - 2 }),
    ).toEqual({ shouldEnd: false, endingKind: null });
  });

  test("verdict wins over the ceiling on the final turn", () => {
    expect(
      resolveTurnPlan({ verdict: "success", turnCount: MAX_TURNS - 1 }),
    ).toEqual({ shouldEnd: true, endingKind: "success" });
    expect(
      resolveTurnPlan({ verdict: "failure", turnCount: MAX_TURNS - 1 }),
    ).toEqual({ shouldEnd: true, endingKind: "failure" });
  });

  test("a request already at or past the ceiling closes defensively", () => {
    expect(
      resolveTurnPlan({ verdict: "in-progress", turnCount: MAX_TURNS }),
    ).toEqual({ shouldEnd: true, endingKind: "forced" });
    expect(
      resolveTurnPlan({ verdict: "in-progress", turnCount: MAX_TURNS + 5 }),
    ).toEqual({ shouldEnd: true, endingKind: "forced" });
  });
});
