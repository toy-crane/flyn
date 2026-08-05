import { fireEvent, render, screen } from "@testing-library/react-native";
import { EpisodeContextCard } from "./episode-context-card";

const DESCRIPTION =
  "여행 중 포틀랜드의 작은 카페 Ember Coffee에 들어왔어요. 바리스타가 카운터에서 인사를 건넵니다.";

describe("상황 카드", () => {
  it("접히면 상황 자세히 보기 한 줄만 말한다", async () => {
    await render(<EpisodeContextCard description={DESCRIPTION} />);

    expect(screen.getByText("상황 자세히 보기")).toBeTruthy();
    expect(screen.queryByTestId("episode-context-description")).toBeNull();
    expect(
      screen.getByTestId("episode-context-card").props.accessibilityState
    ).toMatchObject({ expanded: false });
  });

  it("탭하면 같은 카드 안에서 상황 설명이 펼쳐진다", async () => {
    await render(<EpisodeContextCard description={DESCRIPTION} />);

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
