import { describe, expect, jest, test } from "@jest/globals";
import type { Database } from "@repo/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSpokenDays, readStreakSummary } from "./learning-record";

type Rpc = (
  name: string,
  args: Record<string, string>
) => Promise<{ data: unknown; error: Error | null }>;

function clientAnswering(data: unknown, error: Error | null = null) {
  const rpc = jest.fn<Rpc>(async () => ({ data, error }));
  const client = { rpc } as unknown as SupabaseClient<Database>;
  return { client, rpc };
}

describe("연속 기록 읽기", () => {
  test("기기의 시간대와 오늘 날짜로 날수와 기록이 시작된 날을 읽는다", async () => {
    const { client, rpc } = clientAnswering([
      { first_day: "2026-03-04", streak: 12 },
    ]);

    await expect(
      readStreakSummary(client, "Asia/Seoul", "2026-09-13")
    ).resolves.toEqual({ firstDay: "2026-03-04", streak: 12 });
    expect(rpc).toHaveBeenCalledWith("learning_streak", {
      today: "2026-09-13",
      zone: "Asia/Seoul",
    });
  });

  test("기록이 없는 계정은 0일이고 시작한 날이 없다", async () => {
    const { client } = clientAnswering([{ first_day: null, streak: 0 }]);

    await expect(
      readStreakSummary(client, "Asia/Seoul", "2026-09-13")
    ).resolves.toEqual({ firstDay: null, streak: 0 });
  });

  test("읽기가 실패하면 실패를 그대로 알린다", async () => {
    const failure = new Error("network");
    const { client } = clientAnswering(null, failure);

    await expect(
      readStreakSummary(client, "Asia/Seoul", "2026-09-13")
    ).rejects.toBe(failure);
  });
});

describe("날짜별 영어로 말한 횟수 읽기", () => {
  test("기간 안에서 영어로 말한 날을 날짜로 찾을 수 있게 돌려준다", async () => {
    const { client, rpc } = clientAnswering([
      { day: "2026-09-08", english_messages: 3 },
      { day: "2026-09-12", english_messages: 6 },
    ]);

    await expect(
      readSpokenDays(client, "Asia/Seoul", "2026-09-07", "2026-09-13")
    ).resolves.toEqual({ "2026-09-08": 3, "2026-09-12": 6 });
    expect(rpc).toHaveBeenCalledWith("learning_days", {
      first_day: "2026-09-07",
      last_day: "2026-09-13",
      zone: "Asia/Seoul",
    });
  });
});
