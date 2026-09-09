import type { StoryCatalogEntry } from "./story";

/**
 * 탐색이 보여 주는 스토리 한 장.
 *
 * 진행이 없다. 탐색은 무엇을 플레이할지 고르는 곳이고, 진행과 결과는 대화 기록이
 * 보여 준다. 여러 회차를 각각 이어갈 수 있으므로 목록에 세울 대표 진행이라는
 * 것이 아예 없다.
 */
export interface StoryCardView {
  coverEmoji: string;
  coverImagePath: string | null;
  hook: string;
  storyId: string;
  title: string;
  /** 스토리의 화 수. */
  total: number;
}

/** 탐색 탭의 모든 스토리. */
export interface StoryListView {
  stories: StoryCardView[];
}

/**
 * 스토리 상세의 에피소드 목록 한 줄.
 *
 * 모든 화가 같은 모양이다. 회차마다 다른 진행 상태, 잠금 표시와 결과 문구는 여기
 * 없다. 상세는 콘텐츠 소개이므로 어느 회차로 보든 같은 목록이어야 한다.
 */
export interface StoryEpisodeView {
  episodeId: string;
  number: number;
  /** 결말을 드러내지 않는 상황 설명. 모든 화가 공개한다. */
  situation: string;
  /**
   * 상황 줄이 앞에 두는 그림 문자.
   *
   * 상세는 쓰지 않는다. 새 회차의 1화는 아직 회차가 없어 저장된 대화를 읽을 수
   * 없으므로, 그 화면이 상황 줄을 그리는 데 필요한 값을 상세에서 가져간다.
   */
  situationEmoji: string;
  title: string;
}

/** 스토리 하나를 펼쳐 보는 화면. */
export interface StoryDetailView extends StoryCardView {
  episodes: StoryEpisodeView[];
  intro: string;
}

function storyCardOf(entry: StoryCatalogEntry): StoryCardView {
  return {
    coverEmoji: entry.coverEmoji,
    coverImagePath: entry.coverImagePath,
    hook: entry.hook,
    storyId: entry.id,
    title: entry.title,
    total: entry.episodes.length,
  };
}

/** 탐색 탭이 보여 주는 모든 공식 스토리. 순서는 콘텐츠가 정한다. */
export function storyListViewOf(
  catalog: readonly StoryCatalogEntry[]
): StoryListView {
  return { stories: catalog.map(storyCardOf) };
}

/**
 * 스토리 하나를 펼친다.
 *
 * 모든 화의 제목과 상황 설명을 공개한다. 무엇을 플레이할지 판단할 수 있어야 하고,
 * 결말은 상황 설명에 들어 있지 않다.
 */
export function storyDetailViewOf(entry: StoryCatalogEntry): StoryDetailView {
  return {
    ...storyCardOf(entry),
    episodes: entry.episodes.map((episode) => ({
      episodeId: episode.id,
      number: episode.number,
      situation: episode.situation,
      situationEmoji: episode.situationEmoji,
      title: episode.title,
    })),
    intro: entry.intro,
  };
}
