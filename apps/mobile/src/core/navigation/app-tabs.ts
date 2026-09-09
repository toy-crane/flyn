/**
 * 하단 탭 셋.
 *
 * 탐색은 플레이할 스토리를 찾는 곳이고, 스토리는 내가 대화한 스토리로 돌아가는
 * 곳이다. 둘을 나누면 콘텐츠 소개와 회차별 진행의 기준이 한 화면에 섞이지 않는다.
 * 홈은 영어 학습 공간으로 남겨 두고 구체적인 화면은 추후 설계한다.
 */
export const appTabs = [
  {
    androidIcon: { default: "home", selected: "home_filled" },
    iosIcon: { default: "house", selected: "house.fill" },
    label: "홈",
    routeName: "(home)",
  },
  {
    androidIcon: { default: "grid_view", selected: "grid_view" },
    iosIcon: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
    label: "탐색",
    routeName: "(browse)",
  },
  {
    androidIcon: { default: "auto_stories", selected: "auto_stories" },
    iosIcon: { default: "book", selected: "book.fill" },
    label: "스토리",
    routeName: "(stories)",
  },
] as const;

/** 목록보다 깊이 들어간 화면은 해당 탭의 흐름만 보여 준다. */
export function isTabBarHidden(pathname: string): boolean {
  return pathname.startsWith("/story/") || pathname.startsWith("/records/");
}
