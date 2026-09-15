import type { ModelMessage } from "ai";
import type { EpisodeScene } from "../src/features/episode/scene";
import type { EpisodeScript } from "../src/features/episode/story";
import regressionData from "./fixtures/role-ownership-regressions.json";
import scenarioData from "./fixtures/role-ownership-scenarios.json";
import type { Appointment } from "./schedule-wording";

type EndingKind = NonNullable<EpisodeScene["ending"]>["kind"];
export interface Scenario {
  appointments: Appointment[];
  before: string;
  expectedEnding: EndingKind | null;
  id: string;
  messages: ModelMessage[];
  regressionCases?: {
    expectedProblem: string;
    sourceTrialId: string;
    title: string;
  }[];
  requiredMention: Appointment[];
  script: EpisodeScript;
  title: string;
}
export function fixedScenarios(): Scenario[] {
  const scenarios = structuredClone(scenarioData) as Scenario[];
  for (const example of regressionData.cases) {
    if (!scenarios.some((scenario) => scenario.id === example.scenarioId)) {
      throw new Error(`Regression input missing: ${example.scenarioId}`);
    }
  }
  return scenarios.map((scenario) => ({
    ...scenario,
    regressionCases: regressionData.cases
      .filter((example) => example.scenarioId === scenario.id)
      .map(({ expectedProblem, sourceTrialId, title }) => ({
        expectedProblem,
        sourceTrialId,
        title,
      })),
  }));
}
