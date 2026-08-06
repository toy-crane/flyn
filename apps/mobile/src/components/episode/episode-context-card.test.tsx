import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("react-native-safe-area-context", () => ({
  // HeroUI provider가 이 모듈에서 함께 가져다 쓴다 — 통째로 대체하면 provider가
  // 렌더되지 않는다.
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

import { HeroUIWrapper } from "../../test-support/heroui";
import { EpisodeContextCard } from "./episode-context-card";

const DESCRIPTION =
  "여행 중 포틀랜드의 작은 카페 Ember Coffee에 들어왔어요. 바리스타가 카운터에서 인사를 건넵니다.";

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderCard() {
  return render(<EpisodeContextCard description={DESCRIPTION} />, {
    wrapper: HeroUIWrapper,
  });
}

describe("상황 카드", () => {
  beforeEach(() => {
    // 아이콘 글리프는 jest-expo의 asset registry mock 위에서만 마운트된다 —
    // `resetAllMocks`는 그 mock까지 지운다.
    jest.clearAllMocks();
  });

  it("접히면 상황 자세히 보기 한 줄만 말한다", async () => {
    await renderCard();

    expect(screen.getByText("상황 자세히 보기")).toBeTruthy();
    expect(screen.queryByTestId("episode-context-description")).toBeNull();
    expect(
      screen.getByTestId("episode-context-card").props.accessibilityState
    ).toMatchObject({ expanded: false });
  });

  it("탭하면 같은 카드 안에서 상황 설명이 펼쳐진다", async () => {
    await renderCard();

    await fireEvent.press(screen.getByTestId("episode-context-card"));

    expect(screen.getByTestId("episode-context-description")).toHaveTextContent(
      DESCRIPTION
    );
    expect(screen.getByText("상황")).toBeTruthy();
    expect(screen.queryByText("상황 자세히 보기")).toBeNull();

    await fireEvent.press(screen.getByTestId("episode-context-card"));

    expect(screen.queryByTestId("episode-context-description")).toBeNull();
  });
});
