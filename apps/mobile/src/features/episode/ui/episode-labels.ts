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
  /** Shown after reading one episode's saved conversation takes one second. */
  conversationLoading: "대화를 불러오고 있어요",
  /** Shown when one episode's saved conversation could not be read. */
  conversationUnavailable: "대화를 불러오지 못했어요.",
  /** Shown on the divider that closes a finished conversation. */
  endMark: "끝",
  /**
   * Shown as the button that leaves the finished episode.
   *
   * 왔던 화면으로 돌아간다. 에피소드로 들어오는 길은 스토리 상세와 대화 기록
   * 둘이고 홈에는 없으므로, 어느 쪽에서 왔는지 이름으로 특정하지 않는다.
   */
  leave: "돌아가기",
  /** Shown over the episode that comes next, on Home and at an episode's end. */
  nextEyebrow: "다음 이야기",
  /** 에피소드에서 두 언어를 모두 입력할 수 있음을 알린다. */
  placeholder: "영어나 한국어로 적어 주세요.",
  /** Shown when the story could not be read, as the way to ask again. */
  retry: "다시 시도하기",
  /** Read while the scene left by Stop is being matched with the server. */
  saving: "진행을 저장하고 있어요",
  /** Shown as the button that opens the next episode from an ending. */
  start: (episode: number) => `${episode}화 시작하기`,
  /** Shown wherever an episode is named next to its number. */
  title: (episode: number, title: string) => `${episode}화 · ${title}`,
  /** Shown when the story could not be read. */
  unavailable: "이야기를 불러오지 못했어요.",
} as const;

/**
 * 에피소드의 영어 교정과 한국어 입력 안내, 표현 확인 상태가 쓰는 말.
 */
export const correctionLabels = {
  /** Shown as the button that opens the Korean question sheet. */
  ask: "AI에게 물어보기",
  /** Not shown: the sheet's close button. */
  askClose: "AI에게 물어보기 닫기",
  /** Shown in the sheet's empty input. A label, so no period. */
  askPlaceholder: "궁금한 것을 한국어로 물어보세요",
  /** Shown as the sheet's title. */
  askTitle: "AI에게 물어보기",
  checking: "표현을 확인하고 있어요.",
  failed: "표현을 확인하지 못했어요.",
  label: "더 자연스러운 영어 표현",
  natural: "자연스러운 표현이에요.",
  retry: "표현 다시 확인",
  suggestionLabel: "이럴 때 쓰는 영어 표현",
  unclear: "표현의 뜻을 파악하기 어려워요.",
} as const;
