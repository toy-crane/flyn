import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui", () =>
  require("../../test-support/expo-ui").swiftUiMock()
);

import { HostedLoadingIndicator } from "./hosted-loading-indicator";

describe("HostedLoadingIndicator", () => {
  it("완결된 native subtree에 수동형 progress의 의미 색을 적용한다", async () => {
    await render(<HostedLoadingIndicator testID="hosted-loading-indicator" />);

    expect(screen.getByTestId("hosted-loading-indicator").props.color).toBe(
      "#777777"
    );
  });
});
