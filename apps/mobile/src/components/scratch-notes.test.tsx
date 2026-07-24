import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { ScratchNotes } from "./scratch-notes";

// supabase 클라이언트를 목으로 대체 — 컴포넌트 import 시 실제 클라이언트가 env 없이
// throw 하는 걸 막는다(무한 staleTime이라 실제 호출은 일어나지 않는다).
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: () => ({
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ error: null }),
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

// 쿼리 캐시를 시드해 첫 렌더에서 데이터가 동기적으로 나오게 한다(staleTime 무한 →
// refetch 없음). 렌더는 act 안에서 한다 — IS_REACT_ACT_ENVIRONMENT가 요구한다.
function withSeededClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
  client.setQueryData(
    ["scratch_notes"],
    [
      {
        body: "첫 메모",
        created_at: "2026-01-01T00:00:00Z",
        id: "note-1",
        user_id: "user-1",
      },
    ]
  );
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ScratchNotes", () => {
  it("쿼리의 메모 목록을 렌더한다", async () => {
    await act(async () => {
      render(withSeededClient(<ScratchNotes />));
      await Promise.resolve();
    });

    expect(screen.getByText("첫 메모")).toBeTruthy();
  });
});
