import { afterEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { useCallback } from "react";
import { Pressable, Text } from "react-native";

import { EpisodeCorrectionsProvider } from "@/features/episode/state/episode-corrections";
import { useEpisodeRun } from "@/features/episode/state/use-episode-run";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeCorrectionNote } from "./correction-note";

jest.mock("@/shared/ai/request-options", () => ({
  aiRequestOptions: (path: string) => ({ api: `https://example.test${path}` }),
  aiUrl: (path: string) => `https://example.test${path}`,
}));

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

test("응답이 멈추면 확인 실패로 바꾸고 시간 초과 뒤의 늦은 결과를 버린다", async () => {
  jest.useFakeTimers();
  let complete: (response: Response) => void = () => undefined;
  let checkingId = "";
  let signal: AbortSignal | null | undefined;
  const mockFetch = jest.fn<typeof fetch>(async (url, options) => {
    const body = JSON.parse(String(options?.body));
    if (!String(url).endsWith("/correction")) {
      return sceneResponse(body.message.id);
    }
    checkingId = body.messageId;
    signal = options?.signal;
    return await new Promise<Response>((resolve) => {
      complete = resolve;
    });
  });
  globalThis.fetch = mockFetch as typeof fetch;
  await renderWithHeroUI(<Harness />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByLabelText("예문 보내기"));
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  await act(() => jest.advanceTimersByTime(35_000));
  expect(screen.getByText("표현을 확인하지 못했어요.")).toBeOnTheScreen();
  expect(screen.queryByText("표현을 확인하고 있어요.")).toBeNull();
  expect(signal?.aborted).toBe(true);
  await act(() => {
    complete(Response.json({ messageId: checkingId, status: "natural" }));
  });
  expect(screen.queryByText("자연스러운 표현이에요.")).toBeNull();
  expect(screen.getByRole("button", { name: "표현 다시 확인" })).toBeEnabled();
});

function Harness() {
  const { chat, corrections } = useEpisodeRun(
    "token",
    "episode",
    [
      {
        id: "opening",
        parts: [{ text: "Hello.", type: "text" }],
        role: "assistant",
      },
    ],
    false,
    "story",
    "run",
    () => undefined
  );
  const send = useCallback(() => {
    chat.sendMessage({ text: "I want to go home." });
  }, [chat.sendMessage]);
  const rewind = useCallback(() => {
    chat.regenerate({ messageId: "opening" });
  }, [chat.regenerate]);
  return (
    <EpisodeCorrectionsProvider
      value={{ ...corrections, ask: () => undefined }}
    >
      <Pressable
        accessibilityLabel="예문 보내기"
        accessibilityRole="button"
        disabled={chat.status === "submitted" || chat.status === "streaming"}
        onPress={send}
      >
        <Text>보내기</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="앞 장면 다시 받기"
        accessibilityRole="button"
        onPress={rewind}
      >
        <Text>다시 받기</Text>
      </Pressable>
      {chat.messages.map((message) => (
        <EpisodeCorrectionNote key={message.id} message={message} />
      ))}
    </EpisodeCorrectionsProvider>
  );
}

function sceneResponse(messageId?: string) {
  const chunks = [
    { messageId: `scene-${messageId ?? "opening"}`, type: "start" },
    ...(messageId
      ? [
          {
            data: { messageId },
            transient: true,
            type: "data-expression-ready",
          },
        ]
      : []),
    { id: "answer", type: "text-start" },
    { delta: "Okay.", id: "answer", type: "text-delta" },
    { id: "answer", type: "text-end" },
    { type: "finish" },
  ];
  const response = new Response(null, {
    headers: {
      "content-type": "text/event-stream",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
  Object.defineProperty(response, "body", {
    value: new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`
          )
        );
        controller.close();
      },
    }),
  });
  return response;
}

test("보내자마자 확인 중을 표시하고 장면 뒤에는 교정이 늦어도 다음 말을 보낼 수 있다", async () => {
  let complete: (response: Response) => void = () => undefined;
  let checkingId = "";
  const mockFetch = jest.fn<typeof fetch>(async (url, options) => {
    const body = JSON.parse(String(options?.body));
    if (String(url).endsWith("/correction")) {
      checkingId = body.messageId;
      return await new Promise<Response>((resolve) => {
        complete = resolve;
      });
    }
    return sceneResponse(body.message.id);
  });
  globalThis.fetch = mockFetch as typeof fetch;
  await renderWithHeroUI(<Harness />);
  const user = userEvent.setup();
  await user.press(screen.getByLabelText("예문 보내기"));
  await waitFor(() =>
    expect(screen.getByText("표현을 확인하고 있어요.")).toBeOnTheScreen()
  );
  expect(screen.queryByText("자연스러운 표현이에요.")).toBeNull();
  await waitFor(() =>
    expect(screen.getByLabelText("예문 보내기")).toBeEnabled()
  );
  await act(() => {
    complete(Response.json({ messageId: checkingId, status: "natural" }));
  });
  await waitFor(() =>
    expect(screen.getByText("자연스러운 표현이에요.")).toBeOnTheScreen()
  );
  expect(screen.queryByText("표현을 확인하고 있어요.")).toBeNull();
});

test("실패하면 새로고침 아이콘으로 그 표현만 재시도하고 중복 요청을 막는다", async () => {
  let checks = 0;
  let scenes = 0;
  let checkingId = "";
  let complete: (response: Response) => void = () => undefined;
  const mockFetch = jest.fn<typeof fetch>(async (url, options) => {
    const body = JSON.parse(String(options?.body));
    if (!String(url).endsWith("/correction")) {
      scenes += 1;
      return sceneResponse(body.message.id);
    }
    checks += 1;
    checkingId = body.messageId;
    if (checks === 1) {
      return new Response(null, { status: 500 });
    }
    return await new Promise<Response>((resolve) => {
      complete = resolve;
    });
  });
  globalThis.fetch = mockFetch as typeof fetch;
  await renderWithHeroUI(<Harness />);
  const user = userEvent.setup();
  await user.press(screen.getByLabelText("예문 보내기"));
  await waitFor(() =>
    expect(screen.getByText("표현을 확인하지 못했어요.")).toBeOnTheScreen()
  );
  expect(screen.queryByText("자연스러운 표현이에요.")).toBeNull();
  await user.press(screen.getByRole("button", { name: "표현 다시 확인" }));
  expect(screen.getByText("표현을 확인하고 있어요.")).toBeOnTheScreen();
  const retry = screen.getByRole("button", { name: "표현 다시 확인" });
  expect(retry).toBeDisabled();
  expect(retry).toHaveProp(
    "accessibilityState",
    expect.objectContaining({ busy: true })
  );
  await user.press(retry);
  expect(checks).toBe(2);
  expect(scenes).toBe(1);
  await act(() => {
    complete(Response.json({ messageId: checkingId, status: "natural" }));
  });
  await waitFor(() =>
    expect(screen.getByText("자연스러운 표현이에요.")).toBeOnTheScreen()
  );
  expect(screen.queryByLabelText("표현 다시 확인")).toBeNull();
});

test("다음 말을 보낸 뒤 결과가 역순으로 와도 원래 메시지에 붙고 지운 메시지는 되살리지 않는다", async () => {
  const pending: {
    id: string;
    signal?: AbortSignal | null;
    resolve: (response: Response) => void;
  }[] = [];
  const mockFetch = jest.fn<typeof fetch>(async (url, options) => {
    const body = JSON.parse(String(options?.body));
    if (!String(url).endsWith("/correction")) {
      return sceneResponse(body.message?.id);
    }
    return await new Promise<Response>((resolve) => {
      pending.push({ id: body.messageId, resolve, signal: options?.signal });
    });
  });
  globalThis.fetch = mockFetch as typeof fetch;
  await renderWithHeroUI(<Harness />);
  const user = userEvent.setup();
  await user.press(screen.getByLabelText("예문 보내기"));
  await waitFor(() =>
    expect(screen.getByLabelText("예문 보내기")).toBeEnabled()
  );
  await user.press(screen.getByLabelText("예문 보내기"));
  await waitFor(() =>
    expect(screen.getAllByText("표현을 확인하고 있어요.")).toHaveLength(2)
  );
  await act(() => {
    pending[1].resolve(
      Response.json({ messageId: pending[1].id, status: "natural" })
    );
  });
  await waitFor(() =>
    expect(screen.getByText("자연스러운 표현이에요.")).toBeOnTheScreen()
  );
  expect(screen.getAllByText("표현을 확인하고 있어요.")).toHaveLength(1);
  await user.press(screen.getByLabelText("앞 장면 다시 받기"));
  await waitFor(() =>
    expect(screen.queryByText("표현을 확인하고 있어요.")).toBeNull()
  );
  expect(pending[0].signal?.aborted).toBe(true);
  await act(() => {
    pending[0].resolve(
      Response.json({ messageId: pending[0].id, status: "natural" })
    );
  });
  expect(screen.queryByText("자연스러운 표현이에요.")).toBeNull();
});
