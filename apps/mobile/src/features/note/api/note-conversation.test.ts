import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import type { UIMessage } from "ai";

import type { SavedExpressionConversation } from "./expression-note";
import { readNoteConversation } from "./note-conversation";

const CONVERSATION: SavedExpressionConversation = {
  dialogueIndex: null,
  episodeId: "11000000-0000-4000-8000-000000000001",
  messageId: "message-2",
  storyPlayId: "1a000000-0000-4000-8000-000000000001",
};

const MESSAGES: UIMessage[] = [
  {
    id: "message-1",
    parts: [{ text: "Next in line, please!", type: "text" }],
    role: "assistant",
  },
  {
    id: "message-2",
    parts: [{ text: "I order a hot americano.", type: "text" }],
    role: "user",
  },
  {
    id: "message-3",
    parts: [{ text: "Coming right up.", type: "text" }],
    role: "assistant",
  },
];

const fetchMock = jest.fn<typeof fetch>();

function answer(status: number, body?: unknown) {
  fetchMock.mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status })
  );
}

beforeEach(() => {
  jest.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  jest.restoreAllMocks();
});

test("그 표현이 나온 회차의 화를 읽어 표현이 나온 메시지까지만 돌려준다", async () => {
  answer(200, { messages: MESSAGES });

  await expect(readNoteConversation("token", CONVERSATION)).resolves.toEqual(
    MESSAGES.slice(0, 2)
  );
  expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
    `http://127.0.0.1:3900/ai/episode/${CONVERSATION.episodeId}?storyPlayId=${CONVERSATION.storyPlayId}`
  );
  expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
    Authorization: "Bearer token",
  });
});

test("대화가 지워져 서버가 찾지 못하면 없는 대화로 답한다", async () => {
  answer(404, { error: "Episode conversation is unavailable." });

  await expect(readNoteConversation("token", CONVERSATION)).resolves.toBeNull();
});

test("대화는 남았지만 그 메시지가 지워졌으면 없는 대화로 답한다", async () => {
  answer(200, { messages: [MESSAGES[0]] });

  await expect(readNoteConversation("token", CONVERSATION)).resolves.toBeNull();
});

test("그 밖의 실패는 없는 대화로 바꾸지 않고 실패로 알린다", async () => {
  answer(500);

  await expect(readNoteConversation("token", CONVERSATION)).rejects.toThrow(
    "500"
  );
});
