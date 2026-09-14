import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import { useUtteranceMeanings } from "./utterance-meanings";

test("뜻을 숨겼다 켜도 다시 요청하지 않는다", async () => {
  const request = jest.fn(async () => ({
    dialogueIndex: 0,
    meaning: "다음 손님, 오세요!",
    messageId: "s1",
  }));
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  await act(() => {
    result.current.toggle({ dialogueIndex: 0, messageId: "s1" });
  });
  expect(result.current.states["s1:0"]).toMatchObject({
    shown: true,
    status: "ready",
  });
  await act(() => {
    result.current.toggle({ dialogueIndex: 0, messageId: "s1" });
  });
  expect(result.current.states["s1:0"]).toMatchObject({ shown: false });
  await act(() => {
    result.current.toggle({ dialogueIndex: 0, messageId: "s1" });
  });
  expect(request).toHaveBeenCalledTimes(1);
});

test("첫 장면의 번역을 기다리는 중 회차가 생기면 늦은 뜻을 저장하고 담기도 함께 기다린다", async () => {
  let finish!: (value: {
    messageId: string;
    dialogueIndex: number;
    meaning: string;
  }) => void;
  const pending = new Promise<{
    messageId: string;
    dialogueIndex: number;
    meaning: string;
  }>((resolve) => {
    finish = resolve;
  });
  const request = jest.fn(async (_spot: unknown, play?: string) =>
    play
      ? { dialogueIndex: 0, meaning: "다음 손님, 오세요!", messageId: "s1" }
      : pending
  );
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  const spot = { dialogueIndex: 0, messageId: "s1" };
  await act(() => {
    result.current.toggle(spot);
  });
  let saved: Promise<string | undefined> = Promise.resolve(undefined);
  await act(() => {
    result.current.attachPlay("play-1");
    saved = result.current.forSave(spot);
  });
  expect(request).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ ...spot, meaning: "다음 손님, 오세요!" });
    await saved;
  });
  expect(await saved).toBe("다음 손님, 오세요!");
  expect(request.mock.calls[1]?.slice(0, 3)).toEqual([
    spot,
    "play-1",
    "다음 손님, 오세요!",
  ]);
});

test("첫 메시지에 뜻을 실었어도 회차를 받으면 저장 성공을 확인한다", async () => {
  const request = jest.fn(async () => ({
    dialogueIndex: 0,
    meaning: "다음 손님, 오세요!",
    messageId: "s1",
  }));
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  await act(() => {
    result.current.toggle({ dialogueIndex: 0, messageId: "s1" });
  });
  expect(result.current.openingMeanings()).toEqual([
    { dialogueIndex: 0, meaning: "다음 손님, 오세요!", messageId: "s1" },
  ]);
  await act(() => {
    result.current.attachPlay("play-1");
  });
  expect(request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenLastCalledWith(
    { dialogueIndex: 0, meaning: "다음 손님, 오세요!", messageId: "s1" },
    "play-1",
    "다음 손님, 오세요!",
    expect.anything()
  );
  await act(() => result.current.attachPlay("play-1"));
  expect(request).toHaveBeenCalledTimes(2);
});

test("버린 장면에 늦게 온 뜻은 다시 붙지 않는다", async () => {
  let finish!: (value: {
    messageId: string;
    dialogueIndex: number;
    meaning: string;
  }) => void;
  const request = jest.fn(
    () =>
      new Promise<{
        messageId: string;
        dialogueIndex: number;
        meaning: string;
      }>((resolve) => {
        finish = resolve;
      })
  );
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  await act(() => {
    result.current.toggle({ dialogueIndex: 0, messageId: "s1" });
  });
  await act(() => {
    result.current.retain(new Set());
    finish({ dialogueIndex: 0, meaning: "늦은 뜻", messageId: "s1" });
  });
  expect(result.current.states).toEqual({});
  expect(result.current.openingMeanings()).toEqual([]);
});

test("계정에서 돌아온 뜻은 처음부터 보이고 모델을 부르지 않는다", async () => {
  const request = jest.fn(() =>
    Promise.reject(new Error("unexpected request"))
  );
  const { result } = await renderHook(() =>
    useUtteranceMeanings(
      [{ dialogueIndex: 0, meaning: "다음 손님, 오세요!", messageId: "s1" }],
      "play-1",
      request
    )
  );
  expect(result.current.states["s1:0"]).toEqual({
    meaning: "다음 손님, 오세요!",
    shown: true,
    status: "ready",
  });
  expect(request).not.toHaveBeenCalled();
});

test("35초가 지나면 대기를 끝내고 실패한 번역을 다시 요청할 수 있다", async () => {
  jest.useFakeTimers();
  try {
    const request = jest.fn(() => new Promise<never>(() => undefined));
    const { result, unmount } = await renderHook(() =>
      useUtteranceMeanings([], undefined, request)
    );
    await act(() =>
      result.current.toggle({ dialogueIndex: 0, messageId: "s1" })
    );
    expect(result.current.states["s1:0"]).toEqual({ status: "pending" });
    await act(() => jest.advanceTimersByTimeAsync(35_000));
    expect(result.current.states["s1:0"]).toEqual({ status: "error" });
    expect(
      await result.current.forSave({ dialogueIndex: 0, messageId: "s1" })
    ).toBeUndefined();
    await act(() =>
      result.current.toggle({ dialogueIndex: 0, messageId: "s1" })
    );
    expect(request).toHaveBeenCalledTimes(2);
    await unmount();
  } finally {
    jest.useRealTimers();
  }
});

test("네이티브 AbortSignal에 throwIfAborted가 없어도 받은 뜻을 표시한다", async () => {
  const request = jest.fn(
    (
      _spot: unknown,
      _play: unknown,
      _meaning: unknown,
      signal?: AbortSignal
    ) => {
      Object.defineProperty(signal, "throwIfAborted", { value: undefined });
      return Promise.resolve({
        dialogueIndex: 0,
        meaning: "다음 손님, 오세요!",
        messageId: "s1",
      });
    }
  );
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  await act(() => result.current.toggle({ dialogueIndex: 0, messageId: "s1" }));
  expect(result.current.states["s1:0"]).toMatchObject({
    meaning: "다음 손님, 오세요!",
    status: "ready",
  });
});

test("회차 연결 뒤 뜻 저장이 실패하면 같은 뜻으로 다시 시도한다", async () => {
  const meaning = {
    dialogueIndex: 0,
    meaning: "다음 손님, 오세요!",
    messageId: "s1",
  };
  const request = jest
    .fn(async () => meaning)
    .mockResolvedValueOnce(meaning)
    .mockRejectedValueOnce(new Error("save failed"));
  const { result } = await renderHook(() =>
    useUtteranceMeanings([], undefined, request)
  );
  await act(() => result.current.toggle(meaning));
  result.current.openingMeanings();
  await act(() => result.current.attachPlay("play-1"));
  expect(result.current.states["s1:0"]).toEqual({ status: "error" });
  await act(() => result.current.toggle(meaning));
  expect(request).toHaveBeenLastCalledWith(
    meaning,
    "play-1",
    meaning.meaning,
    expect.anything()
  );
  expect(result.current.states["s1:0"]).toMatchObject({
    meaning: meaning.meaning,
    status: "ready",
  });
});
