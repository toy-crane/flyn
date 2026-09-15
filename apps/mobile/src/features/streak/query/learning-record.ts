import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  readSpokenDays,
  readStreakSummary,
} from "@/features/streak/api/learning-record";
import { getSupabaseClient } from "@/shared/supabase/client";

/**
 * 계정을 바꿨을 때 앞 계정의 기록을 읽지 않도록 사용자 ID를 키에 넣는다.
 *
 * 시간대와 오늘 날짜도 키에 넣는다. 자정이 지나거나 시간대가 바뀌면 같은 기록도
 * 다른 날로 묶이므로 새로 읽어야 한다.
 */
export function learningRecordQueryKey(userId: string) {
  return ["learning-record", userId] as const;
}

/**
 * 기기의 시간대 이름. 하루의 경계가 기기의 현지 자정이라 데이터베이스에 함께
 * 보낸다. 이름을 알 수 없는 드문 기기는 UTC로 센다.
 */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/*
  두 읽기 모두 곧바로 낡은 것으로 본다. 기록을 바꾸는 일은 모두 대화에서 일어나고
  그쪽은 이 쿼리를 거치지 않는다. 화를 끝내고 돌아왔는데 숫자가 그대로면 끝낸 화가
  기록되지 않은 것처럼 보인다.
*/

/** 화면에 붙어 있는 이 계정의 기록 읽기를 모두 다시 읽게 한다. */
export function useLearningRecordRefresh(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: learningRecordQueryKey(userId ?? ""),
      }),
    [queryClient, userId]
  );
}

/** 연속 기록의 날수와 기록이 시작된 날. */
export function useStreakSummary(
  userId: string | undefined,
  zone: string,
  today: string
) {
  return useQuery({
    enabled: userId !== undefined,
    queryFn: () => readStreakSummary(getSupabaseClient(), zone, today),
    queryKey: [...learningRecordQueryKey(userId ?? ""), "summary", zone, today],
    retry: 1,
    staleTime: 0,
  });
}

/** 두 날짜 사이의 날짜별 영어로 말한 횟수. */
export function useSpokenDays(
  userId: string | undefined,
  zone: string,
  firstDay: string,
  lastDay: string
) {
  return useQuery({
    enabled: userId !== undefined,
    queryFn: () => readSpokenDays(getSupabaseClient(), zone, firstDay, lastDay),
    queryKey: [
      ...learningRecordQueryKey(userId ?? ""),
      "days",
      zone,
      firstDay,
      lastDay,
    ],
    retry: 1,
    staleTime: 0,
  });
}
