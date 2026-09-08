import type { EpisodeClient, StoryCatalogEntry } from "./story";

/**
 * 회차 하나가 데이터베이스에 남긴 것. 화면이 카드를 그리는 데 필요한 전부다.
 *
 * 대화 본문은 읽지 않는다. 카드는 어느 화를 끝냈고 무엇을 얻어냈는지까지만
 * 보여 주고, 그 화의 대화는 사용자가 펼칠 때 따로 읽는다.
 */
interface RunRow {
  id: string;
  plays: {
    episode_id: string;
    ending_outcome: string | null;
    finished_at: string | null;
    messages: number;
  }[];
  started_at: string;
}

/** 회차 카드가 펼쳐 보여 주는 끝낸 화 한 줄. */
export interface StoryRunEpisodeView {
  episodeId: string;
  /**
   * 다시 열어 읽을 대화가 남아 있다.
   *
   * 장면을 저장하기 전에 결말이 먼저 확정된 화는 결말만 남고 대화가 없다. 그런
   * 화를 카드에서 누를 수 있게 두면 빈 화면이 열린다.
   */
  hasTranscript: boolean;
  number: number;
  /** 그 화가 얻어낸 결과 한 줄. 이야기 기억의 "사건의 결과"를 그대로 쓴다. */
  outcome: string;
  title: string;
}

/** 대화 기록의 회차 카드 하나. */
export interface StoryRunView {
  /** 이 회차에서 끝낸 화. 카드를 펼치면 이 목록이 보인다. */
  episodes: StoryRunEpisodeView[];
  /** 끝낸 화 수. 분절 진행 바가 이만큼 찬다. */
  finished: number;
  /** 이어갈 화. 이 회차를 완주했으면 없다. */
  next: {
    episodeId: string;
    number: number;
    title: string;
  } | null;
  runId: string;
  /** 카드 제목이 되는 시작 날짜와 시간. 이어하기로 바뀌지 않는다. */
  startedAt: string;
}

/** 대화 기록 화면 한 장. 위의 스토리 소개와 아래의 회차 카드. */
export interface StoryRunsView {
  coverEmoji: string;
  coverImagePath: string | null;
  intro: string;
  runs: StoryRunView[];
  storyId: string;
  title: string;
  /** 스토리의 화 수. 진행 바를 이만큼 나눈다. */
  total: number;
}

/** 스토리 탭의 최근 대화 한 줄. 진행 바는 두지 않는다. */
export interface RecentStoryView {
  coverEmoji: string;
  coverImagePath: string | null;
  hook: string;
  storyId: string;
  title: string;
}

/** 스토리 탭이 보여 주는 목록 전체. */
export interface RecentStoriesView {
  stories: RecentStoryView[];
}

/**
 * 새 회차를 연다.
 *
 * 부르는 자리는 하나다. 1화에서 사용자가 처음 말하는 요청이 이 함수를 부른다.
 * 첫 장면만 열고 나온 진입은 여기 닿지 않으므로 빈 회차가 생기지 않고, 두 기기가
 * 동시에 처음 말하면 회차도 둘로 갈린다. 서로 다른 대화를 한 회차로 합치면 그
 * 회차의 이야기 기억이 두 흐름을 섞어 읽는다.
 *
 * `user_id`는 싣지 않는다. 데이터베이스의 기본값이 채우고, 열 권한이 그 열을
 * 막는다.
 */
export async function startStoryRun(
  client: EpisodeClient,
  storyId: string
): Promise<string> {
  const { data, error } = await client
    .from("story_runs")
    .insert({ story_id: storyId })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Starting a run of story ${storyId} failed: ${error.message}`
    );
  }

  return data.id;
}

async function readRunRows(
  client: EpisodeClient,
  storyId: string
): Promise<RunRow[]> {
  // 사용자가 한 번도 말하지 않은 회차는 기록이 아니다. 첫 장면만 보고 나온
  // 진입은 애초에 회차를 만들지 않지만, 첫 메시지를 남기지 못한 채 만들어진
  // 회차가 빈 카드로 보이지 않게 여기서도 거른다.
  const { data, error } = await client
    .from("story_runs")
    .select(
      "id, started_at, episode_plays(episode_id, finished_at, ending_outcome, episode_messages(count))"
    )
    .eq("story_id", storyId)
    .not("last_user_message_at", "is", null)
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(
      `Reading runs of story ${storyId} failed: ${error.message}`
    );
  }

  // 대화 본문은 세기만 하고 한 건도 읽지 않는다. 카드가 알아야 하는 것은 그 화에
  // 다시 열 대화가 남았는지뿐이다.
  return data.map((run) => ({
    id: run.id,
    plays: run.episode_plays.map((play) => ({
      ending_outcome: play.ending_outcome,
      episode_id: play.episode_id,
      finished_at: play.finished_at,
      messages: play.episode_messages[0]?.count ?? 0,
    })),
    started_at: run.started_at,
  }));
}

function runViewOf(run: RunRow, entry: StoryCatalogEntry): StoryRunView {
  const endings = new Map(
    run.plays.flatMap((play) =>
      play.finished_at && play.ending_outcome
        ? [
            [
              play.episode_id,
              { messages: play.messages, outcome: play.ending_outcome },
            ] as [string, { messages: number; outcome: string }],
          ]
        : []
    )
  );
  const episodes: StoryRunEpisodeView[] = [];
  let next: StoryRunView["next"] = null;

  for (const episode of entry.episodes) {
    const ending = endings.get(episode.id);

    if (ending === undefined) {
      next ??= {
        episodeId: episode.id,
        number: episode.number,
        title: episode.title,
      };
      continue;
    }

    episodes.push({
      episodeId: episode.id,
      hasTranscript: ending.messages > 0,
      number: episode.number,
      outcome: ending.outcome,
      title: episode.title,
    });
  }

  return {
    episodes,
    finished: episodes.length,
    next,
    runId: run.id,
    startedAt: run.started_at,
  };
}

/**
 * 스토리 하나의 대화 기록을 읽는다.
 *
 * 회차는 시작한 순서의 역순으로 온다. 어느 하나를 대표로 세우지 않는다. 여러
 * 미완료 회차를 각각 이어갈 수 있으므로 화면이 고를 일이 아니라 사용자가 고를
 * 일이다.
 */
export async function readStoryRuns(
  client: EpisodeClient,
  entry: StoryCatalogEntry
): Promise<StoryRunsView> {
  const runs = await readRunRows(client, entry.id);

  return {
    coverEmoji: entry.coverEmoji,
    coverImagePath: entry.coverImagePath,
    intro: entry.intro,
    runs: runs.map((run) => runViewOf(run, entry)),
    storyId: entry.id,
    title: entry.title,
    total: entry.episodes.length,
  };
}

/**
 * 대화한 스토리를 최근순으로 읽는다.
 *
 * 순서를 정하는 것은 회차마다 트리거가 미는 마지막 사용자 메시지 시각이다. 기록을
 * 열어 보거나 첫 장면만 열어 보는 것으로는 그 값이 움직이지 않으므로, 조회가
 * 순서를 바꿀 수 있는 길이 없다.
 *
 * 한 스토리를 여러 번 진행했으면 그중 가장 최근 회차가 그 스토리의 자리를
 * 정한다. 목록에는 스토리가 하나씩만 선다.
 */
export async function readRecentStories(
  client: EpisodeClient,
  catalog: readonly StoryCatalogEntry[]
): Promise<RecentStoriesView> {
  const { data, error } = await client
    .from("story_runs")
    .select("story_id, last_user_message_at")
    .not("last_user_message_at", "is", null)
    .order("last_user_message_at", { ascending: false });

  if (error) {
    throw new Error(`Reading recent stories failed: ${error.message}`);
  }

  const known = new Map(catalog.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  const stories: RecentStoryView[] = [];

  for (const row of data) {
    const entry = known.get(row.story_id);

    if (!entry || seen.has(row.story_id)) {
      continue;
    }

    seen.add(row.story_id);
    stories.push({
      coverEmoji: entry.coverEmoji,
      coverImagePath: entry.coverImagePath,
      hook: entry.hook,
      storyId: entry.id,
      title: entry.title,
    });
  }

  return { stories };
}
