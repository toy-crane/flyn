import { expect, jest, test } from "@jest/globals";
import type { UIMessage } from "ai";

import { createEpisodeTransport } from "./episode-transport";

jest.mock("@/shared/ai/request-options", () => ({
  aiRequestOptions: (path: string) => ({
    api: `http://127.0.0.1:3900${path}`,
  }),
}));

const EPISODE_ID = "11000000-0000-4000-8000-000000000001";

function conversation(): UIMessage[] {
  return [
    {
      id: "message-1",
      parts: [{ text: "Next in line, please!", type: "text" }],
      role: "assistant",
    },
    {
      id: "message-2",
      parts: [{ text: "I ordered a latte.", type: "text" }],
      role: "user",
    },
  ];
}

/** 전송이 실제로 실어 보내는 몸통. */
function bodyOf(
  messages: UIMessage[],
  trigger: "regenerate-message" | "submit-message"
): Record<string, unknown> {
  const transport = createEpisodeTransport(
    () => "token",
    () => EPISODE_ID
  );
  const prepare = (
    transport as unknown as {
      prepareSendMessagesRequest: (options: {
        messages: UIMessage[];
        trigger: string;
      }) => { body: Record<string, unknown> };
    }
  ).prepareSendMessagesRequest;

  return prepare({ messages, trigger }).body;
}

test("새로 쓴 말 하나만 보내고 지난 장면은 싣지 않는다", () => {
  const body = bodyOf(conversation(), "submit-message");

  expect(body.message).toEqual({
    id: "message-2",
    parts: [{ text: "I ordered a latte.", type: "text" }],
    role: "user",
  });
  expect(body.keepThrough).toBe("message-1");
  expect(body.episodeId).toBe(EPISODE_ID);
});

// 교정이 행으로 남으므로 서버가 자기 기록에서 읽는다. 앱이 나를 것이 없다.
test("이미 받은 배울 표현의 패턴을 싣지 않는다", () => {
  expect(bodyOf(conversation(), "submit-message").seenPatterns).toBeUndefined();
  expect(
    bodyOf([conversation()[0] as UIMessage], "regenerate-message").seenPatterns
  ).toBeUndefined();
});

test("대화가 길어져도 요청은 같은 크기다", () => {
  const long = conversation();

  for (let index = 0; index < 50; index += 1) {
    long.push({
      id: `filler-${index}`,
      parts: [{ text: "Mia nods.", type: "text" }],
      role: "assistant",
    });
  }

  long.push({
    id: "latest",
    parts: [{ text: "Could I change it?", type: "text" }],
    role: "user",
  });

  const body = bodyOf(long, "submit-message");

  expect(body.message).toEqual({
    id: "latest",
    parts: [{ text: "Could I change it?", type: "text" }],
    role: "user",
  });
  expect(body.keepThrough).toBe("filler-49");
});

test("첫 장면 요청에는 보낼 말이 없다", () => {
  const body = bodyOf([], "submit-message");

  expect(body.message).toBeUndefined();
  expect(body.keepThrough).toBeNull();
});

// SDK가 다시 만들 답변을 목록에서 먼저 잘라 내므로, 남은 마지막 메시지가 곧
// 서버가 지키고 있어야 할 자리다.
test("다시 받기는 남길 자리만 말하고 새 말은 싣지 않는다", () => {
  const body = bodyOf([conversation()[0] as UIMessage], "regenerate-message");

  expect(body.message).toBeUndefined();
  expect(body.keepThrough).toBe("message-1");
});
