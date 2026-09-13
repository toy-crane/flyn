import type { EpisodeClient } from "./story";

export interface UtteranceMeaning {
  meaning: string;
  messageId: string;
  utteranceAt: number;
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
  messageId: string;
  utteranceAt: number;
}
function meaningRow(client: EpisodeClient, spot: Spot) {
  return client
    .from("utterance_meanings")
    .select("meaning, claim_token, expires_at")
    .eq("message_id", spot.messageId)
    .eq("utterance_at", spot.utteranceAt)
    .maybeSingle();
}

async function completeClaim(
  client: EpisodeClient,
  spot: Spot,
  token: string,
  generate: (signal: AbortSignal) => Promise<string>,
  signal: AbortSignal,
  inherited?: string
) {
  try {
    const meaning = inherited ?? (await generate(signal));
    signal.throwIfAborted();
    if (!isMeaning(meaning)) {
      throw new Error("The utterance meaning is invalid.");
    }
    const saved = await client
      .from("utterance_meanings")
      .update({ meaning: meaning.trim() })
      .eq("message_id", spot.messageId)
      .eq("utterance_at", spot.utteranceAt)
      .eq("claim_token", token)
      .is("meaning", null)
      .select("meaning")
      .maybeSingle();
    if (saved.error) {
      throw saved.error;
    }
    if (saved.data?.meaning) {
      return saved.data.meaning;
    }
    const current = await meaningRow(client, spot);
    if (current.error) {
      throw current.error;
    }
    if (current.data?.meaning) {
      return current.data.meaning;
    }
    throw new Error("The utterance claim is no longer available.");
  } catch (error) {
    // 회수된 다른 선점이나 완료된 결과에는 손대지 않는다.
    await client
      .from("utterance_meanings")
      .delete()
      .eq("message_id", spot.messageId)
      .eq("utterance_at", spot.utteranceAt)
      .eq("claim_token", token)
      .is("meaning", null);
    throw error;
  }
}

async function inheritedMeaning(
  client: EpisodeClient,
  spot: Spot,
  supplied?: string
) {
  const legacy = await client
    .from("saved_expressions")
    .select("meaning")
    .eq("message_id", spot.messageId)
    .eq("utterance_at", spot.utteranceAt)
    .maybeSingle();
  if (legacy.error) {
    throw legacy.error;
  }
  return legacy.data?.meaning ?? supplied;
}

function rejectClaimError(error: { code: string } | null) {
  if (error && error.code !== "23505") {
    throw error;
  }
}

/** 번역과 담기가 공유하는 영구 저장 자리. 모델 호출 전에 선점한다. */
export function ensureUtteranceMeaning(
  client: EpisodeClient,
  spot: Spot,
  generate: (signal: AbortSignal) => Promise<string>,
  supplied?: string
): Promise<string> {
  const deadline = Date.now() + 35_000;
  async function attempt(): Promise<string> {
    if (Date.now() >= deadline) {
      throw new Error("Waiting for the utterance meaning timed out.");
    }
    const found = await meaningRow(client, spot);
    if (found.error) {
      throw found.error;
    }
    if (found.data?.meaning) {
      return found.data.meaning;
    }
    if (found.data && Date.parse(found.data.expires_at) > Date.now()) {
      return retry();
    }
    const inherited = found.data
      ? supplied
      : await inheritedMeaning(client, spot, supplied);
    const token = crypto.randomUUID();
    // 선점 전부터 상한을 센다. DB 왕복 때문에 모델이 선점 만료 뒤까지 돌지 않는다.
    const signal = AbortSignal.timeout(MEANING_TIMEOUT_MS);
    const claim = found.data
      ? await client
          .from("utterance_meanings")
          .update({
            claim_token: token,
            expires_at: new Date(Date.now() + MEANING_TIMEOUT_MS).toISOString(),
          })
          .eq("message_id", spot.messageId)
          .eq("utterance_at", spot.utteranceAt)
          .eq("claim_token", found.data.claim_token)
          .is("meaning", null)
          .select("claim_token")
          .maybeSingle()
      : await client
          .from("utterance_meanings")
          .insert({
            claim_token: token,
            meaning: inherited ?? null,
            message_id: spot.messageId,
            utterance_at: spot.utteranceAt,
          })
          .select("claim_token")
          .maybeSingle();
    rejectClaimError(claim.error);
    if (claim.data?.claim_token !== token) {
      return retry();
    }
    if (!found.data && inherited) {
      return inherited;
    }
    return completeClaim(client, spot, token, generate, signal, inherited);
  }
  async function retry(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return attempt();
  }
  return attempt();
}

export async function readUtteranceMeanings(
  client: EpisodeClient,
  messageIds: string[]
): Promise<UtteranceMeaning[]> {
  if (messageIds.length === 0) {
    return [];
  }
  const { data, error } = await client
    .from("utterance_meanings")
    .select("message_id, utterance_at, meaning")
    .in("message_id", messageIds)
    .not("meaning", "is", null);
  if (error) {
    throw error;
  }
  return data.flatMap((row) =>
    row.meaning
      ? [
          {
            meaning: row.meaning,
            messageId: row.message_id,
            utteranceAt: row.utterance_at,
          },
        ]
      : []
  );
}
