import { expect, jest, test } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useUpdateScreenVisibility } from "@/features/app-version/use-update-screen-visibility";

import { useEpisodeCorrections } from "./episode-corrections";

test("진행 중인 교정 결과를 화면에 반영한 뒤 업데이트 화면을 연다", async () => {
  let finishCheck:
    | ((result: { messageId: string; status: "natural" }) => void)
    | undefined;
  const check = new Promise<{ messageId: string; status: "natural" }>(
    (resolve) => {
      finishCheck = resolve;
    }
  );
  const client = new QueryClient();
  const hook = await renderHook(
    () => ({
      corrections: useEpisodeCorrections(undefined, () => check),
      updateVisible: useUpdateScreenVisibility(true),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  );

  await act(async () => {
    hook.result.current.corrections.begin("message-1");
    hook.result.current.corrections.check("message-1");
    await Promise.resolve();
  });
  expect(hook.result.current.updateVisible).toBe(false);

  await act(async () =>
    finishCheck?.({ messageId: "message-1", status: "natural" })
  );
  expect(hook.result.current.corrections.states["message-1"]).toEqual({
    status: "natural",
  });
  await waitFor(() => expect(hook.result.current.updateVisible).toBe(true));
  hook.unmount();
});

test("교정 요청이 끝나지 않아도 제한 시간이 지나면 업데이트 화면을 연다", async () => {
  jest.useFakeTimers();
  const client = new QueryClient();
  try {
    const hook = await renderHook(
      () => ({
        corrections: useEpisodeCorrections(
          undefined,
          () => new Promise(() => undefined)
        ),
        updateVisible: useUpdateScreenVisibility(true),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      }
    );
    await act(async () => {
      hook.result.current.corrections.begin("message-2");
      hook.result.current.corrections.check("message-2");
      await Promise.resolve();
    });
    expect(hook.result.current.updateVisible).toBe(false);

    await act(async () => jest.advanceTimersByTimeAsync(35_001));
    expect(hook.result.current.corrections.states["message-2"]).toEqual({
      status: "error",
    });
    expect(hook.result.current.updateVisible).toBe(true);
    hook.unmount();
  } finally {
    jest.useRealTimers();
  }
});
