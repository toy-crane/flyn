import { describe, expect, test } from "bun:test";
import type { UIMessage } from "ai";

import type { EpisodeCorrection } from "./correction";
import { learningDraft, sceneUtterances } from "./saved-expression";

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

/** 판정하던 때에 이미 행으로 남은 교정 하나. 담을 때 새로 만드는 값은 없다. */
function storedCorrection(messageId: string): EpisodeCorrection {
  return {
    entries: [
      {
        fixed: "ordered",
        original: "order",
        pattern: "past-tense",
        why: "지난 일은 ordered로 써요.",
      },
    ],
    fixed: "I ordered a hot americano, but this is an iced latte.",
    messageId,
    original: "I order hot americano but this is ice latte.",
    review: {
      example: "I ordered a tea, but this is a coffee.",
      exampleMeaning: "저는 차를 시켰는데 이건 커피예요.",
      meaning: "저는 뜨거운 아메리카노를 시켰는데 이건 아이스 라테예요.",
      situation: "받은 음료가 주문과 다를 때",
    },
  };
}

function userMessage(id: string, text: string): UIMessage {
  return { id, parts: [{ text, type: "text" }], role: "user" };
}

describe("learningDraft", () => {
  test("표현 돌아보기가 이미 만든 뜻을 항목에 옮겨 담는다", () => {
    const message = userMessage(
      "msg-1",
      "I order hot americano but this is ice latte."
    );

    expect(
      learningDraft({
        corrections: [storedCorrection("msg-1")],
        episodeId: "episode-1",
        message,
      })
    ).toEqual({
      english: "I ordered a hot americano, but this is an iced latte.",
      entries: [
        {
          fixed: "ordered",
          original: "order",
          why: "지난 일은 ordered로 써요.",
        },
      ],
      episodeId: "episode-1",
      kind: "correction",
      meaning: "저는 뜨거운 아메리카노를 시켰는데 이건 아이스 라테예요.",
      messageId: "msg-1",
      original: "I order hot americano but this is ice latte.",
      speaker: null,
      utteranceAt: null,
    });
  });
});
