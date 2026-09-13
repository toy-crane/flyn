import { aiUrl } from "@/shared/ai/request-options";

export interface UtteranceSpot {
  messageId: string;
  utteranceAt: number;
}
export interface UtteranceMeaning extends UtteranceSpot {
  meaning: string;
}
export type MeaningRequest = (
  spot: UtteranceSpot,
  storyPlayId: string | undefined,
  meaning?: string,
  signal?: AbortSignal
) => Promise<UtteranceMeaning>;
export const meaningKey = (spot: UtteranceSpot) =>
  `${spot.messageId}:${spot.utteranceAt}`;

export async function requestUtteranceMeaning(
  accessToken: string | undefined,
  episodeId: string,
  spot: UtteranceSpot,
  storyPlayId?: string,
  meaning?: string,
  signal?: AbortSignal
): Promise<UtteranceMeaning> {
  const response = await fetch(aiUrl("/ai/episode/utterance-meanings"), {
    body: JSON.stringify({ episodeId, ...spot, meaning, storyPlayId }),
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    method: "POST",
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Requesting the utterance meaning failed with ${response.status}`
    );
  }
  const result = (await response.json()) as UtteranceMeaning;
  if (
    result.messageId !== spot.messageId ||
    result.utteranceAt !== spot.utteranceAt ||
    typeof result.meaning !== "string" ||
    !result.meaning.trim()
  ) {
    throw new Error("The utterance meaning came back in an unknown shape.");
  }
  return result;
}
