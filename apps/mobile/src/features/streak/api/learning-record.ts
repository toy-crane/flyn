import type { Database } from "@repo/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/** 연속 기록의 날수와, 달력이 거슬러 갈 수 있는 가장 이른 날. */
export interface StreakSummary {
  /** `YYYY-MM-DD`. 학습 사실이 하나도 없으면 null이다. */
  firstDay: string | null;
  streak: number;
}

/** `YYYY-MM-DD`마다 그날 영어로 말한 횟수. 말하지 않은 날은 없다. */
export type SpokenDays = Record<string, number>;

/**
 * 연속 기록을 읽는다.
 *
 * 하루의 경계는 기기의 현지 자정이라, 기기의 시간대 이름과 그 시간대의 오늘
 * 날짜를 함께 보낸다. 무엇을 세는지는 데이터베이스가 정한다.
 */
export async function readStreakSummary(
  client: SupabaseClient<Database>,
  zone: string,
  today: string
): Promise<StreakSummary> {
  const { data, error } = await client.rpc("learning_streak", { today, zone });

  if (error) {
    throw error;
  }

  // 생성 타입은 표를 돌려주는 함수의 열이 비어 있을 수 있다는 것을 모른다.
  // 기록이 없는 계정의 시작한 날은 null로 온다.
  const row = data[0] as { first_day: string | null; streak: number };

  return { firstDay: row.first_day, streak: row.streak };
}

/** 기간 안의 날짜별 영어로 말한 횟수를 읽는다. 두 날짜를 모두 포함한다. */
export async function readSpokenDays(
  client: SupabaseClient<Database>,
  zone: string,
  firstDay: string,
  lastDay: string
): Promise<SpokenDays> {
  const { data, error } = await client.rpc("learning_days", {
    first_day: firstDay,
    last_day: lastDay,
    zone,
  });

  if (error) {
    throw error;
  }

  return Object.fromEntries(data.map((row) => [row.day, row.english_messages]));
}
