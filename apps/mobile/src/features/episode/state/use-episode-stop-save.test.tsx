import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ChatStatus, UIMessage } from "ai";

import { saveStoppedEpisodeSession } from "@/features/episode/api/episode-session";
import {
  EPISODE_STOP_SAVE_TIMEOUT_MS,
  useEpisodeStopSave,
} from "./use-episode-stop-save";

jest.mock("@/features/episode/api/episode-session", () => ({
  saveStoppedEpisodeSession: jest.fn(() => Promise.resolve()),
}));

const mockSave = jest.mocked(saveStoppedEpisodeSession);
const EPISODE_ID = "11000000-0000-4000-8000-000000000001";
const USER_MESSAGE: UIMessage = {
  id: "user-1",
  parts: [{ text: "Please try again.", type: "text" }],
  role: "user",
};
const PARTIAL_ANSWER: UIMessage = {
  id: "assistant-1",
  parts: [{ text: "Let me", type: "text" }],
  role: "assistant",
};

interface StopSaveProps {
  messages: UIMessage[];
  status: ChatStatus;
  stop: () => Promise<void>;
}

function renderStopSave(initialProps: StopSaveProps) {
  return renderHook(
    (props: StopSaveProps) =>
      useEpisodeStopSave({
        accessToken: "token-1",
        episodeId: EPISODE_ID,
        ...props,
      }),
    { initialProps }
  );
}

beforeEach(() => {
  mockSave.mockReset();
  mockSave.mockResolvedValue();
});

afterEach(() => {
  jest.useRealTimers();
});

test("streaming 중지는 terminal 렌더의 최신 장면을 보정 저장한다", async () => {
  const stop = jest.fn(() => Promise.resolve());
  const { rerender, result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "streaming",
    stop,
  });
  let settled: Promise<void> | undefined;

  await act(() => {
    settled = result.current.stopAndSave();

    return Promise.resolve();
  });

  expect(stop).toHaveBeenCalledTimes(1);
  expect(mockSave).not.toHaveBeenCalled();

  await rerender({
    messages: [USER_MESSAGE, PARTIAL_ANSWER],
    status: "ready",
    stop,
  });

  await waitFor(() => {
    expect(mockSave).toHaveBeenCalledWith(
      "token-1",
      EPISODE_ID,
      [USER_MESSAGE, PARTIAL_ANSWER],
      "streaming",
      expect.any(AbortSignal)
    );
  });
  await act(() => settled);
  expect(result.current.isSaving).toBe(false);
});

test("submitted 중지는 잘라낸 재시도 목록임을 서버에 알린다", async () => {
  const stop = jest.fn(() => Promise.resolve());
  const { rerender, result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "submitted",
    stop,
  });
  let settled: Promise<void> | undefined;

  await act(() => {
    settled = result.current.stopAndSave();

    return Promise.resolve();
  });
  await rerender({ messages: [USER_MESSAGE], status: "ready", stop });
  await act(() => settled);

  expect(mockSave).toHaveBeenCalledWith(
    "token-1",
    EPISODE_ID,
    [USER_MESSAGE],
    "submitted",
    expect.any(AbortSignal)
  );
});

test("중복 중지는 한 번만 멈추고 저장한다", async () => {
  const stop = jest.fn(() => Promise.resolve());
  const { rerender, result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "streaming",
    stop,
  });
  let first: Promise<void> | undefined;
  let second: Promise<void> | undefined;

  await act(() => {
    first = result.current.stopAndSave();
    second = result.current.stopAndSave();

    return Promise.resolve();
  });
  await rerender({ messages: [USER_MESSAGE], status: "ready", stop });
  await act(() => Promise.all([first, second]));

  expect(stop).toHaveBeenCalledTimes(1);
  expect(mockSave).toHaveBeenCalledTimes(1);
});

test("보정 저장이 실패해도 중지 대기를 풀어 준다", async () => {
  mockSave.mockRejectedValueOnce(new Error("offline"));
  const stop = jest.fn(() => Promise.resolve());
  const { rerender, result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "streaming",
    stop,
  });
  let settled: Promise<void> | undefined;

  await act(() => {
    settled = result.current.stopAndSave();

    return Promise.resolve();
  });
  await rerender({ messages: [USER_MESSAGE], status: "error", stop });
  await act(() => settled);

  expect(result.current.isSaving).toBe(false);
});

test("보정 저장이 멎어도 제한 시간이 지나면 대기를 풀어 준다", async () => {
  jest.useFakeTimers();
  mockSave.mockImplementationOnce(() => new Promise<void>(() => undefined));
  const stop = jest.fn(() => Promise.resolve());
  const { rerender, result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "streaming",
    stop,
  });
  let settled: Promise<void> | undefined;

  await act(() => {
    settled = result.current.stopAndSave();

    return Promise.resolve();
  });
  await rerender({ messages: [USER_MESSAGE], status: "ready", stop });

  await act(() => {
    jest.advanceTimersByTime(EPISODE_STOP_SAVE_TIMEOUT_MS);

    return settled;
  });

  expect(result.current.isSaving).toBe(false);
  expect(mockSave.mock.calls[0]?.[4].aborted).toBe(true);
});

test("중지 뒤 terminal 렌더가 없어도 제한 시간이 지나면 대기를 풀어 준다", async () => {
  jest.useFakeTimers();
  const stop = jest.fn(() => Promise.resolve());
  const { result } = await renderStopSave({
    messages: [USER_MESSAGE],
    status: "streaming",
    stop,
  });
  let settled: Promise<void> | undefined;

  await act(() => {
    settled = result.current.stopAndSave();

    return Promise.resolve();
  });
  await act(() => {
    jest.advanceTimersByTime(EPISODE_STOP_SAVE_TIMEOUT_MS);

    return settled;
  });

  expect(result.current.isSaving).toBe(false);
  expect(mockSave).not.toHaveBeenCalled();
});
