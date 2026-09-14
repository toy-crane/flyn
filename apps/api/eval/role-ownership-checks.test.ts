import { expect, test } from "bun:test";
import type { EpisodeScene } from "../src/features/episode/scene";
import regressionData from "./fixtures/role-ownership-regressions.json";
import { fixedScenarios } from "./role-ownership-cases";
import { roleOwnershipProblems } from "./role-ownership-checks";

const scenarios = fixedScenarios();
const regressions = regressionData.cases as {
  acceptedScene: EpisodeScene;
  expectedProblem: string;
  rejectedScene: EpisodeScene;
  scenarioId: string;
  sourceTrialId: string;
  title: string;
}[];

test.each(regressions)(
  "실제 오답을 잡고 수정 예시를 허용한다: $title",
  (example) => {
    const scenario = scenarios.find((item) => item.id === example.scenarioId);
    if (!scenario) {
      throw new Error(`평가 입력이 없다: ${example.scenarioId}`);
    }
    expect(roleOwnershipProblems(example.rejectedScene, scenario)).toContain(
      example.expectedProblem
    );
    expect(roleOwnershipProblems(example.acceptedScene, scenario)).toEqual([]);
  }
);

test("문제 없던 표현을 잘못 걸러내지 않는다", () => {
  const scenario = scenarios.find((item) => item.id === "o8-two-schedules");
  const example = regressions.find(
    (item) => item.sourceTrialId === "o8-two-schedules-after-1"
  );
  if (!(scenario && example)) {
    throw new Error("두 사람의 일정 평가 입력이 없다.");
  }
  for (const [speaker, text] of [
    [
      "Owen",
      "You need to catch your train, and I need to get to my meeting. We do not know the exact places from here.",
    ],
    [
      "Mia",
      "Owen, you need to go to your meeting. As for you, please catch your train.",
    ],
    [
      "Mia",
      "You need to catch your train. Owen, you need to go to your meeting, and you should enjoy your day.",
    ],
  ] as const) {
    expect(
      roleOwnershipProblems(
        { ...example.acceptedScene, dialogue: [{ speaker, text }] },
        scenario
      )
    ).toEqual([]);
  }
});
