import { expect, test } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { trackPendingUserWork, usePendingUserWork } from "./pending-user-work";

test("응답과 저장이 모두 끝나고 화면에 반영된 다음 작업 대기를 해제한다", async () => {
  let finishReply: (() => void) | undefined;
  let failSave: ((error: Error) => void) | undefined;
  const reply = new Promise<void>((resolve) => {
    finishReply = resolve;
  });
  const save = new Promise<void>((_resolve, reject) => {
    failSave = reject;
  });
  const pending = await renderHook(() => usePendingUserWork());

  await act(async () => {
    trackPendingUserWork(reply);
    trackPendingUserWork(save).catch(() => undefined);
    await Promise.resolve();
  });
  await waitFor(() => expect(pending.result.current).toBe(true));

  await act(async () => finishReply?.());
  expect(pending.result.current).toBe(true);

  await act(async () => failSave?.(new Error("save failed")));
  await waitFor(() => expect(pending.result.current).toBe(false));
});
