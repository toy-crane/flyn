import { render, screen } from "@testing-library/react-native";
import { LoadingIndicator } from "./loading-indicator";

describe("LoadingIndicator", () => {
  it("수동형 progress의 의미 색과 호출부의 접근성 이름을 함께 제공한다", async () => {
    await render(
      <LoadingIndicator
        accessibilityLabel="채팅 불러오는 중"
        style={{ marginTop: 8 }}
        testID="loading-indicator"
      />
    );

    const indicator = screen.getByLabelText("채팅 불러오는 중");

    expect(indicator.props.color).toBe("#777777");
    expect(indicator).toHaveStyle({ marginTop: 8 });
  });
});
