import { afterEach, expect, jest, test } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { UIMessage, UIMessageChunk } from "ai";
import { simulateReadableStream } from "ai";

import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import { useEpisodeRun } from "./use-episode-run";

jest.mock("@/features/episode/api/episode-transport", () => ({
  createEpisodeTransport: jest.fn(),
}));

const mockCreateEpisodeTransport = jest.mocked(createEpisodeTransport);
const EPISODE_ID = "11000000-0000-4000-8000-000000000001";

function openingStream(): ReadableStream<UIMessageChunk> {
  return simulateReadableStream({
    chunkDelayInMs: null,
    chunks: [
      { type: "start" },
      { id: "opening", type: "text-start" },
      {
        delta: "Next in line, please!",
        id: "opening",
        type: "text-delta",
      },
      { id: "opening", type: "text-end" },
      { type: "finish" },
    ],
    initialDelayInMs: null,
  });
}

function fakeTransport() {
  const transport = {
    reconnectToStream: () => Promise.resolve(null),
    sendMessages: jest.fn(() => Promise.resolve(openingStream())),
  };

  mockCreateEpisodeTransport.mockReturnValue(
    transport as unknown as ReturnType<typeof createEpisodeTransport>
  );

  return transport;
}

afterEach(() => {
  jest.clearAllMocks();
});

test("저장된 장면이 없으면 첫 장면을 한 번 요청한다", async () => {
  const transport = fakeTransport();

  const { result } = await renderHook(() =>
    useEpisodeRun("token", EPISODE_ID, [], false)
  );

  await waitFor(() => {
    expect(transport.sendMessages).toHaveBeenCalledTimes(1);
    expect(result.current.chat.messages).toEqual([
      {
        id: expect.any(String),
        parts: [{ state: "done", text: "Next in line, please!", type: "text" }],
        role: "assistant",
      },
    ]);
  });
});

test("저장된 진행 장면이 있으면 그 자리에서 시작하고 새로 열지 않는다", async () => {
  const transport = fakeTransport();
  const messages: UIMessage[] = [
    {
      id: "saved-user",
      parts: [{ text: "This is wrong.", type: "text" }],
      role: "user",
    },
  ];
  const { result } = await renderHook(() =>
    useEpisodeRun("token", EPISODE_ID, messages, false)
  );

  expect(result.current.chat.messages).toEqual(messages);
  expect(transport.sendMessages).not.toHaveBeenCalled();
});

test("끝난 대화는 직접 열기를 불러도 서버에 새 요청을 보내지 않는다", async () => {
  const transport = fakeTransport();
  const messages: UIMessage[] = [
    {
      id: "saved-user",
      parts: [{ text: "Done", type: "text" }],
      role: "user",
    },
  ];
  const { result } = await renderHook(() =>
    useEpisodeRun("token", EPISODE_ID, messages, true)
  );

  await act(() => {
    result.current.open();
  });

  expect(result.current.chat.messages).toEqual(messages);
  expect(transport.sendMessages).not.toHaveBeenCalled();
});

test("끝난 화를 다시 열면 서버가 실어 보낸 결말로 마무리를 그린다", async () => {
  fakeTransport();
  const messages: UIMessage[] = [
    {
      id: "saved-assistant",
      parts: [{ text: "Here you go.", type: "text" }],
      role: "assistant",
    },
  ];
  const { result } = await renderHook(() =>
    useEpisodeRun(
      "token",
      EPISODE_ID,
      messages,
      true,
      { kind: "성공", outcome: "새 잔을 받아냈다." },
      { copy: "다음 이야기", episodeId: "next", number: 2, title: "2화" }
    )
  );

  // 저장된 대화에는 결말 part가 없다. 결말은 서버의 플레이 기록이 소유한다.
  expect(result.current.ending).toEqual({
    kind: "성공",
    outcome: "새 잔을 받아냈다.",
  });
  expect(result.current.nextUp?.episodeId).toBe("next");
});

// 저장된 대화에 교정 part가 없으므로, 다시 연 화면의 배울 표현은 서버가 세션에
// 실어 보낸 것으로 돌아온다.
test("다시 연 화면은 서버가 실어 보낸 배울 표현으로 시작한다", async () => {
  fakeTransport();
  const messages: UIMessage[] = [
    {
      id: "m1",
      parts: [{ text: "I think this is wrong coffee.", type: "text" }],
      role: "user",
    },
  ];
  const saved = [
    {
      entries: [
        {
          fixed: "the wrong coffee",
          original: "wrong coffee",
          pattern: "article-the-specific",
          why: "그 하나를 짚을 때는 the를 붙여요.",
        },
      ],
      fixed: "I think you gave me the wrong coffee.",
      messageId: "m1",
      original: "I think this is wrong coffee.",
    },
  ];

  const { result } = await renderHook(() =>
    useEpisodeRun(
      "token",
      EPISODE_ID,
      messages,
      false,
      undefined,
      undefined,
      saved
    )
  );

  expect(result.current.corrections.byMessageId.m1).toEqual(saved[0]);
});
