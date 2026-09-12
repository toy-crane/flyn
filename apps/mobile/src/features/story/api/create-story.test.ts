import { expect, jest, test } from "@jest/globals";
import type { UIMessage } from "ai";

jest.mock("expo/fetch", () => ({
  fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
}));

import {
  latestOutline,
  OUTLINE_PART_TYPE,
  outlineOfMessage,
  saveStory,
} from "./create-story";

function outline(title: string) {
  return {
    characters: [{ name: "Lena", position: 1, role: "호텔 프런트 직원." }],
    cover:
      "A woman in her thirties, dark bob, navy uniform, attentive, close-up, head tilted, teal background",
    episodes: [
      {
        cast: ["Lena"],
        details: "예약 확인 메일을 갖고 있고 직원에게 방을 요청한다.",
        number: 1,
        preview: "밤늦게 도착했는데 제 예약이 없대요.",
        title: "예약이 없는 호텔",
      },
    ],
    hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
    title,
  };
}

function card(id: string, title: string, state = "output-available") {
  return {
    id,
    parts: [
      { input: outline(title), state, type: OUTLINE_PART_TYPE },
      { text: "고칠 게 있으면 말해 주세요", type: "text" },
    ],
    role: "assistant",
  } as unknown as UIMessage;
}

function said(id: string, text: string) {
  return {
    id,
    parts: [{ text, type: "text" }],
    role: "user",
  } as unknown as UIMessage;
}

test("메시지에 실린 카드를 읽는다", () => {
  expect(outlineOfMessage(card("a1", "베를린 출장 일주일"))?.title).toBe(
    "베를린 출장 일주일"
  );
});

test("화면에 줄여 보여도 표지와 상세 상황은 저장 요청까지 보존한다", () => {
  expect(outlineOfMessage(card("a1", "베를린 출장"))).toEqual(
    outline("베를린 출장")
  );
});

/*
  조각이 오는 중에는 개요가 반쪽이다. 그대로 그리면 인물이 하나씩 나타나 다
  만들어진 카드와 구별되지 않는다.
*/
test("아직 오는 중인 카드는 그리지 않는다", () => {
  expect(
    outlineOfMessage(card("a1", "베를린 출장", "input-streaming"))
  ).toBeUndefined();
});

test("카드가 없는 메시지는 빈손이다", () => {
  expect(
    outlineOfMessage(said("u1", "다음 달에 출장을 가요."))
  ).toBeUndefined();
});

/*
  지난 카드는 대화에 남되 `대화 시작하기`는 붙지 않는다. 버튼이 카드마다 있으면
  어느 카드로 만드는지가 흐려진다.
*/
test("가장 최근 카드를 든 메시지를 가리킨다", () => {
  const found = latestOutline([
    said("u1", "다음 달에 출장을 가요."),
    card("a1", "첫 카드"),
    said("u2", "2화는 빼 줘."),
    card("a2", "고친 카드"),
  ]);

  expect(found).toEqual({
    messageId: "a2",
    outline: expect.objectContaining({ title: "고친 카드" }),
  });
});

test("카드가 하나도 없으면 빈손이다", () => {
  expect(latestOutline([said("u1", "안녕하세요.")])).toBeUndefined();
});

test("서버 진행 단계를 읽고 완료 조각에서만 만든 스토리를 반환한다", async () => {
  const chunks = [
    { data: { stage: "script" }, type: "data-story-progress" },
    { data: { stage: "cover" }, type: "data-story-progress" },
    { data: { stage: "saving" }, type: "data-story-progress" },
    {
      data: { episodeId: "episode-1", storyId: "story-1" },
      type: "data-story-created",
    },
  ];
  const response = new Response(null);
  Object.defineProperty(response, "body", {
    value: new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `${chunks
              .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
              .join("")}data: [DONE]\n\n`
          )
        );
        controller.close();
      },
    }),
  });
  const fetch = jest.spyOn(globalThis, "fetch").mockResolvedValue(response);
  const progress = jest.fn();
  try {
    await expect(
      saveStory("token", outline("스토리"), progress)
    ).resolves.toEqual({ episodeId: "episode-1", storyId: "story-1" });
    expect(progress.mock.calls).toEqual([["script"], ["cover"], ["saving"]]);
  } finally {
    fetch.mockRestore();
  }
});
