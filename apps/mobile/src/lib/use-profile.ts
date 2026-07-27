import type { Tables } from "@flyn/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeDisplayName } from "./display-name";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

export type Profile = Pick<Tables<"profiles">, "id" | "email" | "display_name">;

const COLUMNS = "id, email, display_name";

/**
 * 행이 없으면 `null`, 조회가 실패하면 던진다. **이 둘을 섞지 않는 것이 이 함수의
 * 일이다** — 실패를 `null`로 뭉개면 네트워크가 끊긴 사용자가 온보딩 화면을 보고
 * 이미 정한 이름을 다시 입력하게 된다(§2).
 *
 * RLS가 이미 자기 행으로 좁히지만 `eq`를 명시한다. 정책이 느슨해지는 날
 * `maybeSingle`이 여러 행을 만나 던지는 대신, 여기서 계속 한 행만 본다.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select(COLUMNS)
    .eq("id", userId)
    .maybeSingle()
    .throwOnError();

  return data;
}

/**
 * 온보딩과 설정의 편집이 함께 쓰는 저장 규칙. 한 곳에만 있어야 두 경로가
 * 갈라지지 않는다(§4). 진짜 경계는 DB의 check와 트리거이고, 여기서는 보내는
 * 값을 저장될 값과 같게 맞춘다.
 */
export async function saveDisplayName(
  userId: string,
  raw: string
): Promise<Profile> {
  const { data } = await supabase
    .from("profiles")
    .update({ display_name: normalizeDisplayName(raw) })
    .eq("id", userId)
    .select(COLUMNS)
    .single()
    .throwOnError();

  return data;
}

/**
 * `userId`가 null이면 조회를 켜지 않는다. 훅은 조건부로 부를 수 없어
 * `_layout`이 로그인 전에도 이 훅을 부르는데, 그때 조회가 나가면 anon으로
 * 권한 오류를 받아 게이트가 실패로 떨어진다.
 */
export function useProfile(userId: string | null) {
  return useQuery({
    enabled: userId !== null,
    queryFn: () => fetchProfile(userId as string),
    queryKey: queryKeys.profile(userId ?? "anonymous"),
  });
}

/**
 * §3의 네 갈래. 화면들은 이 판정만 받고 조회의 사정은 모른다.
 *
 * - `failed` 조회 실패 — 네트워크·권한. 재시도할 수 있어야 한다.
 * - `missing` 행 없음 — 트리거가 만들었어야 할 행이 없다. 온보딩으로 가장하지
 *   않고 무결성 오류로 드러낸다.
 * - `onboarding` `display_name`이 null. 완료 조건은 이것 하나뿐이다.
 */
export type ProfileGate =
  | { kind: "loading" }
  | { kind: "failed"; retry: () => void; retrying: boolean }
  | { kind: "missing" }
  | { kind: "onboarding" }
  | { kind: "ready" };

/**
 * 판정을 훅 밖의 순수 함수로 둔다. 네 갈래를 가르는 규칙이 이 스펙에서 가장
 * 틀리기 쉬운 자리인데, 훅 안에 있으면 검증에 QueryClient와 렌더 트리가 따라와
 * 정작 규칙은 흐려진다.
 */
export function describeProfileGate(query: {
  data: Profile | null | undefined;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  refetch: () => void;
}): ProfileGate {
  if (query.isError) {
    return {
      kind: "failed",
      retry: () => {
        query.refetch();
      },
      retrying: query.isFetching,
    };
  }

  if (query.isPending || query.data === undefined) {
    return { kind: "loading" };
  }

  if (query.data === null) {
    return { kind: "missing" };
  }

  return query.data.display_name === null
    ? { kind: "onboarding" }
    : { kind: "ready" };
}

export function useProfileGate(userId: string | null): ProfileGate {
  return describeProfileGate(useProfile(userId));
}

/**
 * 갱신된 행을 그대로 받아 캐시에 넣는다. 무효화만 하면 다시 받아오는 동안
 * 온보딩 화면이 한 번 더 깜빡인다.
 */
export function useSaveDisplayName(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (raw: string) => saveDisplayName(userId, raw),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile(userId), profile);
    },
  });
}
