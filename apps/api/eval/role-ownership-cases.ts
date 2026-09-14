import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ModelMessage } from "ai";
import type { EpisodeScene } from "../src/features/episode/scene";
import type { EpisodeScript } from "../src/features/episode/story";
import regressionData from "./fixtures/role-ownership-regressions.json";
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
const evidence = resolve(
  import.meta.dir,
  "../../../docs/specs/episode-prompt-load-evaluation"
);

export function fixedScenarios(): Scenario[] {
  const role = JSON.parse(
    readFileSync(resolve(evidence, "role-check/data/manifest.json"), "utf8")
  ) as {
    cases: (Omit<Scenario, "appointments" | "before"> & {
      baseSystem: string;
      expectedAppointments: Appointment[];
    })[];
  };
  const primary = JSON.parse(
    readFileSync(resolve(evidence, "evidence/primary/manifest.json"), "utf8")
  ) as {
    cases: {
      conditions: { arm: string; system: string }[];
      expectedEnding: EndingKind | null;
      id: string;
      messages: ModelMessage[];
      script: EpisodeScript;
      title: string;
    }[];
  };
  const scenarios: Scenario[] = role.cases.map((f) => ({
    appointments: f.expectedAppointments,
    before: f.baseSystem,
    expectedEnding: f.expectedEnding,
    id: f.id,
    messages: f.messages,
    requiredMention: f.requiredMention,
    script: f.script,
    title: f.title,
  }));
  for (const f of primary.cases.filter((item) => item.id !== "s1-owner")) {
    const before = f.conditions.find((c) => c.arm === "A")?.system;
    if (!before) {
      throw new Error(`Missing fixed baseline for ${f.id}`);
    }
    scenarios.push({
      appointments: [{ event: "meeting", person: "Owen" }],
      before,
      expectedEnding: f.expectedEnding,
      id: f.id,
      messages: f.messages,
      requiredMention: [],
      script: f.script,
      title: f.title,
    });
  }
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
