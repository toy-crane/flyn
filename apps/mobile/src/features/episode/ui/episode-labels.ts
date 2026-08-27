/**
 * Accessibility names double as the contract for tests and agent-device.
 * The same table lives in the repository README; change both together.
 *
 * 화의 제목, 예고, 상황 줄은 여기에 없다. 각본은 서버가 소유하고 앱은 받은
 * 글을 그대로 보여 준다. 여기 남는 것은 어느 화에서나 같은 말뿐이다.
 */
export const episodeLabels = {
  /** Not shown: the episode header's back button. */
  back: "뒤로 가기",
  /** Shown over the first episode's card on Home, before anything is finished. */
  firstEyebrow: (season: number) => `시즌 ${season}의 첫 이야기`,
  /** Shown as the button that leaves the finished episode. */
  leave: "홈으로 가기",
  /** Shown over the episode that comes next, on Home and at an episode's end. */
  nextEyebrow: "다음 이야기",
  /** Shown in the empty input while the scene is open. A label, so no period. */
  placeholder: "영어로 말해 보세요",
  /** Shown when the season could not be read, as the way to ask again. */
  retry: "다시 시도하기",
  /** Shown as the button that opens an episode, from Home or from an ending. */
  start: (episode: number) => `${episode}화 시작하기`,
  /** Shown wherever an episode is named next to its number. */
  title: (episode: number, title: string) => `${episode}화 · ${title}`,
  /** Shown when the season could not be read. */
  unavailable: "시즌을 불러오지 못했어요.",
} as const;

/** What Home says about the season itself. */
export const seasonLabels = {
  /** Shown as the number of one finished episode in the season's record. */
  episodeNumber: (episode: number) => `${episode}화`,
  /** Shown over the season's record, and over the card that ends it. */
  name: (season: number) => `시즌 ${season}`,
  /** Shown beside the season's name while episodes are left. */
  progress: (finished: number, total: number) =>
    `${total}화 중 ${finished}화 완료`,
  /** Shown beside the season's name once every episode is finished. */
  wholeSeason: (total: number) => `${total}화 모두 완료`,
} as const;
