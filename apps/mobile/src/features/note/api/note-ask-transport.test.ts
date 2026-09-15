import { expect, jest, test } from "@jest/globals";
import type { UIMessage } from "ai";

import type { SavedExpression } from "./expression-note";
import { createNoteAskTransport } from "./note-ask-transport";

jest.mock("@/shared/ai/request-options", () => ({
  aiRequestOptions: (path: string) => ({
    api: `http://127.0.0.1:3900${path}`,
  }),
}));

const UTTERANCE: SavedExpression = {
  conversation: {
    dialogueIndex: 0,
    episodeId: "11000000-0000-4000-8000-000000000001",
    messageId: "message-1",
    storyPlayId: "1a000000-0000-4000-8000-000000000001",
  },
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

const CORRECTION: SavedExpression = {
  conversation: null,
  english: "I ordered a hot americano.",
  entries: [
    { fixed: "ordered", original: "order", why: "지난 일은 ordered로 말해요." },
  ],
  episodeNumber: 1,
  id: "5a4ed000-0000-4000-8000-000000000002",
  kind: "correction",
  meaning: "저는 뜨거운 아메리카노를 시켰어요.",
  original: "I order a hot americano.",
  speaker: null,
  storyTitle: "Mia의 카페",
};

const CONTEXT: UIMessage[] = [
  {
    id: "message-1",
    parts: [{ text: "Next in line, please!", type: "text" }],
    role: "assistant",
  },
];

function question(text: string, id = "question-1"): UIMessage {
  return { id, parts: [{ text, type: "text" }], role: "user" };
}

type Prepare = (options: {
  id: string;
  messageId: string | undefined;
  messages: UIMessage[];
  trigger: string;
}) => Promise<{ body: Record<string, unknown> }>;

function prepareOf(
  expression: SavedExpression,
  readContext: () => Promise<UIMessage[]>
): Prepare {
  const transport = createNoteAskTransport(
    () => "token",
    expression,
    readContext
  );

  return (transport as unknown as { prepareSendMessagesRequest: Prepare })
    .prepareSendMessagesRequest;
}

test("인물 대사는 화자, 영어 원문과 뜻을 출처로 싣고 원래 대화를 질문 앞에 붙인다", async () => {
  const prepare = prepareOf(UTTERANCE, () => Promise.resolve(CONTEXT));

  const { body } = await prepare({
    id: "note-ask",
    messageId: undefined,
    messages: [question("여기서 next는 무슨 뜻이에요?")],
    trigger: "submit-message",
  });

  expect(body.utterance).toEqual({
    meaning: "다음 분이요!",
    speaker: "Mia",
    text: "Next in line, please!",
  });
  expect(body.correction).toBeUndefined();
  expect(body.messages).toEqual([
    ...CONTEXT,
    question("여기서 next는 무슨 뜻이에요?"),
  ]);
});

test("원래 대화가 없는 교정은 저장한 표현만 출처로 싣고 질문만 보낸다", async () => {
  const prepare = prepareOf(CORRECTION, () => Promise.resolve([]));

  const { body } = await prepare({
    id: "note-ask",
    messageId: undefined,
    messages: [question("왜 ordered예요?")],
    trigger: "submit-message",
  });

  expect(body.correction).toEqual({
    entries: CORRECTION.entries,
    fixed: "I ordered a hot americano.",
    original: "I order a hot americano.",
  });
  expect(body.utterance).toBeUndefined();
  expect(body.messages).toEqual([question("왜 ordered예요?")]);
});

test("원래 대화는 한 번 읽으면 같은 질문창의 다음 질문에도 그대로 쓴다", async () => {
  const readContext = jest.fn(() => Promise.resolve(CONTEXT));
  const prepare = prepareOf(UTTERANCE, readContext);

  await prepare({
    id: "note-ask",
    messageId: undefined,
    messages: [question("첫 질문")],
    trigger: "submit-message",
  });
  await prepare({
    id: "note-ask",
    messageId: undefined,
    messages: [question("첫 질문"), question("다음 질문", "question-2")],
    trigger: "submit-message",
  });

  expect(readContext).toHaveBeenCalledTimes(1);
});

test("원래 대화를 읽지 못한 질문은 실패하고 다시 보내면 다시 읽는다", async () => {
  const readContext = jest
    .fn<() => Promise<UIMessage[]>>()
    .mockRejectedValueOnce(new Error("network"))
    .mockResolvedValueOnce(CONTEXT);
  const prepare = prepareOf(UTTERANCE, readContext);
  const options = {
    id: "note-ask",
    messageId: undefined,
    messages: [question("첫 질문")],
    trigger: "submit-message",
  };

  await expect(prepare(options)).rejects.toThrow("network");
  await expect(prepare(options)).resolves.toMatchObject({
    body: { messages: [...CONTEXT, question("첫 질문")] },
  });
  expect(readContext).toHaveBeenCalledTimes(2);
});
