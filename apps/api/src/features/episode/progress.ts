import type { UIMessage } from "ai";

import type { SceneOutcome } from "../../shared/scene-stream";
import { EPISODE_NOTES, type StoryMemory } from "./episode";
import type { EpisodeClient, EpisodeScript, StoryContent } from "./story";

/** 기록 한 줄이 데이터베이스에서 허용되는 길이. */
const MEMORY_LINE_LIMIT = 300;

/** 대화에 남을 수 있는 두 역할. 데이터베이스도 이 둘만 받는다. */
const STORED_ROLES = new Set(["assistant", "user"]);

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
  /**
   * 이 화가 어떻게 끝났는지. 진행 중이면 없다.
   *
   * 저장된 대화에는 결말 part가 들어 있지 않다. 결말은 플레이 기록이 소유하는
   * 사실이고, 그 사실이 확정되는 순간 그 플레이의 대화는 더 이상 바뀌지 않기
   * 때문이다. 다시 연 화면은 흐르던 part 대신 이 값을 읽어 마무리를 그린다.
   */
  ending: { kind: string; outcome: string } | undefined;
  episode: NextEpisodeView;
  messages: UIMessage[];
  /** 결말 다음에 보여 줄 예고. 같은 이유로 대화가 아니라 여기 실려 온다. */
  nextUp: NextUpData | undefined;
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
    .from("episode_plays")
    .select(
      "episode_id, ending_kind, ending_outcome, memory_choice, memory_relationship, memory_question"
    )
    .not("finished_at", "is", null)
    .in("episode_id", ids);

  if (error) {
    throw new Error(`Reading story progress failed: ${error.message}`);
  }

  const order = new Map(
    story.episodes.map((episode, index) => [episode.id, index])
  );

  // 끝난 플레이는 결말 종류와 결과를 함께 갖는다. 테이블 제약이 그것을 보장하지만
  // 생성 타입은 두 열을 nullable로 내놓으므로, 타입을 바꿔치기하는 대신 여기서
  // 걸러 낸다.
  return data
    .flatMap((row) =>
      row.ending_kind && row.ending_outcome
        ? [
            {
              episode_id: row.episode_id,
              kind: row.ending_kind,
              memory_choice: row.memory_choice,
              memory_question: row.memory_question,
              memory_relationship: row.memory_relationship,
              outcome: row.ending_outcome,
            },
          ]
        : []
    )
    .sort(
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

/** 대화 한 자락과 그 마지막 자리. 새 메시지는 그 다음 자리에 붙는다. */
export interface EpisodePlay {
  /** 지금까지 남은 대화, 자리 순서대로. */
  messages: UIMessage[];
  /** 다음 메시지가 앉을 자리. */
  nextPosition: number;
  /** 메시지와 교정이 매달리는 플레이의 id. */
  playId: string;
}

/**
 * 이 계정의 이 화 플레이를 연다. 이미 열려 있으면 그 플레이를 그대로 쓴다.
 *
 * 먼저 찾아보고 없을 때만 만든다. 두 요청이 겹쳐 둘 다 만들려 하면 유니크 제약이
 * 뒤에 온 쪽을 거절하므로, 그때는 앞선 요청이 만든 행을 다시 읽는다.
 */
async function openPlay(
  client: EpisodeClient,
  episodeId: string
): Promise<string> {
  const found = await client
    .from("episode_plays")
    .select("id")
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (found.error) {
    throw new Error(
      `Reading the play of episode ${episodeId} failed: ${found.error.message}`
    );
  }

  if (found.data) {
    return found.data.id;
  }

  const opened = await client
    .from("episode_plays")
    .insert({ episode_id: episodeId })
    .select("id")
    .maybeSingle();

  if (opened.data) {
    return opened.data.id;
  }

  const raced = await client
    .from("episode_plays")
    .select("id")
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (raced.data) {
    return raced.data.id;
  }

  throw new Error(
    `Opening episode ${episodeId} failed: ${opened.error?.message ?? "no row"}`
  );
}

/** 한 플레이의 대화를 자리 순서대로 읽는다. */
async function readPlayMessages(
  client: EpisodeClient,
  playId: string
): Promise<UIMessage[]> {
  const { data, error } = await client
    .from("episode_messages")
    .select("id, role, parts")
    .eq("play_id", playId)
    .order("position");

  if (error) {
    throw new Error(`Reading episode messages failed: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    parts: row.parts,
    role: row.role,
  })) as UIMessage[];
}

/**
 * 플레이를 열고 남아 있는 대화를 읽는다.
 *
 * `keepThrough`는 앱이 "여기까지는 그대로다"라고 말하는 메시지다. 그 뒤에 남아
 * 있는 행은 사용자가 다시 받기나 수정으로 버린 것이므로 지운다. `null`이면 이
 * 화를 처음부터 다시 여는 것이고, `undefined`면 자를 것이 없다는 뜻이다.
 *
 * 앱이 보낸 지난 장면은 읽지 않는다. 기록은 서버가 가진 것이 전부이므로, 앱이
 * 고쳐 보낸 옛 장면이 기록으로 들어올 자리가 없다.
 *
 * 앱이 모르는 메시지를 기준으로 대면 자를 곳을 찾지 못한다. 그때는 아무것도
 * 지우지 않고 서버가 가진 그대로 이어 간다. 앱이 뒤처진 것이지 기록이 틀린 것이
 * 아니다.
 */
export async function openEpisodePlay(
  client: EpisodeClient,
  episodeId: string,
  keepThrough?: string | null
): Promise<EpisodePlay> {
  const playId = await openPlay(client, episodeId);
  const stored = await readPlayMessages(client, playId);
  const kept = keptThrough(stored, keepThrough);

  if (kept.length < stored.length) {
    const { error } = await client
      .from("episode_messages")
      .delete()
      .eq("play_id", playId)
      .gte("position", kept.length);

    if (error) {
      throw new Error(
        `Dropping replaced messages of episode ${episodeId} failed: ${error.message}`
      );
    }
  }

  return { messages: kept, nextPosition: kept.length, playId };
}

function keptThrough(
  stored: readonly UIMessage[],
  keepThrough: string | null | undefined
): UIMessage[] {
  if (keepThrough === undefined) {
    return [...stored];
  }

  if (keepThrough === null) {
    return [];
  }

  const at = stored.findIndex((message) => message.id === keepThrough);

  return at === -1 ? [...stored] : stored.slice(0, at + 1);
}

/**
 * 대화 끝에 메시지를 붙인다.
 *
 * `system` 역할은 데이터베이스가 받지 않는다. 에피소드 대화에는 그런 메시지가
 * 오지 않지만, 타입이 그 가능성을 열어 두므로 여기서 걸러 낸다.
 *
 * 빈 메시지도 남기지 않는다. 사용자가 첫 글자가 오기 전에 화면을 나가면 모델
 * 호출이 함께 끊겨 아무 part도 만들어지지 않는데, 그것을 저장하면 다시 열었을 때
 * 빈 말풍선이 남는다. 아무것도 만들지 못한 턴은 없던 턴이다.
 */
export async function appendEpisodeMessages(
  client: EpisodeClient,
  play: EpisodePlay,
  messages: readonly UIMessage[]
): Promise<void> {
  const rows = messages
    .filter(
      (message) => STORED_ROLES.has(message.role) && message.parts.length > 0
    )
    .map((message, index) => ({
      id: message.id,
      parts: message.parts,
      play_id: play.playId,
      position: play.nextPosition + index,
      role: message.role,
    }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from("episode_messages").insert(rows);

  if (error) {
    throw new Error(`Saving episode messages failed: ${error.message}`);
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

  const play = await client
    .from("episode_plays")
    .select("id")
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (play.error) {
    throw new Error(
      `Reading episode ${episodeId} failed: ${play.error.message}`
    );
  }

  const messages = play.data
    ? await readPlayMessages(client, play.data.id)
    : [];

  // 결말은 났는데 남은 장면이 없으면 다시 열 것이 없다. 장면을 저장하기 전에
  // 결말이 먼저 확정된 화가 여기 해당한다.
  if (ending && messages.length === 0) {
    return;
  }

  return {
    ending: ending ? { kind: ending.kind, outcome: ending.outcome } : undefined,
    episode: nextEpisodeView(episode),
    messages,
    nextUp: ending ? nextUpAfter(story, episodeId) : undefined,
    readOnly: Boolean(ending),
  };
}
