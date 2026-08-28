import type {
  EpisodeClient,
  StoryCatalogEntry,
  StoryCatalogEpisode,
} from "./story";

/**
 * 고르는 화면과 잇는 화면이 함께 쓰는 스토리 한 장.
 *
 * 결말의 종류는 여기에 없다. 성공·타협·실패는 서버 안에서만 쓰는 말이라
 * 화면으로 나가는 어떤 모양에도 담기지 않는다. 끝낸 화가 남기는 것은 결과
 * 한 줄뿐이다.
 */
export interface StoryCardView {
  coverEmoji: string;
  coverImagePath: string | null;
  /** 끝낸 화 수. 분절 진행 바가 이만큼 찬다. */
  finished: number;
  hook: string;
  storyId: string;
  title: string;
  total: number;
}

/** 홈의 이어 하기 카드와 진행 중인 스토리 행이 함께 쓰는 모양. */
export interface ContinueCardView extends StoryCardView {
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  preview: string;
  /** 진행하다 만 화면 참. 버튼 문구와 보조 한 줄이 이것으로 갈린다. */
  resuming: boolean;
}

/** 홈이 진행을 잇는 데 필요한 전부. */
export interface HomeView {
  /** 이어 하기 카드. 모든 스토리를 완주했으면 없다. */
  continueCard: ContinueCardView | null;
  /** 아직 아무 화도 열지 않은 계정. 카드 위 제목이 첫 이야기가 된다. */
  firstTime: boolean;
  /** 이어 하기 카드 말고 더 진행 중인 스토리. 최근 것부터. */
  others: ContinueCardView[];
}

/** 스토리 탭의 모든 스토리 목록. */
export interface StoryListView {
  stories: StoryCardView[];
}

/** 상세의 한 화가 놓인 자리. */
export type StoryEpisodeState = "finished" | "locked" | "next";

/** 스토리 상세의 에피소드 목록 한 줄. */
export interface StoryEpisodeView {
  episodeId: string;
  /** 끝낸 화 중 대화 기록이 남은 것만 다시 열 수 있다. */
  hasTranscript: boolean;
  number: number;
  /** 끝낸 화가 얻어낸 결과 한 줄. 아직 끝나지 않았으면 없다. */
  outcome: string | null;
  /** 다음 화의 예고. 아직 열리지 않은 화는 제목만 두고 감춘다. */
  preview: string | null;
  state: StoryEpisodeState;
  title: string;
}

/** 스토리 하나를 펼쳐 보는 화면. */
export interface StoryDetailView extends StoryCardView {
  episodes: StoryEpisodeView[];
  intro: string;
  /** 시작하거나 이어 갈 화. 완주했으면 없다. */
  next: {
    episodeId: string;
    number: number;
    resuming: boolean;
  } | null;
}

interface EndingRecord {
  finishedAt: string;
  outcome: string;
}

interface PlayRecord {
  /** 이 화에 남은 대화가 있다. 다시 열어 읽을 수 있는지의 근거다. */
  hasMessages: boolean;
  /** 이 화를 마지막으로 손댄 시각. */
  touchedAt: string;
}

/** 이 계정이 남긴 진행 전부. 화 id로 찾는다. */
interface AccountProgress {
  endings: Map<string, EndingRecord>;
  plays: Map<string, PlayRecord>;
}

/**
 * 계정의 진행을 한 번에 읽는다.
 *
 * 스토리마다 따로 묻지 않는다. 행 권한이 이미 이 사람의 것만 돌려주므로 화
 * 목록으로 다시 거를 이유가 없고, 스토리가 늘어도 쿼리 수가 늘지 않는다.
 * 대화 본문은 읽지 않는다: 목록에 필요한 것은 그 화를 열었는지와 언제
 * 손댔는지뿐이라, 메시지는 세기만 하고 한 건도 읽지 않는다.
 *
 * 손댄 시각은 결말이 났으면 그 시각이고, 아니면 그 화를 연 시각이다. 마지막
 * 메시지가 앉은 시각이 더 정확하지만, 그것을 얻으려면 이 계정의 메시지 행을
 * 전부 읽어야 한다. 목록의 쓰임은 스토리 사이의 앞뒤를 가리는 것뿐이다.
 */
export async function readAccountProgress(
  client: EpisodeClient
): Promise<AccountProgress> {
  const { data, error } = await client
    .from("episode_plays")
    .select(
      "episode_id, started_at, finished_at, ending_outcome, episode_messages(count)"
    );

  if (error) {
    throw new Error(`Reading story progress failed: ${error.message}`);
  }

  return {
    // 끝난 플레이는 결말 시각과 결과를 함께 갖는다. 테이블 제약이 그것을
    // 보장하지만 생성 타입은 두 열을 nullable로 내놓으므로, 타입을 바꿔치기하는
    // 대신 여기서 걸러 낸다.
    endings: new Map(
      data.flatMap((row) =>
        row.finished_at && row.ending_outcome
          ? ([
              [
                row.episode_id,
                { finishedAt: row.finished_at, outcome: row.ending_outcome },
              ],
            ] as [string, EndingRecord][])
          : []
      )
    ),
    plays: new Map(
      data.map((row) => [
        row.episode_id,
        {
          hasMessages: (row.episode_messages[0]?.count ?? 0) > 0,
          touchedAt: row.finished_at ?? row.started_at,
        },
      ])
    ),
  };
}

interface StoryProgress {
  /** 시작하거나 이어 갈 화. 완주했으면 없다. */
  current: StoryCatalogEpisode | undefined;
  finished: number;
  /** 다음 화의 장면이 이미 열려 있다. 시작이 아니라 이어 하기다. */
  resuming: boolean;
  /** 이 스토리를 마지막으로 손댄 시각. 한 번도 안 열었으면 없다. */
  touchedAt: string | undefined;
}

function storyProgressOf(
  entry: StoryCatalogEntry,
  progress: AccountProgress
): StoryProgress {
  let finished = 0;
  let touchedAt: string | undefined;
  let current: StoryCatalogEpisode | undefined;

  for (const episode of entry.episodes) {
    const ending = progress.endings.get(episode.id);
    const play = progress.plays.get(episode.id);

    if (ending) {
      finished += 1;
    } else {
      current ??= episode;
    }

    const at = play?.touchedAt;

    if (at !== undefined && (touchedAt === undefined || at > touchedAt)) {
      touchedAt = at;
    }
  }

  // 다음 화의 플레이에 이미 장면이 남아 있으면 시작이 아니라 이어 하기다.
  const play = current ? progress.plays.get(current.id) : undefined;

  return {
    current,
    finished,
    resuming: play?.hasMessages === true,
    touchedAt,
  };
}

function storyCardOf(
  entry: StoryCatalogEntry,
  progress: StoryProgress
): StoryCardView {
  return {
    coverEmoji: entry.coverEmoji,
    coverImagePath: entry.coverImagePath,
    finished: progress.finished,
    hook: entry.hook,
    storyId: entry.id,
    title: entry.title,
    total: entry.episodes.length,
  };
}

function continueCardOf(
  entry: StoryCatalogEntry,
  progress: StoryProgress,
  current: StoryCatalogEpisode
): ContinueCardView {
  return {
    ...storyCardOf(entry, progress),
    episodeId: current.id,
    episodeNumber: current.number,
    episodeTitle: current.title,
    preview: current.preview,
    resuming: progress.resuming,
  };
}

/**
 * 홈이 잇는 자리를 만든다.
 *
 * 이어 하기 카드는 손댄 스토리 중 가장 최근 것이다. 아직 아무것도 손대지
 * 않았거나 손댄 스토리를 모두 끝냈다면 남은 스토리 중 순서가 가장 앞선 것을
 * 대신 세운다. 그것마저 없으면 모든 스토리를 완주한 것이고, 홈은 카드 대신
 * 스토리 탭으로 안내한다.
 */
export function homeViewOf(
  catalog: readonly StoryCatalogEntry[],
  progress: AccountProgress
): HomeView {
  const playable = catalog.flatMap((entry) => {
    const storyProgress = storyProgressOf(entry, progress);

    return storyProgress.current
      ? [{ current: storyProgress.current, entry, progress: storyProgress }]
      : [];
  });
  const started = playable
    .filter((story) => story.progress.touchedAt !== undefined)
    .sort((left, right) =>
      (right.progress.touchedAt ?? "").localeCompare(
        left.progress.touchedAt ?? ""
      )
    );
  const untouched = playable.filter(
    (story) => story.progress.touchedAt === undefined
  );
  const [head, ...rest] = started;
  const card = head ?? untouched[0];

  return {
    continueCard: card
      ? continueCardOf(card.entry, card.progress, card.current)
      : null,
    firstTime: progress.plays.size === 0,
    others: head
      ? rest.map((story) =>
          continueCardOf(story.entry, story.progress, story.current)
        )
      : [],
  };
}

/** 스토리 탭이 보여 주는 모든 공식 스토리. 순서는 콘텐츠가 정한다. */
export function storyListViewOf(
  catalog: readonly StoryCatalogEntry[],
  progress: AccountProgress
): StoryListView {
  return {
    stories: catalog.map((entry) =>
      storyCardOf(entry, storyProgressOf(entry, progress))
    ),
  };
}

/**
 * 스토리 하나를 펼친다.
 *
 * 끝낸 화는 결과 한 줄을 달고, 다음 화는 예고를 보여 주며, 그 뒤의 화는
 * 제목만 남긴다. 궁금증은 제목이 만들고 스포일러는 예고에 있다는 판단이다.
 */
export function storyDetailViewOf(
  entry: StoryCatalogEntry,
  progress: AccountProgress
): StoryDetailView {
  const storyProgress = storyProgressOf(entry, progress);
  const { current } = storyProgress;

  return {
    ...storyCardOf(entry, storyProgress),
    episodes: entry.episodes.map((episode) => {
      const ending = progress.endings.get(episode.id);
      const isNext = episode.id === current?.id;

      if (ending) {
        return {
          episodeId: episode.id,
          hasTranscript: progress.plays.get(episode.id)?.hasMessages === true,
          number: episode.number,
          outcome: ending.outcome,
          preview: null,
          state: "finished" as const,
          title: episode.title,
        };
      }

      return {
        episodeId: episode.id,
        hasTranscript: false,
        number: episode.number,
        outcome: null,
        preview: isNext ? episode.preview : null,
        state: isNext ? ("next" as const) : ("locked" as const),
        title: episode.title,
      };
    }),
    intro: entry.intro,
    next: current
      ? {
          episodeId: current.id,
          number: current.number,
          resuming: storyProgress.resuming,
        }
      : null,
  };
}
