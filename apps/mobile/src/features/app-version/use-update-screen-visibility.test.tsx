import { expect, test } from "@jest/globals";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { trackPendingUserWork } from "@/shared/state/pending-user-work";

import { useUpdateScreenVisibility } from "./use-update-screen-visibility";

function withQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Number.POSITIVE_INFINITY },
      queries: { gcTime: Number.POSITIVE_INFINITY },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

test("응답 중 차단을 확인해도 응답 처리가 끝난 뒤 업데이트 화면을 보여 준다", async () => {
  let finishReply: (() => void) | undefined;
  const reply = new Promise<void>((resolve) => {
    finishReply = resolve;
  });
  let blocked = false;
  const visibility = await renderHook(
    () => useUpdateScreenVisibility(blocked),
    { wrapper: withQueryClient() }
  );

  await act(async () => {
    trackPendingUserWork(reply);
    await Promise.resolve();
  });
  blocked = true;
  await visibility.rerender(undefined);
  expect(visibility.result.current).toBe(false);

  await act(async () => finishReply?.());
  await waitFor(() => expect(visibility.result.current).toBe(true));
});

test("프로필 같은 React Query 저장도 끝난 뒤 업데이트 화면을 보여 준다", async () => {
  let finishSave: (() => void) | undefined;
  const save = new Promise<void>((resolve) => {
    finishSave = resolve;
  });
  const visibility = await renderHook(
    () => ({
      save: useMutation({ mutationFn: () => save }),
      visible: useUpdateScreenVisibility(true),
    }),
    { wrapper: withQueryClient() }
  );

  await act(async () => visibility.result.current.save.mutate());
  await waitFor(() => expect(visibility.result.current.visible).toBe(false));

  await act(async () => finishSave?.());
  await waitFor(() => expect(visibility.result.current.visible).toBe(true));
});
