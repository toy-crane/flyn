/**
 * Accessibility names double as the contract for tests and agent-device.
 * The same table lives in the repository README; change both together.
 */
export const episodeLabels = {
  /** Not shown: the episode header's back button. */
  back: "뒤로 가기",
  /** Shown as the button that leaves the finished episode. */
  leave: "홈으로 가기",
  /** Shown as the episode's name on Home and in the episode header. */
  name: "카페에서 생긴 일",
  /** Shown in the empty input while the scene is open. A label, so no period. */
  placeholder: "영어로 말해 보세요",
  /** Shown as the button that opens the same episode from the start again. */
  restart: "다시 시작하기",
  /** Shown as the persistent situation banner under the episode header. */
  situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
  /** Shown inside the situation banner, before the situation text. */
  situationEmoji: "☕",
  /** Shown as the button that opens the episode from Home. */
  start: "에피소드 시작하기",
  /** Shown under the episode's name on Home. */
  summary:
    "주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.",
} as const;
