import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { queryKeys } from "../lib/query-keys";
import { ScratchNotes } from "./scratch-notes";

// 캐시를 시드해 첫 렌더에서 동기적으로 나오게 한다(staleTime 무한이라 fetch가 없다).
// supabase 목은 import를 성립시키기 위한 것으로, 실제로 호출되지 않는다.
jest.mock("../lib/supabase", () => ({ supabase: {} }));

function withSeededClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } },
  });
  client.setQueryData(queryKeys.scratchNotes, [
    { body: "첫 메모", id: "note-1" },
  ]);
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe("ScratchNotes", () => {
  it("쿼리의 메모 목록을 렌더한다", async () => {
    // 렌더는 act 안에서 — jest-setup이 IS_REACT_ACT_ENVIRONMENT를 켜둔다.
    await act(async () => {
      render(withSeededClient(<ScratchNotes />));
      await Promise.resolve();
    });

    expect(screen.getByText("첫 메모")).toBeTruthy();
  });
});
