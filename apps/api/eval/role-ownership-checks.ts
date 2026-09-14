import type { EpisodeScene } from "../src/features/episode/scene";
import type { Scenario } from "./role-ownership-cases";
import { sceneProblems } from "./scene-checks";
import { scheduleWordingProblems } from "./schedule-wording";

const UNKNOWN_NEXT =
  /\b(?:I|we) (?:do not|don['’]t) know what (?:you|we) (?:need to|should) do next\b/iu;
const REPEATED_YOU =
  /\b([a-z]+),\s+you\b[^.!?]*?\byour (meeting|train)\b,\s+and you (?:need to|should|must) [^,.!?]*\byour (meeting|train)\b/giu;

/** 관찰한 이름 호칭 뒤의 두 일정 연결만 검사한다. 일반적인 대명사 해석은 아니다. */
function hasAmbiguousRecipient(scene: EpisodeScene, scenario: Scenario) {
  return scene.dialogue.some((line) =>
    [...line.text.matchAll(REPEATED_YOU)].some(
      ([, name, first, second]) =>
        first !== second &&
        scenario.appointments.some(
          (appointment) =>
            appointment.person.toLowerCase() === name?.toLowerCase() &&
            appointment.event === first?.toLowerCase()
        ) &&
        scenario.appointments.some(
          (appointment) =>
            appointment.person === "USER" &&
            appointment.event === second?.toLowerCase()
        )
    )
  );
}

export function roleOwnershipProblems(
  scene: EpisodeScene,
  f: Scenario
): string[] {
  const problems = sceneProblems(
    scene,
    f.script.cast.map((c) => c.name),
    f.expectedEnding !== null
  );
  if (scene.dialogue.length > 2) {
    problems.push("발화가 두 개를 넘음");
  }
  if (scene.ending && scene.ending.kind !== f.expectedEnding) {
    problems.push("결말 종류 불일치");
  }
  problems.push(
    ...scheduleWordingProblems(
      scene,
      f.appointments,
      f.script.cast.map((c) => c.name)
    )
  );
  if (
    f.requiredMention.length > 0 &&
    scene.dialogue.some((line) => UNKNOWN_NEXT.test(line.text))
  ) {
    problems.push("알고 있는 다음 일정을 모른다고 답함");
  }
  if (hasAmbiguousRecipient(scene, f)) {
    problems.push("말을 듣는 사람 전환이 모호함");
  }
  return problems;
}
