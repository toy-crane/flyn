import { expect, test } from "bun:test";
import type { EpisodeScene } from "../src/features/episode/scene";
import { scheduleWordingProblems } from "./schedule-wording";

const cast = ["Mia", "Owen"];
const scene = (text: string): EpisodeScene => ({
  dialogue: [{ speaker: "Owen", text }],
  ending: null,
});

test("실제 관찰한 Owen의 회의를 사용자에게 옮긴 답을 잡는다", () => {
  expect(
    scheduleWordingProblems(
      scene("Good. I am glad it worked. I hope you make your meeting."),
      [{ event: "meeting", person: "Owen" }],
      cast
    )
  ).toEqual(["사용자에게 없는 meeting 일정 언급"]);
});

test("같은 대사라도 사용자의 회의이면 허용한다", () => {
  expect(
    scheduleWordingProblems(
      scene("I hope you make your meeting."),
      [{ event: "meeting", person: "USER" }],
      cast
    )
  ).toEqual([]);
});

test("화자 자신의 회의는 허용하고 회의 대신 생긴 출근 오류도 잡는다", () => {
  const appointments = [{ event: "meeting" as const, person: "Owen" }];
  expect(
    scheduleWordingProblems(
      scene("I need to get to my meeting."),
      appointments,
      cast
    )
  ).toEqual([]);
  expect(
    scheduleWordingProblems(
      scene("I hope you get to work on time."),
      appointments,
      cast
    )
  ).toEqual(["사용자에게 없는 출근 일정 언급"]);
});

test("다른 인물을 이름으로 부르는 말은 단순 문구 검사로 판정하지 않는다", () => {
  expect(
    scheduleWordingProblems(
      {
        dialogue: [
          { speaker: "Mia", text: "Owen, good luck with your meeting." },
        ],
        ending: null,
      },
      [{ event: "meeting", person: "Owen" }],
      cast
    )
  ).toEqual([]);
});
