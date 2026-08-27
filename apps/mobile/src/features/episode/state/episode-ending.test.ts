import { describe, expect, test } from "@jest/globals";
import type { UIMessage } from "ai";

import { endingOfEpisode } from "./episode-ending";

function scene(id: string, parts: UIMessage["parts"]): UIMessage {
  return { id, parts, role: "assistant" };
}

const OPENING = scene("m1", [
  { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
  { text: "Next in line, please!", type: "text" },
]);

const CLOSING = scene("m2", [
  { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
  { text: "Here is your iced americano.", type: "text" },
  {
    data: { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." },
    id: "ending",
    type: "data-ending",
  },
]);

describe("endingOfEpisode", () => {
  test("사건이 진행 중이면 결말이 없다", () => {
    expect(endingOfEpisode([OPENING])).toBeUndefined();
  });

  test("사건이 끝나면 결말 종류와 결과 한 줄을 읽는다", () => {
    expect(endingOfEpisode([OPENING, CLOSING])).toEqual({
      kind: "성공",
      outcome: "원하던 커피를 새로 받아냈다.",
    });
  });

  // 형식이 어긋난 part로 마무리 화면을 열면 결말 없는 결말이 보인다. 그러느니
  // 에피소드를 계속 진행하는 편이 낫다.
  test("결말의 모양이 아니면 에피소드를 닫지 않는다", () => {
    const broken = scene("m3", [
      { data: { kind: "성공" }, id: "ending", type: "data-ending" },
    ]);

    expect(endingOfEpisode([broken])).toBeUndefined();
  });

  test("메시지가 없으면 결말도 없다", () => {
    expect(endingOfEpisode([])).toBeUndefined();
  });
});
