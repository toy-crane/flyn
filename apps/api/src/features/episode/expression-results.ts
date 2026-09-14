import type { Database } from "@repo/supabase";
import type { UIMessage } from "ai";
import type { CorrectionEntry, ExpressionResult } from "./correction";
import type { EpisodeClient } from "./story";

type ResultRow = Database["public"]["Tables"]["expressions"]["Row"];

function resultOf(
  messageId: string,
  status: string | null,
  row: ResultRow | undefined
): ExpressionResult {
  if (status === "natural" || status === "unclear") {
    return { messageId, status };
  }
  if (
    status !== "provided" ||
    !row ||
    !row.text ||
    !row.original ||
    !row.situation ||
    !row.meaning ||
    !row.example ||
    !row.example_meaning ||
    !Array.isArray(row.entries) ||
    row.entries.length === 0
  ) {
    throw new Error("Stored expression result is incomplete.");
  }
  return {
    correction: {
      entries: row.entries as unknown as CorrectionEntry[],
      fixed: row.text,
      messageId,
      original: row.original,
      review: {
        example: row.example,
        exampleMeaning: row.example_meaning,
        meaning: row.meaning,
        situation: row.situation,
      },
    },
    messageId,
    status: "corrected",
  };
}

/** 완료 판정과 표현을 함께 확정한다. 겹친 요청은 먼저 저장된 결과를 읽는다. */
export async function saveExpressionResult(
  client: EpisodeClient,
  result: ExpressionResult,
  _original: string
): Promise<ExpressionResult> {
  const content =
    result.status === "corrected"
      ? {
          entries: result.correction.entries.map((entry) => ({ ...entry })),
          example: result.correction.review.example,
          exampleMeaning: result.correction.review.exampleMeaning,
          meaning: result.correction.review.meaning,
          situation: result.correction.review.situation,
          text: result.correction.fixed,
        }
      : undefined;
  const { error } = await client.rpc("save_expression_result", {
    p_content: content,
    p_message_id: result.messageId,
    p_status: result.status === "corrected" ? "provided" : result.status,
  });
  if (error) {
    throw new Error(`Saving expression result failed: ${error.message}`);
  }
  const saved = await client
    .from("episode_messages")
    .select("id, expression_status, expressions(*)")
    .eq("id", result.messageId)
    .single();
  if (saved.error || !saved.data) {
    throw new Error("The saved expression result is unavailable.");
  }
  return resultOf(
    saved.data.id,
    saved.data.expression_status,
    saved.data.expressions[0]
  );
}

/** 카드가 없는 완료 판정도 읽고, 결과 도착 순서가 아니라 대화 순서로 돌려준다. */
export async function readExpressionResults(
  client: EpisodeClient,
  playId: string,
  messages: readonly UIMessage[]
): Promise<ExpressionResult[]> {
  const { data, error } = await client
    .from("episode_messages")
    .select("id, expression_status, expressions(*)")
    .eq("episode_play_id", playId)
    .not("expression_status", "is", null);
  if (error) {
    throw new Error(`Reading expression results failed: ${error.message}`);
  }
  const byMessage = new Map(data.map((row) => [row.id, row]));
  return messages.flatMap((message) => {
    const row = byMessage.get(message.id);
    if (!row || message.role !== "user") {
      return [];
    }
    return [resultOf(row.id, row.expression_status, row.expressions[0])];
  });
}
