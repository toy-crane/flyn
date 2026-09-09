import { describe, expect, test } from "bun:test";
import type { UIMessage } from "ai";

import { sceneUtterances } from "./saved-expression";

/**
 * 앱의 `sceneOfMessage` 테스트와 같은 조각을 쓴다. 자리 번호를 앱이 세고 서버가
 * 다시 읽으므로, 두 걸음이 갈리면 담은 대사가 옆 대사로 바뀐다.
 */
function sceneParts(parts: UIMessage["parts"]): UIMessage["parts"] {
  return parts;
}

describe("sceneUtterances", () => {
  test("지문을 세지 않고 인물 대사에만 자리를 매긴다", () => {
    expect(
      sceneUtterances(
        sceneParts([
          { data: { name: null }, id: "speaker-1", type: "data-speaker" },
          { text: "국물 김이 오른다.", type: "text" },
          { data: { name: "만복" }, id: "speaker-2", type: "data-speaker" },
          { text: "어서 와.", type: "text" },
          { data: { name: null }, id: "speaker-3", type: "data-speaker" },
          { text: "문이 닫힌다.", type: "text" },
          { data: { name: "준호" }, id: "speaker-4", type: "data-speaker" },
          { text: "안녕하세요.", type: "text" },
        ])
      )
    ).toEqual([
      { at: 0, speaker: "만복", text: "어서 와." },
      { at: 1, speaker: "준호", text: "안녕하세요." },
    ]);
  });

  test("글자가 아직 없는 조각은 자리를 차지하지 않는다", () => {
    expect(
      sceneUtterances(
        sceneParts([
          { data: { name: "만복" }, id: "speaker-1", type: "data-speaker" },
          { text: "어서 와.", type: "text" },
          { data: { name: "준호" }, id: "speaker-2", type: "data-speaker" },
        ])
      )
    ).toEqual([{ at: 0, speaker: "만복", text: "어서 와." }]);
  });

  test("한 조각에 나뉘어 온 글자를 이어 붙인다", () => {
    expect(
      sceneUtterances(
        sceneParts([
          { data: { name: "만복" }, id: "speaker-1", type: "data-speaker" },
          { text: "어서 ", type: "text" },
          { text: "와.", type: "text" },
        ])
      )
    ).toEqual([{ at: 0, speaker: "만복", text: "어서 와." }]);
  });

  test("화자 part가 없는 답변에는 담을 대사가 없다", () => {
    expect(
      sceneUtterances(sceneParts([{ text: "안녕하세요.", type: "text" }]))
    ).toEqual([]);
  });
});
