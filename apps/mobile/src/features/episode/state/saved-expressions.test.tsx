import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import type {
  SavedExpressionRef,
  SavedExpressionSpot,
} from "@/features/episode/api/saved-expression";
import {
  type SavedExpressionStore,
  useSavedExpressionStore,
} from "./saved-expressions";

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
    announce: jest.fn<(isSaved: boolean) => void>(),
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

const PLAY = { episodeId: "e1", storyPlayId: "p1" };

async function mountStore(
  calls: ReturnType<typeof fakeSaving>,
  saved?: readonly SavedExpressionRef[]
) {
  const { result } = await renderHook(() =>
    useSavedExpressionStore(calls.save, calls.erase)
  );

  await settled(() => {
    result.current.hydrate({ ...PLAY, saved });
  });

  return result;
}

/** 화면이 붙이는 알림까지 함께 넘긴다. 저장소는 그것을 들고 있지 않는다. */
function toggle(
  result: { current: { toggle: SavedExpressionStore["toggle"] } },
  spot: SavedExpressionSpot,
  calls: ReturnType<typeof fakeSaving>
) {
  result.current.toggle(spot, calls.announce);
}

test("담으면 그 자리만 채워지고 한 번 알린다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, UTTERANCE, calls);
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
  expect(result.current.states["m1:learning"]).toBeUndefined();
  expect(calls.announce).toHaveBeenCalledWith(true);
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
    toggle(result, UTTERANCE, calls);
    toggle(result, UTTERANCE, calls);
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
  expect(calls.announce).toHaveBeenCalledWith(true);
});

test("담지 못하면 그 자리에 실패로 남고 다시 누르면 다시 담는다", async () => {
  const calls = fakeSaving(() => Promise.reject(new Error("gateway down")));
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, LEARNING, calls);
  });

  expect(result.current.states["m1:learning"]).toEqual({ status: "error" });
  expect(calls.announce).not.toHaveBeenCalled();

  calls.save.mockImplementation(() => Promise.resolve(CORRECTION_REF));
  await settled(() => {
    toggle(result, LEARNING, calls);
  });

  expect(result.current.states["m1:learning"]).toEqual({
    id: "saved-2",
    status: "saved",
  });
});

test("담긴 것을 다시 누르면 도로 놓이고 그 사실만 알린다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls, [savedRef("saved-1")]);

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });

  await settled(() => {
    toggle(result, UTTERANCE, calls);
  });

  expect(result.current.states["s1:0"]).toBeUndefined();
  expect(calls.erase).toHaveBeenCalledWith("saved-1", expect.anything());
  // 목록은 이때도 바뀌므로 알린다. 토스트를 띄울지는 받는 쪽이 정한다.
  expect(calls.announce).toHaveBeenCalledWith(false);
});

test("도로 놓지 못하면 담긴 상태로 돌아간다", async () => {
  const calls = fakeSaving();

  calls.erase.mockImplementation(() =>
    Promise.reject(new Error("connection refused"))
  );

  const result = await mountStore(calls, [savedRef("saved-1")]);

  await settled(() => {
    toggle(result, UTTERANCE, calls);
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
});

test("같은 대화를 다시 가져다 놓아도 방금 담은 것을 잃지 않는다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, UTTERANCE, calls);
  });
  // 표현 돌아보기가 자기 조회로 같은 대화를 다시 가져다 놓는 자리다. 서버의
  // 목록에는 방금 담은 것이 아직 없을 수 있다.
  await settled(() => {
    result.current.hydrate({ ...PLAY, saved: [CORRECTION_REF] });
  });

  expect(result.current.states["s1:0"]).toEqual({
    id: "saved-1",
    status: "saved",
  });
  expect(result.current.states["m1:learning"]).toEqual({
    id: "saved-2",
    status: "saved",
  });
});

test("다른 대화로 옮겨 가면 앞 대화의 표시를 버린다", async () => {
  const calls = fakeSaving();
  const result = await mountStore(calls, [savedRef("saved-1")]);

  await settled(() => {
    result.current.hydrate({
      episodeId: "e2",
      saved: undefined,
      storyPlayId: "p1",
    });
  });

  expect(result.current.states).toEqual({});
});

test("다른 대화로 옮겨 가면 아직 돌아오지 않은 요청을 끊는다", async () => {
  let settle: ((ref: SavedExpressionRef) => void) | undefined;
  const calls = fakeSaving(
    () =>
      new Promise<SavedExpressionRef>((resolve) => {
        settle = resolve;
      })
  );
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, UTTERANCE, calls);
  });
  await settled(() => {
    result.current.hydrate({
      episodeId: "e2",
      saved: undefined,
      storyPlayId: "p1",
    });
  });
  // 앞 대화의 응답이 늦게 도착해도 새 대화의 자리 표에 적히지 않는다.
  await settled(() => {
    settle?.(savedRef("saved-1"));
  });

  expect(result.current.states).toEqual({});
  expect(calls.announce).not.toHaveBeenCalled();
});

test("서버가 아는 자리는 남아 있던 실패 표시를 이긴다", async () => {
  const calls = fakeSaving(() => Promise.reject(new Error("connection lost")));
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, LEARNING, calls);
  });

  expect(result.current.states["m1:learning"]).toEqual({ status: "error" });

  // 요청은 서버에 닿았고 응답만 잃었다. 서버의 목록이 그 사실을 들고 온다.
  await settled(() => {
    result.current.hydrate({ ...PLAY, saved: [CORRECTION_REF] });
  });

  expect(result.current.states["m1:learning"]).toEqual({
    id: "saved-2",
    status: "saved",
  });
});

test("서버가 모르는 자리의 실패 표시는 그대로 남는다", async () => {
  const calls = fakeSaving(() => Promise.reject(new Error("gateway down")));
  const result = await mountStore(calls);

  await settled(() => {
    toggle(result, LEARNING, calls);
  });
  await settled(() => {
    result.current.hydrate({ ...PLAY, saved: [] });
  });

  expect(result.current.states["m1:learning"]).toEqual({ status: "error" });
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
