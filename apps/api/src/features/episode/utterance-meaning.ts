import type { EpisodeClient } from "./story";

export interface UtteranceMeaning {
  dialogueIndex: number;
  meaning: string;
  messageId: string;
}

export const MEANING_TIMEOUT_MS = 30_000;

export function isMeaning(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 1000
  );
}

interface Spot {
  dialogueIndex: number;
  messageId: string;
  speaker: string;
  text: string;
}

async function completeClaim(
  client: EpisodeClient,
  spot: Spot,
  token: string,
  generate: (signal: AbortSignal) => Promise<string>,
  signal: AbortSignal,
  supplied?: string
) {
  try {
    const meaning = supplied ?? (await generate(signal));
    signal.throwIfAborted();
    if (!isMeaning(meaning)) {
      throw new Error("The utterance meaning is invalid.");
    }
    const saved = await client
      .rpc("complete_dialogue_expression", {
        p_dialogue_index: spot.dialogueIndex,
        p_meaning: meaning.trim(),
        p_message_id: spot.messageId,
        p_token: token,
      })
      .single();
    if (saved.error) {
      throw new Error(saved.error.message, { cause: saved.error });
    }
    if (!saved.data.meaning) {
      throw new Error("The utterance claim is no longer available.");
    }
    return saved.data.meaning;
  } catch (error) {
    // 회수된 다른 선점이나 완료된 결과에는 손대지 않는다.
    await client
      .from("expressions")
      .delete()
      .eq("message_id", spot.messageId)
      .eq("dialogue_index", spot.dialogueIndex)
      .eq("claim_token", token)
      .is("meaning", null);
    throw error;
  }
}

/** 번역과 담기가 공유하는 영구 저장 자리. DB가 만료와 선점 권한을 판단한다. */
export async function ensureUtteranceMeaning(
  client: EpisodeClient,
  spot: Spot,
  generate: (signal: AbortSignal) => Promise<string>,
  supplied?: string
): Promise<string> {
  const deadline = Date.now() + 35_000;
  while (Date.now() < deadline) {
    const token = crypto.randomUUID();
    // 선점 전부터 상한을 센다. DB 왕복 때문에 모델이 선점 만료 뒤까지 돌지 않는다.
    const signal = AbortSignal.timeout(MEANING_TIMEOUT_MS);
    // biome-ignore lint/performance/noAwaitInLoops: 앞선 선점 결과를 확인한 뒤에만 재시도한다.
    const claim = await client
      .rpc("claim_dialogue_expression", {
        p_dialogue_index: spot.dialogueIndex,
        p_message_id: spot.messageId,
        p_speaker: spot.speaker,
        p_text: spot.text.trim(),
        p_token: token,
      })
      .single();
    if (claim.error) {
      throw new Error(claim.error.message, { cause: claim.error });
    }
    if (claim.data.meaning) {
      return claim.data.meaning;
    }
    if (claim.data.claim_token === token) {
      return completeClaim(client, spot, token, generate, signal, supplied);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Waiting for the utterance meaning timed out.");
}

export async function readUtteranceMeanings(
  client: EpisodeClient,
  messageIds: string[]
): Promise<UtteranceMeaning[]> {
  if (messageIds.length === 0) {
    return [];
  }
  const { data, error } = await client
    .from("expressions")
    .select("message_id, dialogue_index, meaning")
    .eq("kind", "dialogue")
    .in("message_id", messageIds)
    .not("meaning", "is", null);
  if (error) {
    throw error;
  }
  return data.flatMap((row) =>
    row.meaning && row.message_id && row.dialogue_index !== null
      ? [
          {
            dialogueIndex: row.dialogue_index,
            meaning: row.meaning,
            messageId: row.message_id,
          },
        ]
      : []
  );
}
