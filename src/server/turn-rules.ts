/**
 * Server-enforced turn rules for a Story Session — this function IS the
 * "턴 상한 30 서버 강제". The judge's verdict decides success/failure; the
 * ceiling forces a `forced` ending; the verdict always wins over the ceiling
 * so a success on the final turn still ends as a success.
 */
import type { EndingKind } from "@/types/story";
import { MAX_TURNS } from "@/types/story";

export type TurnVerdict = "in-progress" | "success" | "failure";

export type TurnPlan =
  | { shouldEnd: false; endingKind: null }
  | { shouldEnd: true; endingKind: EndingKind };

/**
 * `turnCount` is the number of turns already taken, so the incoming learner
 * input is turn `turnCount + 1`. A request at or past the ceiling is closed
 * defensively rather than rejected.
 */
export function resolveTurnPlan(args: {
  verdict: TurnVerdict;
  turnCount: number;
}): TurnPlan {
  if (args.verdict === "success") {
    return { shouldEnd: true, endingKind: "success" };
  }
  if (args.verdict === "failure") {
    return { shouldEnd: true, endingKind: "failure" };
  }
  if (args.turnCount + 1 >= MAX_TURNS) {
    return { shouldEnd: true, endingKind: "forced" };
  }
  return { shouldEnd: false, endingKind: null };
}
