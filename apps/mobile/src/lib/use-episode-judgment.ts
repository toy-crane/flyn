import type { JudgmentUpdate } from "@flyn/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MessageFeedback, withArrivedFeedback } from "./message-feedback";
import { queryKeys } from "./query-keys";
import { rpc } from "./rpc";

const GENERIC_ERROR = "잠시 후 다시 시도해 주세요.";

/**
 * 결과 화면의 `다시 확인`. 대화가 끝나면 다음 판정 호출이 없어 못 채운 발화가
 * 저절로 메워지지 않으므로, 여기서 한 번 더 부른다. 어느 발화가 비었는지는
 * 서버가 안다 — 앱은 그 에피소드를 가리키기만 한다.
 */
export async function refillJudgment(
  episodeId: string
): Promise<JudgmentUpdate> {
  const response = await rpc.episodes[":episodeId"].judgments.$post({
    param: { episodeId },
  });
  const body = (await response.json().catch(() => null)) as
    | (JudgmentUpdate & { error?: unknown })
    | null;

  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string" ? body.error : GENERIC_ERROR
    );
  }

  return { goals: body?.goals ?? [], sentences: body?.sentences ?? [] };
}

export function useRefillJudgment(episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refillJudgment(episodeId),
    onSuccess: ({ goals, sentences }) => {
      // 판정이 도착한 자리는 대화 화면과 같은 캐시다. 시트도 여기서 열린다.
      queryClient.setQueryData<MessageFeedback[]>(
        queryKeys.episodeFeedback(episodeId),
        (current = []) => withArrivedFeedback(current, sentences)
      );

      // 늦게 잡힌 목표가 있으면 저장된 목표를 다시 읽는다.
      if (goals.length > 0) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.episode(episodeId),
        });
      }
    },
  });
}
