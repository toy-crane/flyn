import type { Database } from "@repo/supabase";
import type { UIMessage } from "ai";

import type { SceneOutcome } from "../../shared/scene-stream";
import { EPISODE_NOTES, type StoryMemory } from "./episode";
import type { EpisodeClient, EpisodeScript, StoryContent } from "./story";

/** 기록 한 줄이 데이터베이스에서 허용되는 길이. */
const MEMORY_LINE_LIMIT = 300;

type EpisodeMessages =
  Database["public"]["Tables"]["episode_runs"]["Row"]["messages"];

function usableNote(text: string | undefined): string | undefined {
  const trimmed = text?.trim();

  if (!trimmed) {
    return;
  }

  return trimmed.slice(0, MEMORY_LINE_LIMIT);
}

/** 끝난 에피소드 한 줄. 제목과 번호는 현재 콘텐츠에서 합친다. */
export interface FinishedEpisodeRow {
  episode_id: string;
  kind: string;
  memory_choice: string | null;
  memory_question: string | null;
  memory_relationship: string | null;
  outcome: string;
}

/** 에피소드 화면과 마무리가 보여 주는 한 화. */
export interface NextEpisodeView {
  episodeId: string;
  number: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

/** 결말 다음에 같은 스트림으로 보내는 예고 또는 스토리 완주 안내. */
export interface NextUpData {
  copy: string;
  episodeId: string | null;
  number: number | null;
  title: string;
}

export interface EpisodeSessionView {
  episode: NextEpisodeView;
  messages: UIMessage[];
  readOnly: boolean;
}

export async function readFinishedEpisodes(
  client: EpisodeClient,
  story: StoryContent
): Promise<FinishedEpisodeRow[]> {
  const ids = story.episodes.map((episode) => episode.id);

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("episode_endings")
    .select(
      "episode_id, kind, outcome, memory_choice, memory_relationship, memory_question"
    )
    .in("episode_id", ids);

  if (error) {
    throw new Error(`Reading story progress failed: ${error.message}`);
  }

  const order = new Map(
    story.episodes.map((episode, index) => [episode.id, index])
  );

  return [...data].sort(
    (left, right) =>
      (order.get(left.episode_id) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.episode_id) ?? Number.MAX_SAFE_INTEGER)
  );
}

export async function recordEpisodeEnding(
  client: EpisodeClient,
  episodeId: string,
  outcome: SceneOutcome
): Promise<void> {
  if (!outcome.ending) {
    return;
  }

  const { notes } = outcome;
  const { data: recorded, error } = await client.rpc("finish_episode", {
    episode_id: episodeId,
    kind: outcome.ending.kind,
    language_level: usableNote(notes[EPISODE_NOTES.level]),
    memory_choice: usableNote(notes[EPISODE_NOTES.choice]),
    memory_question: usableNote(notes[EPISODE_NOTES.question]),
    memory_relationship: usableNote(notes[EPISODE_NOTES.relationship]),
    outcome: outcome.ending.outcome,
  });

  if (error) {
    throw new Error(
      `Recording the ending of episode ${episodeId} failed: ${error.message}`
    );
  }

  if (!recorded) {
    throw new Error(
      `Episode ${episodeId} already has an ending from another request.`
    );
  }
}

function asEpisodeMessages(messages: readonly UIMessage[]): EpisodeMessages {
  return messages as unknown as EpisodeMessages;
}

export async function saveEpisodeRun(
  client: EpisodeClient,
  episodeId: string,
  messages: readonly UIMessage[]
): Promise<void> {
  const { error } = await client.rpc("save_episode_run", {
    episode_id: episodeId,
    messages: asEpisodeMessages(messages),
  });

  if (error) {
    throw new Error(
      `Saving episode ${episodeId} progress failed: ${error.message}`
    );
  }
}

export async function saveEpisodeRunFallback(
  client: EpisodeClient,
  episodeId: string,
  messages: readonly UIMessage[]
): Promise<void> {
  const { error } = await client.rpc("save_episode_run_fallback", {
    episode_id: episodeId,
    messages: asEpisodeMessages(messages),
  });

  if (error) {
    throw new Error(
      `Saving stopped episode ${episodeId} progress failed: ${error.message}`
    );
  }
}

export async function completeEpisodeRun(
  client: EpisodeClient,
  episodeId: string,
  messages: readonly UIMessage[]
): Promise<void> {
  const { error } = await client.rpc("complete_episode_run", {
    episode_id: episodeId,
    messages: asEpisodeMessages(messages),
  });

  if (error) {
    throw new Error(
      `Completing episode ${episodeId} transcript failed: ${error.message}`
    );
  }
}

export async function completeEpisodeRunFallback(
  client: EpisodeClient,
  episodeId: string,
  messages: readonly UIMessage[]
): Promise<void> {
  const { error } = await client.rpc("complete_episode_run_fallback", {
    episode_id: episodeId,
    messages: asEpisodeMessages(messages),
  });

  if (error) {
    throw new Error(
      `Completing stopped episode ${episodeId} transcript failed: ${error.message}`
    );
  }
}

export function storyMemoriesOf(
  finished: readonly FinishedEpisodeRow[],
  story: StoryContent
): StoryMemory[] {
  const content = new Map(
    story.episodes.map((episode) => [episode.id, episode])
  );

  return finished.flatMap((row) => {
    const played = content.get(row.episode_id);

    if (!played) {
      return [];
    }

    return [
      {
        choice: row.memory_choice,
        episode: played.number,
        kind: row.kind,
        outcome: row.outcome,
        question: row.memory_question,
        relationship: row.memory_relationship,
        title: played.title,
      },
    ];
  });
}

export function currentEpisode(
  story: StoryContent,
  finished: readonly FinishedEpisodeRow[]
): EpisodeScript | undefined {
  const done = new Set(finished.map((row) => row.episode_id));

  return story.episodes.find((episode) => !done.has(episode.id));
}

export function nextUpAfter(
  story: StoryContent,
  episodeId: string
): NextUpData {
  const index = story.episodes.findIndex((episode) => episode.id === episodeId);
  const next = index >= 0 ? story.episodes[index + 1] : undefined;

  if (!next) {
    return {
      copy: story.completion.copy,
      episodeId: null,
      number: null,
      title: story.completion.title,
    };
  }

  return {
    copy: next.preview,
    episodeId: next.id,
    number: next.number,
    title: next.title,
  };
}

function nextEpisodeView(episode: EpisodeScript): NextEpisodeView {
  return {
    episodeId: episode.id,
    number: episode.number,
    preview: episode.preview,
    situation: episode.situation,
    situationEmoji: episode.situationEmoji,
    title: episode.title,
  };
}

export async function readEpisodeSession(
  client: EpisodeClient,
  story: StoryContent,
  episodeId: string
): Promise<EpisodeSessionView | undefined> {
  const episode = story.episodes.find(
    (candidate) => candidate.id === episodeId
  );

  if (!episode) {
    return;
  }

  const finished = await readFinishedEpisodes(client, story);
  const ending = finished.find((row) => row.episode_id === episodeId);
  const current = currentEpisode(story, finished);

  if (!ending && current?.id !== episodeId) {
    return;
  }

  const { data: run, error } = await client
    .from("episode_runs")
    .select("messages, completed_at")
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Reading episode ${episodeId} failed: ${error.message}`);
  }

  if (ending && run?.completed_at === null) {
    return;
  }

  if (ending && !run) {
    return;
  }

  return {
    episode: nextEpisodeView(episode),
    messages: (run?.messages ?? []) as unknown as UIMessage[],
    readOnly: Boolean(ending),
  };
}
