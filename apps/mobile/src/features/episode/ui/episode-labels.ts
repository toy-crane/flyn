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
  /** Shown over the first episode's card on Home, before anything is finished. */
  firstEyebrow: "첫 이야기",
  /** Shown as the button that leaves the finished episode. */
  leave: "홈으로 가기",
  /** Shown over the episode that comes next, on Home and at an episode's end. */
  nextEyebrow: "다음 이야기",
  /** Shown in the empty input while the scene is open. A label, so no period. */
  placeholder: "영어로 말해 보세요",
  /** Shown when the story could not be read, as the way to ask again. */
  retry: "다시 시도하기",
  /** Opens the transcript of a finished episode from Home. */
  review: (episode: number, title: string, kind: string) =>
    `${episode}화 ${title}, ${kind}, 대화 보기`,
  /** Shown on a completed conversation that has no input. */
  reviewOnly: "끝난 대화 기록",
  /** Read while the scene left by Stop is being matched with the server. */
  saving: "진행을 저장하고 있어요",
  /** Shown as the button that opens an episode, from Home or from an ending. */
  start: (episode: number) => `${episode}화 시작하기`,
  /** Shown wherever an episode is named next to its number. */
  title: (episode: number, title: string) => `${episode}화 · ${title}`,
  /** Shown when the story could not be read. */
  unavailable: "이야기를 불러오지 못했어요.",
} as const;

/**
 * 에피소드 대화에서 몰랐던 표현에 붙는 교정이 쓰는 말.
 *
 * 틀림을 세는 말과 유형 이름은 여기에 없다. 채점받는 느낌을 만들지 않으려고
 * 라벨을 "배울 표현" 하나로 고정한다.
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
  /** Not shown: the chevron that folds an open card back into one line. */
  fold: "배울 표현 접기",
  /** Shown as the card's heading, and as the sheet's source label. */
  label: "배울 표현",
  /** Shown as the card's heading when one message carries several. */
  labelCount: (count: number) => `배울 표현 ${count}개`,
  /** Not shown: the one line under a message, which opens the card. */
  open: "배울 표현 보기",
  /** Shown as the button that puts the fixed sentence in the composer. */
  resend: "다시 보내기",
  /** Shown on the line once its fixed sentence has been sent again. */
  resent: "고쳐서 다시 보냈어요",
} as const;

/** 홈이 에피소드 묶음과 진행을 설명할 때 쓰는 말. */
export const storyLabels = {
  /** Shown as the number of one finished episode in the story's record. */
  episodeNumber: (episode: number) => `${episode}화`,
  /** Shown beside the story title while episodes are left. */
  progress: (finished: number, total: number) =>
    `${total}화 중 ${finished}화 완료`,
  /** Shown beside the story title once every episode is finished. */
  wholeStory: (total: number) => `${total}화 모두 완료`,
} as const;
