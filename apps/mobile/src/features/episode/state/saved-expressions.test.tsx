import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import type {
  SavedExpressionRef,
  SavedExpressionSpot,
} from "@/features/episode/api/saved-expression";
import { useEpisodeSavedExpressions } from "./saved-expressions";

const UTTERANCE: SavedExpressionSpot = {
  kind: "utterance",
  messageId: "s1",
  utteranceAt: 0,
};
const LEARNING: SavedExpressionSpot = { kind: "learning", messageId: "m1" };
const CORRECTION_REF: SavedExpressionRef = {
  id: "saved-2",
  kind: "correction",
  messageId: "m1",
  utteranceAt: null,
};

function savedRef(id: string): SavedExpressionRef {
  return { id, kind: "utterance", messageId: "s1", utteranceAt: 0 };
}

/** 담고, 도로 놓고, 알리는 세 가지를 지켜보는 자리. */
function fakeSaving(
  save: () => Promise<SavedExpressionRef> = () =>
    Promise.resolve(savedRef("saved-1"))
) {
  return {
    announce: jest.fn<() => void>(),
    erase: jest.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
    save: jest.fn<() => Promise<SavedExpressionRef>>(save),
  };
}

/** act 안에서 마이크로태스크까지 흘려보낸다. 담기와 놓기가 그 안에서 끝난다. */
async function settled(work: () => void) {
  await act(async () => {
    work();
    await Promise.resolve();
  });
}

async function mountStore(
  calls: ReturnType<typeof fakeSaving>,
  saved?: readonly SavedExpressionRef[]
) {
  const { result } = await renderHook(() =>
    useEpisodeSavedExpressions(saved, calls.save, calls.erase, calls.announce)
  );

  return result;
}

test("담으면 그 자리만 채워지고 한 번 알린다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls);

  await settled(() => {
    result.current.toggle(UTTERANCE);
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
  expect(result.current.states["m1:learning"]).toBeUndefined();
  expect(calls.announce).toHaveBeenCalledTimes(1);
});

test("담는 동안 다시 눌러도 두 번 담지 않는다", async () => {
  let settle: ((ref: SavedExpressionRef) => void) | undefined;
  const calls = fakeSaving(
    () =>
      new Promise<SavedExpressionRef>((resolve) => {
        settle = resolve;
      })
  );
  const result = await mountStore(calls);

  await settled(() => {
    result.current.toggle(UTTERANCE);
    result.current.toggle(UTTERANCE);
  });

  expect(result.current.states["s1:0"]).toEqual({ status: "saving" });
  expect(calls.save).toHaveBeenCalledTimes(1);

  await settled(() => {
    settle?.(savedRef("saved-1"));
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
  expect(calls.announce).toHaveBeenCalledTimes(1);
});

test("담지 못하면 그 자리에 실패로 남고 다시 누르면 다시 담는다", async () => {
  const calls = fakeSaving(() => Promise.reject(new Error("gateway down")));
  const result = await mountStore(calls);

  await settled(() => {
    result.current.toggle(LEARNING);
  });

  expect(result.current.states["m1:learning"]).toEqual({ status: "error" });
  expect(calls.announce).not.toHaveBeenCalled();

  calls.save.mockImplementation(() => Promise.resolve(CORRECTION_REF));
  await settled(() => {
    result.current.toggle(LEARNING);
  });

  expect(result.current.states["m1:learning"]).toEqual({
    id: "saved-2",
    status: "saved",
  });
});

test("담긴 것을 다시 누르면 도로 놓이고 알리지 않는다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls, [savedRef("saved-1")]);

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });

  await settled(() => {
    result.current.toggle(UTTERANCE);
  });

  expect(result.current.states["s1:0"]).toBeUndefined();
  expect(calls.erase).toHaveBeenCalledWith("saved-1", expect.anything());
  expect(calls.announce).not.toHaveBeenCalled();
});

test("도로 놓지 못하면 담긴 상태로 돌아간다", async () => {
  const calls = fakeSaving();

  calls.erase.mockImplementation(() =>
    Promise.reject(new Error("connection refused"))
  );

  const result = await mountStore(calls, [savedRef("saved-1")]);

  await settled(() => {
    result.current.toggle(UTTERANCE);
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
});

test("사라진 메시지의 표시는 함께 버린다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls, [savedRef("saved-1"), CORRECTION_REF]);

  await settled(() => {
    result.current.retain(new Set(["m1"]));
  });

  expect(result.current.states["s1:0"]).toBeUndefined();
  expect(result.current.states["m1:learning"]).toEqual({
    id: "saved-2",
    status: "saved",
  });
});
