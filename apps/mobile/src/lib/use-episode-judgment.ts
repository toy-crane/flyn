import type { EpisodeJudgmentResult } from "@flyn/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MessageFeedback, withArrivedFeedback } from "./message-feedback";
import { queryKeys } from "./query-keys";
import { rpc } from "./rpc";

const GENERIC_ERROR = "잠시 후 다시 시도해 주세요.";

/**
 * 판정을 부른다. **응답 스트림과 나뉜 두 번째 요청이다** — 곁가지를 응답과 같은
 * HTTP 수명에 얹으면 답이 끝난 뒤에도 스트림이 닫히지 않아 다음 발화가 막힌다.
 *
 * 대화 화면은 한 턴이 끝난 직후, 결과 화면은 `다시 확인`에서 같은 것을 부른다.
 * 어느 발화가 비었는지는 서버가 저장을 보고 정하므로 앱은 에피소드만 가리킨다.
 */
export async function requestJudgment(
  episodeId: string
): Promise<EpisodeJudgmentResult> {
  const response = await rpc.episodes[":episodeId"].judgments.$post({
    param: { episodeId },
  });
  const body = (await response.json().catch(() => null)) as
    | (EpisodeJudgmentResult & { error?: unknown })
    | null;

  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string" ? body.error : GENERIC_ERROR
    );
  }

  return {
    ending: body?.ending ?? null,
    goals: body?.goals ?? [],
    sentences: body?.sentences ?? [],
  };
}

/**
 * 결과 화면의 `다시 확인`. 대화가 끝난 뒤에는 다음 턴이 없어 못 채운 발화가
 * 저절로 메워지지 않으므로, 여기서 한 번 더 부른다.
 */
export function useRefillJudgment(episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestJudgment(episodeId),
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
