import { aiUrl } from "@/shared/ai/request-options";

export const SEASON_API_PATH = "/ai/episode/season";

/** A finished episode, as the season list shows it. */
export interface FinishedEpisode {
  episode: number;
  /** 성공, 타협 or 실패. */
  kind: string;
  outcome: string;
  title: string;
}

/** The episode this account opens next. */
export interface NextEpisode {
  episode: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

/**
 * How far this account is into the season, and what the screens say about it.
 *
 * The scripts belong to the server, so the app holds no episode titles of its
 * own. Reading progress separately and joining it here would let Home draw a
 * moment where the two answers disagree.
 */
export interface Season {
  completion: { copy: string; title: string };
  finished: FinishedEpisode[];
  /** Null once every episode is finished. */
  next: NextEpisode | null;
  season: number;
  total: number;
}

export async function readSeason(accessToken: string): Promise<Season> {
  const response = await fetch(aiUrl(SEASON_API_PATH), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Reading the season failed with ${response.status}`);
  }

  return (await response.json()) as Season;
}
