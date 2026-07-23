/**
 * Reconciles the judge's achievement output against the scenario it was asked
 * about. The model is free to rename, drop, or invent condition ids — the
 * contract's schema accepts any string — so the server pins the judgment back
 * to the scenario's own conditions before anything downstream reads it.
 *
 * The verdict is derived here rather than trusted: an achievement condition is
 * "one machine-checkable clause of the goal", so the goal is achieved exactly
 * when every clause is met. `failure` is the one verdict the model owns, since
 * "the goal became impossible in-fiction" is not derivable from the met flags.
 */
import type { z } from "zod";

import type { achievementJudgmentSchema } from "@/lib/ai-contract";
import type { AchievementCondition } from "@/types/story";

type AchievementJudgment = z.infer<typeof achievementJudgmentSchema>;

const UNJUDGED = "판정이 이 조건을 다루지 않았다.";

export function reconcileJudgment(
  conditions: AchievementCondition[],
  judgment: AchievementJudgment,
): AchievementJudgment {
  const judged = new Map(
    judgment.conditions.map((condition) => [condition.id, condition]),
  );

  const reconciled = conditions.map((condition) => {
    const match = judged.get(condition.id);
    return match
      ? { id: condition.id, met: match.met, evidence: match.evidence }
      : { id: condition.id, met: false, evidence: UNJUDGED };
  });

  const allMet =
    reconciled.length > 0 && reconciled.every((condition) => condition.met);
  const verdict =
    judgment.verdict === "failure" ? "failure" : allMet ? "success" : "in-progress";

  return { conditions: reconciled, verdict };
}
