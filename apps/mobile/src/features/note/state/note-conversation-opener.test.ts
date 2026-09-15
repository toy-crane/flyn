import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import type {
  SavedExpression,
  SavedExpressionConversation,
} from "@/features/note/api/expression-note";
import { useNoteConversationOpener } from "./note-conversation-opener";

const CONVERSATION: SavedExpressionConversation = {
  dialogueIndex: 0,
  episodeId: "11000000-0000-4000-8000-000000000001",
  messageId: "message-1",
  storyPlayId: "1a000000-0000-4000-8000-000000000001",
};

const SAVED: SavedExpression = {
  conversation: CONVERSATION,
  english: "Next in line, please!",
  entries: null,
  episodeNumber: 1,
  id: "5a4ed000-0000-4000-8000-000000000001",
  kind: "dialogue",
  meaning: "다음 분이요!",
  original: null,
  speaker: "Mia",
  storyTitle: "Mia의 카페",
};

const fetchMock = jest.fn<typeof fetch>();

function conversationAnswer(status: number, messageIds: string[] = []) {
  return new Response(
    JSON.stringify({
      messages: messageIds.map((id) => ({ id, parts: [], role: "assistant" })),
    }),
    { status }
  );
}

async function renderOpener() {
  const onFound = jest.fn<(value: SavedExpressionConversation) => void>();
  const onMissing = jest.fn<() => void>();
  const rendered = await renderHook(() =>
    useNoteConversationOpener({ accessToken: "token", onFound, onMissing })
  );

  return { onFound, onMissing, ...rendered };
}

beforeEach(() => {
  jest.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  jest.restoreAllMocks();
});

test("대화가 남아 있으면 그 대화의 자리를 넘긴다", async () => {
  fetchMock.mockResolvedValue(conversationAnswer(200, ["message-1"]));
  const { onFound, onMissing, result } = await renderOpener();

  await act(() => result.current.open(SAVED));

  expect(onFound).toHaveBeenCalledWith(CONVERSATION);
  expect(onMissing).not.toHaveBeenCalled();
  expect(result.current.missingIds.has(SAVED.id)).toBe(false);
  expect(result.current.openingId).toBeUndefined();
});

test("다른 기기에서 대화를 지웠으면 이동하지 않고 알린 뒤 그 표현을 없는 대화로 둔다", async () => {
  fetchMock.mockResolvedValue(conversationAnswer(404));
  const { onFound, onMissing, result } = await renderOpener();

  await act(() => result.current.open(SAVED));

  expect(onFound).not.toHaveBeenCalled();
  expect(onMissing).toHaveBeenCalledTimes(1);
  expect(result.current.missingIds.has(SAVED.id)).toBe(true);
});

test("원본 메시지만 지워져도 이동하지 않고 알린다", async () => {
  fetchMock.mockResolvedValue(conversationAnswer(200, ["message-9"]));
  const { onFound, onMissing, result } = await renderOpener();

  await act(() => result.current.open(SAVED));

  expect(onFound).not.toHaveBeenCalled();
  expect(onMissing).toHaveBeenCalledTimes(1);
});

test("확인하는 동안 그 표현을 확인 중으로 두고 다시 눌러도 한 번만 확인한다", async () => {
  let respond: (response: Response) => void = () => undefined;
  fetchMock.mockReturnValue(
    new Promise<Response>((resolve) => {
      respond = resolve;
    })
  );
  const { onFound, result } = await renderOpener();
  let first: Promise<void> = Promise.resolve();

  await act(() => {
    first = result.current.open(SAVED);
  });

  expect(result.current.openingId).toBe(SAVED.id);

  await act(() => result.current.open(SAVED));
  await act(async () => {
    respond(conversationAnswer(200, ["message-1"]));
    await first;
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(onFound).toHaveBeenCalledTimes(1);
  expect(result.current.openingId).toBeUndefined();
});

test("연결이 끊겨 확인하지 못하면 없는 대화로 숨기지 않고 대화 화면에 맡긴다", async () => {
  fetchMock.mockRejectedValue(new TypeError("Network request failed"));
  const { onFound, onMissing, result } = await renderOpener();

  await act(() => result.current.open(SAVED));

  expect(onFound).toHaveBeenCalledWith(CONVERSATION);
  expect(onMissing).not.toHaveBeenCalled();
  expect(result.current.missingIds.has(SAVED.id)).toBe(false);
});
