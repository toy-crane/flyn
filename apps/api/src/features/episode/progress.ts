import type { UIMessage } from "ai";

import type { SceneOutcome } from "../../shared/scene-stream";
import type { EpisodeCorrection } from "./correction";
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
   * 이 대화에 붙은 배울 표현. 저장된 대화에 교정 part가 없으므로 여기 실려 온다.
   *
   * 화면을 나갔다 와도 붙어 있던 배울 표현이 같은 메시지 곁으로 돌아온다.
   */
  corrections: EpisodeCorrection[];
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

/**
 * 대화 한 자락.
 *
 * 자리 번호는 여기 없다. 새 메시지가 어디 앉을지는 데이터베이스가 채우는 시각이
 * 정하므로, 서버가 세다가 어긋날 자리가 없다.
 */
export interface EpisodePlay {
  /** 지금까지 남은 대화, 자리 순서대로. */
  messages: UIMessage[];
  /** 메시지와 교정이 매달리는 플레이의 id. */
  playId: string;
}

/** 저장된 메시지 한 행. 자리는 이 시각이 정한다. */
interface StoredMessage {
  createdAt: string;
  message: UIMessage;
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

/** 한 플레이의 대화를 자리 순서대로, 자리를 정하는 시각과 함께 읽는다. */
async function readStoredMessages(
  client: EpisodeClient,
  playId: string
): Promise<StoredMessage[]> {
  const { data, error } = await client
    .from("episode_messages")
    .select("id, role, parts, created_at")
    .eq("play_id", playId)
    .order("created_at");

  if (error) {
    throw new Error(`Reading episode messages failed: ${error.message}`);
  }

  return data.map((row) => ({
    createdAt: row.created_at,
    message: { id: row.id, parts: row.parts, role: row.role } as UIMessage,
  }));
}

/** 한 플레이의 대화. 자리 번호가 필요 없는 읽기 경로가 쓴다. */
async function readPlayMessages(
  client: EpisodeClient,
  playId: string
): Promise<UIMessage[]> {
  const stored = await readStoredMessages(client, playId);

  return stored.map((row) => row.message);
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
  const stored = await readStoredMessages(client, playId);
  const kept = keptThrough(stored, keepThrough);

  if (kept.length < stored.length) {
    // 남길 마지막 행보다 뒤에 앉은 것을 지운다. 남길 것이 없으면 그 자리가
    // 시각의 시작점이 되어 이 플레이의 메시지가 전부 지워진다.
    const lastKept = kept.at(-1)?.createdAt ?? new Date(0).toISOString();
    const { error } = await client
      .from("episode_messages")
      .delete()
      .eq("play_id", playId)
      .gt("created_at", lastKept);

    if (error) {
      throw new Error(
        `Dropping replaced messages of episode ${episodeId} failed: ${error.message}`
      );
    }
  }

  return { messages: kept.map((row) => row.message), playId };
}

function keptThrough(
  stored: readonly StoredMessage[],
  keepThrough: string | null | undefined
): StoredMessage[] {
  if (keepThrough === undefined) {
    return [...stored];
  }

  if (keepThrough === null) {
    return [];
  }

  const at = stored.findIndex((row) => row.message.id === keepThrough);

  return at === -1 ? [...stored] : stored.slice(0, at + 1);
}

/**
 * 대화 끝에 메시지 하나를 붙인다.
 *
 * 어느 자리에 앉는지는 넣지 않는다. 데이터베이스가 그 순간의 시각을 채우고, 읽는
 * 쪽이 그 시각으로 정렬한다.
 *
 * `system` 역할은 데이터베이스가 받지 않는다. 에피소드 대화에는 그런 메시지가
 * 오지 않지만, 타입이 그 가능성을 열어 두므로 여기서 걸러 낸다.
 *
 * 빈 메시지도 남기지 않는다. 사용자가 첫 글자가 오기 전에 화면을 나가면 모델
 * 호출이 함께 끊겨 아무 part도 만들어지지 않는데, 그것을 저장하면 다시 열었을 때
 * 빈 말풍선이 남는다. 아무것도 만들지 못한 턴은 없던 턴이다.
 */
export async function appendEpisodeMessage(
  client: EpisodeClient,
  play: EpisodePlay,
  message: UIMessage
): Promise<void> {
  if (!(STORED_ROLES.has(message.role) && message.parts.length > 0)) {
    return;
  }

  const { error } = await client.from("episode_messages").insert({
    id: message.id,
    parts: message.parts,
    play_id: play.playId,
    role: message.role,
  });

  if (error) {
    throw new Error(`Saving episode messages failed: ${error.message}`);
  }
}

/**
 * 배울 표현을 그것이 붙은 사용자 메시지에 매단다.
 *
 * 항목 하나가 행 하나다. 고친 문장은 메시지마다 하나뿐이라 행마다 같은 값이
 * 들어가는데, 그 문장이 한 줄로 접힌 배울 표현이 보여 주는 것이고 다시 보내기가
 * 입력창에 담는 것이기도 하다. 항목별로 다시 합칠 필요 없이 행 하나만 읽어도
 * 화면을 그릴 수 있다.
 *
 * 결말이 난 뒤에도 들어간다. 결말이 얼리는 것은 대화이고, 마지막 턴의 배울
 * 표현을 경주에서 졌다는 이유로 버리지 않는다.
 */
export async function appendEpisodeCorrection(
  client: EpisodeClient,
  correction: EpisodeCorrection
): Promise<void> {
  if (correction.entries.length === 0) {
    return;
  }

  const { error } = await client.from("episode_corrections").insert(
    correction.entries.map((entry) => ({
      corrected: correction.fixed,
      fixed: entry.fixed,
      message_id: correction.messageId,
      original: entry.original,
      pattern: entry.pattern,
      reason: entry.why,
    }))
  );

  if (error) {
    throw new Error(`Saving episode corrections failed: ${error.message}`);
  }
}

/** 교정 한 행. 화면이 배울 표현을 그리는 데 필요한 전부다. */
interface CorrectionRow {
  corrected: string;
  fixed: string;
  message_id: string;
  original: string;
  pattern: string;
  reason: string;
}

async function readCorrectionRows(
  client: EpisodeClient,
  playId: string
): Promise<CorrectionRow[]> {
  // 교정은 플레이를 직접 참조하지 않고 메시지에 매달린다. `!inner`가 그 메시지를
  // 함께 걸어 이 플레이의 것만 남긴다.
  const { data, error } = await client
    .from("episode_corrections")
    .select(
      "message_id, original, fixed, corrected, pattern, reason, created_at, episode_messages!inner(play_id)"
    )
    .eq("episode_messages.play_id", playId)
    .order("created_at");

  if (error) {
    throw new Error(`Reading episode corrections failed: ${error.message}`);
  }

  return data.map((row) => ({
    corrected: row.corrected,
    fixed: row.fixed,
    message_id: row.message_id,
    original: row.original,
    pattern: row.pattern,
    reason: row.reason,
  }));
}

/**
 * 이 플레이에서 이미 알려 준 규칙.
 *
 * 판정자는 이 목록에 있는 규칙으로 새 항목을 만들지 않는다. 교정이 행으로 남으니
 * 서버가 자기 기록에서 읽으면 되고, 앱이 목록을 나르지 않아도 된다. 앱을 껐다 켜도
 * 같은 규칙이 다시 붙지 않는 것이 그 차이다.
 */
export async function readSeenPatterns(
  client: EpisodeClient,
  playId: string
): Promise<string[]> {
  const rows = await readCorrectionRows(client, playId);

  return [...new Set(rows.map((row) => row.pattern))];
}

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * 저장된 교정을 화면이 받는 모양으로 되돌린다. 메시지 하나에 하나씩.
 *
 * 사용자가 쓴 원문은 행에 없다. 그 메시지가 이미 들고 있어 중복이라, 여기서
 * 대화를 보고 채운다. 물어보기 시트의 출처가 그 문장을 쓴다.
 */
export async function readPlayCorrections(
  client: EpisodeClient,
  playId: string,
  messages: readonly UIMessage[]
): Promise<EpisodeCorrection[]> {
  const rows = await readCorrectionRows(client, playId);
  const written = new Map(messages.map((message) => [message.id, message]));
  const byMessage = new Map<string, EpisodeCorrection>();

  for (const row of rows) {
    const entry = {
      fixed: row.fixed,
      original: row.original,
      pattern: row.pattern,
      why: row.reason,
    };
    const found = byMessage.get(row.message_id);

    if (found) {
      found.entries.push(entry);
      continue;
    }

    const asked = written.get(row.message_id);

    byMessage.set(row.message_id, {
      entries: [entry],
      fixed: row.corrected,
      messageId: row.message_id,
      original: asked ? textOf(asked) : "",
    });
  }

  return [...byMessage.values()];
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

  const corrections = play.data
    ? await readPlayCorrections(client, play.data.id, messages)
    : [];

  return {
    corrections,
    ending: ending ? { kind: ending.kind, outcome: ending.outcome } : undefined,
    episode: nextEpisodeView(episode),
    messages,
    nextUp: ending ? nextUpAfter(story, episodeId) : undefined,
    readOnly: Boolean(ending),
  };
}
