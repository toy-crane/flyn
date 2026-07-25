import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { queryKeys } from "../lib/query-keys";
import { ScratchNotes } from "./scratch-notes";

// 시드된 캐시 + staleTime 무한이라 fetch가 없다. 목은 import를 성립시키는 용도.
jest.mock("../lib/supabase", () => ({ supabase: {} }));

function withSeededClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 gcTime은 5분이다. 캐시에 남은 타이머가 테스트가 끝난 뒤에도
        // 살아 있어 jest가 그만큼 종료하지 못한다.
        gcTime: 0,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
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
