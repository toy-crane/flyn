import type { Database } from "@repo/supabase";
import type { UIMessage } from "ai";
import type { CorrectionEntry, ExpressionResult } from "./correction";
import type { EpisodeClient } from "./story";

type ResultRow =
  Database["public"]["Tables"]["episode_expression_results"]["Row"];

function resultOf(row: ResultRow, original: string): ExpressionResult {
  const messageId = row.message_id;
  if (row.status === "natural" || row.status === "unclear") {
    return { messageId, status: row.status };
  }
  if (
    row.status !== "corrected" ||
    !row.fixed ||
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
      fixed: row.fixed,
      messageId,
      original,
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

/** 완료 판정과 카드 내용은 한 행으로 저장한다. 겹친 요청은 먼저 저장된 결과를 읽는다. */
export async function saveExpressionResult(
  client: EpisodeClient,
  result: ExpressionResult,
  original: string
): Promise<ExpressionResult> {
  const content =
    result.status === "corrected"
      ? {
          entries: result.correction.entries.map((entry) => ({ ...entry })),
          example: result.correction.review.example,
          example_meaning: result.correction.review.exampleMeaning,
          fixed: result.correction.fixed,
          meaning: result.correction.review.meaning,
          situation: result.correction.review.situation,
        }
      : {};
  const { error } = await client.from("episode_expression_results").insert({
    message_id: result.messageId,
    status: result.status,
    ...content,
  });
  if (error && error.code !== "23505") {
    throw new Error(`Saving expression result failed: ${error.message}`);
  }
  const saved = await client
    .from("episode_expression_results")
    .select("*")
    .eq("message_id", result.messageId)
    .single();
  if (saved.error || !saved.data) {
    throw new Error("The saved expression result is unavailable.");
  }
  return resultOf(saved.data, original.trim());
}

/** 카드가 없는 완료 판정도 읽고, 결과 도착 순서가 아니라 대화 순서로 돌려준다. */
export async function readExpressionResults(
  client: EpisodeClient,
  playId: string,
  messages: readonly UIMessage[]
): Promise<ExpressionResult[]> {
  const { data, error } = await client
    .from("episode_expression_results")
    .select("*, episode_messages!inner(play_id)")
    .eq("episode_messages.play_id", playId);
  if (error) {
    throw new Error(`Reading expression results failed: ${error.message}`);
  }
  const byMessage = new Map(data.map((row) => [row.message_id, row]));
  return messages.flatMap((message) => {
    const row = byMessage.get(message.id);
    if (!row || message.role !== "user") {
      return [];
    }
    const original = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim();
    return [resultOf(row, original)];
  });
}
