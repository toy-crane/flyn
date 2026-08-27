import type { Database } from "@repo/supabase";
import type { SupabaseContext } from "@supabase/server";

import type { SceneEndingData } from "../../shared/scene-stream";
import { episodeScript, SEASON_COMPLETION, SEASON_LENGTH } from "./season";

/** 로그인한 사람의 권한으로 데이터베이스에 닿는 클라이언트. */
export type EpisodeClient = SupabaseContext<Database>["supabase"];

/**
 * 지금 방영 중인 시즌.
 *
 * 시즌은 아직 하나뿐이지만 번호를 상수로 둔다. 이야기 기억이 이어지는 단위가
 * 시즌이라, 다음 시즌이 생기면 같은 화 번호가 두 번 나온다.
 */
export const CURRENT_SEASON = 1;

/** 홈의 끝낸 화 목록에 한 줄로 들어가는 화. */
export interface FinishedEpisodeView {
  episode: number;
  kind: string;
  outcome: string;
  title: string;
}

/** 홈의 다음 이야기 카드가 읽는 화. */
export interface NextEpisodeView {
  episode: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

/** 마무리 화면이 결말 다음에 보여 주는 것. */
export interface NextUpData {
  copy: string;
  /** 다음 화의 번호. 시즌이 끝났으면 없다. */
  episode: number | null;
  title: string;
}

/** 홈이 시즌을 그리는 데 필요한 전부. */
export interface SeasonView {
  completion: { copy: string; title: string };
  finished: FinishedEpisodeView[];
  /** 다음에 열 화. 시즌을 다 끝냈으면 없다. */
  next: NextEpisodeView | null;
  season: number;
  total: number;
}

/**
 * 이 계정이 이 시즌에서 끝낸 화. 순서대로 온다.
 *
 * RLS가 남의 행을 걸러 내므로 조건에 사용자를 적지 않는다. 조건을 적으면
 * 접근 규칙이 이 파일에도 반쯤 옮겨 와, 규칙이 바뀔 때 두 곳이 어긋난다.
 */
export async function readFinishedEpisodes(
  client: EpisodeClient,
  season: number
): Promise<{ episode: number; kind: string; outcome: string }[]> {
  const { data, error } = await client
    .from("episode_endings")
    .select("episode, kind, outcome")
    .eq("season", season)
    .order("episode");

  if (error) {
    throw new Error(
      `Reading season ${season} progress failed: ${error.message}`
    );
  }

  return data;
}

/**
 * 끝난 화를 계정에 남긴다.
 *
 * 앱이 아니라 서버가 남기므로 마무리 화면을 보지 않고 앱을 꺼도 그 화는 끝난
 * 것으로 남는다. 화를 건너뛰거나 이미 난 결말을 덮어쓰는 판단은 데이터베이스
 * 함수가 소유한다.
 */
export async function recordEpisodeEnding(
  client: EpisodeClient,
  season: number,
  episode: number,
  ending: SceneEndingData
): Promise<void> {
  const { error } = await client.rpc("finish_episode", {
    episode,
    kind: ending.kind,
    outcome: ending.outcome,
    season,
  });

  if (error) {
    throw new Error(
      `Recording the ending of episode ${episode} failed: ${error.message}`
    );
  }
}

/**
 * 지금 열 수 있는 화의 번호. 다 끝냈으면 시즌의 길이보다 하나 크다.
 *
 * 개수가 아니라 마지막으로 끝낸 화를 기준으로 센다. 데이터베이스가 쓰는 기준과
 * 같아야 서버가 여는 화와 기록이 어긋나지 않는다.
 */
export function currentEpisodeNumber(
  finished: readonly { episode: number }[]
): number {
  return finished.reduce((last, row) => Math.max(last, row.episode), 0) + 1;
}

/**
 * 한 화가 끝난 자리에서 다음에 오는 것.
 *
 * 마지막 화면 뒤에는 다음 화 대신 완주 안내가 온다. 예고와 완주 안내가 같은
 * 자리를 쓰므로 화면도 한 벌로 그린다.
 */
export function nextUpAfter(episode: number): NextUpData {
  const next = episodeScript(episode + 1);

  if (!next) {
    return {
      copy: SEASON_COMPLETION.copy,
      episode: null,
      title: SEASON_COMPLETION.title,
    };
  }

  return { copy: next.preview, episode: next.number, title: next.title };
}

/** 홈이 읽는 시즌 상태. 각본과 이 계정의 진행을 합친다. */
export async function readSeasonView(
  client: EpisodeClient
): Promise<SeasonView> {
  const finished = await readFinishedEpisodes(client, CURRENT_SEASON);
  const next = episodeScript(currentEpisodeNumber(finished));

  return {
    completion: { ...SEASON_COMPLETION },
    finished: finished.map((row) => {
      const played = episodeScript(row.episode);

      return {
        episode: row.episode,
        kind: row.kind,
        outcome: row.outcome,
        // 각본이 없어진 화는 제목 없이 번호만 남는다. 지난 기록을 그대로 둔 채
        // 각본을 손볼 때 홈이 통째로 비지 않게 한다.
        title: played ? played.title : "",
      };
    }),
    next: next
      ? {
          episode: next.number,
          preview: next.preview,
          situation: next.situation,
          situationEmoji: next.situationEmoji,
          title: next.title,
        }
      : null,
    season: CURRENT_SEASON,
    total: SEASON_LENGTH,
  };
}
