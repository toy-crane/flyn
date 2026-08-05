/**
 * 문장 질문. 첨삭 시트의 `더 물어보기`로 여는, 문장 하나를 두고 묻는 자리다.
 * 롤플레잉이 아니라 학습 질문을 주고받으므로 에피소드 대화와 다른 기록을 읽고,
 * 저장돼 있으므로 같은 문장에서 다시 열면 지난 내용이 이어서 나온다.
 */

import type { Tables } from "@flyn/supabase";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

/** 문장 질문에서 오간 말 하나. 턴으로 세지 않으므로 에피소드와 섞지 않는다. */
export type SentenceQuestionMessage = Pick<
  Tables<"sentence_question_messages">,
  "content" | "created_at" | "id" | "role" | "status"
>;

const QUESTION_COLUMNS = "id, role, content, status, created_at";

export async function fetchSentenceQuestion(
  episodeId: string,
  messageId: string
): Promise<SentenceQuestionMessage[]> {
  const { data } = await supabase
    .from("sentence_question_messages")
    .select(QUESTION_COLUMNS)
    .eq("episode_id", episodeId)
    .eq("message_id", messageId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .throwOnError();

  return data;
}

/**
 * 그 문장에서 지난번에 주고받은 말. 문장마다 키가 달라 다른 문장에서 연 질문과
 * 섞이지 않는다.
 */
export function useSentenceQuestion(episodeId: string, messageId: string) {
  return useQuery({
    enabled: episodeId.length > 0 && messageId.length > 0,
    queryFn: () => fetchSentenceQuestion(episodeId, messageId),
    queryKey: queryKeys.sentenceQuestion(episodeId, messageId),
  });
}
