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
  /** 에피소드에서 두 언어를 모두 입력할 수 있음을 알린다. */
  placeholder: "영어나 한국어로 적어 주세요.",
  /** Shown when the story could not be read, as the way to ask again. */
  retry: "다시 시도하기",
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

/**
 * 대화에서 표현을 담아 두는 자리가 쓰는 말.
 *
 * 담긴 것을 다시 보는 화면의 말은 여기 없다. 그 화면은 자기 기능이 소유한다.
 */
export const savedExpressionLabels = {
  /** Not shown: the bookmark on a line that is not saved yet. */
  save: "표현 저장",
  /** Shown after a bookmark saves. A transient toast, so no period. */
  saved: "표현을 저장했어요",
  /** Shown in place of the line when saving did not go through. */
  saveFailed: "표현을 저장하지 못했어요.",
  /** Not shown: the refresh mark that saves again after a failure. */
  saveRetry: "표현 저장 다시 시도",
  /** Not shown: the bookmark on a line that is already saved. */
  unsave: "저장 취소",
} as const;
