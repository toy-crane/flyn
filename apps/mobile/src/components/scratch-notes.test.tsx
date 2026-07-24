import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { queryKeys } from "../lib/query-keys";
import { ScratchNotes } from "./scratch-notes";

// supabase를 목으로 — import 시 실제 클라이언트가 env 없이 throw하는 걸 막는다.
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

// 캐시를 시드해 첫 렌더에서 동기적으로 나오게 한다(staleTime 무한). 렌더는 act 안에서.
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
  client.setQueryData(queryKeys.scratchNotes, [
    {
      body: "첫 메모",
      created_at: "2026-01-01T00:00:00Z",
      id: "note-1",
      user_id: "user-1",
    },
  ]);
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
