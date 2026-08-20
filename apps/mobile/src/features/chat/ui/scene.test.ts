import { describe, expect, test } from "@jest/globals";
import type { UIMessage } from "ai";

import { sceneCopyText, sceneOfMessage } from "./scene";

function assistantMessage(parts: UIMessage["parts"]): UIMessage {
  return { id: "a1", parts, role: "assistant" };
}

describe("sceneOfMessage", () => {
  test("화자 part 순서대로 장면을 자른다", () => {
    const message = assistantMessage([
      { data: { name: null }, id: "speaker-1", type: "data-speaker" },
      { text: "국물 김이 오른다.", type: "text" },
      { data: { name: "만복" }, id: "speaker-2", type: "data-speaker" },
      { text: "어서 와.", type: "text" },
    ]);

    expect(sceneOfMessage(message)).toEqual([
      { name: null, text: "국물 김이 오른다." },
      { name: "만복", text: "어서 와." },
    ]);
  });

  test("화자 part가 없는 메시지는 장면이 아니다", () => {
    const message = assistantMessage([{ text: "안녕하세요.", type: "text" }]);

    expect(sceneOfMessage(message)).toBeUndefined();
  });

  test("글자가 아직 없는 조각은 버린다", () => {
    const message = assistantMessage([
      { data: { name: "만복" }, id: "speaker-1", type: "data-speaker" },
      { text: "어서 와.", type: "text" },
      { data: { name: "준호" }, id: "speaker-2", type: "data-speaker" },
    ]);

    expect(sceneOfMessage(message)).toEqual([
      { name: "만복", text: "어서 와." },
    ]);
  });
});

describe("sceneCopyText", () => {
  test("화자를 각본의 줄 머리로 되살린다", () => {
    expect(
      sceneCopyText([
        { name: null, text: "국물 김이 오른다." },
        { name: "만복", text: "어서 와." },
      ])
    ).toBe("국물 김이 오른다.\n만복: 어서 와.");
  });
});
