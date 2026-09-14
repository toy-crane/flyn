import type { EpisodeScene } from "../src/features/episode/scene";

export interface Appointment {
  event: "meeting" | "train";
  person: string;
}

const YOUR_MEETING = /\byour meeting\b|\bhave a good meeting\b/iu;
const YOUR_TRAIN = /\byour train\b/iu;
const WORK_ON_TIME = /\b(?:get|make it) to work on time\b/iu;

/** 이 평가의 고정 장면에 한정한 문구 검사다. 전체 대사의 뜻은 별도로 읽는다. */
export function scheduleWordingProblems(
  scene: EpisodeScene,
  appointments: readonly Appointment[],
  cast: readonly string[]
): string[] {
  const problems: string[] = [];
  for (const line of scene.dialogue) {
    // 다른 인물을 이름으로 부르는 대사는 you의 대상이 달라질 수 있어 따로 읽는다.
    if (cast.some((name) => line.text.includes(name))) {
      continue;
    }
    for (const [event, pattern] of [
      ["meeting", YOUR_MEETING],
      ["train", YOUR_TRAIN],
    ] as const) {
      if (
        pattern.test(line.text) &&
        !appointments.some(
          (appointment) =>
            appointment.person === "USER" && appointment.event === event
        )
      ) {
        problems.push(`사용자에게 없는 ${event} 일정 언급`);
      }
    }
    if (WORK_ON_TIME.test(line.text)) {
      problems.push("사용자에게 없는 출근 일정 언급");
    }
  }
  return problems;
}
