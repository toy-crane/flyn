import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { NativeSymbol } from "./native-symbol";

it("native disclosure 심볼을 같은 SF Symbol 표현으로 그린다", async () => {
  await render(<NativeSymbol color="#686868" symbol="disclosure" />);

  const symbol = screen.getByLabelText("chevron.right");

  expect(symbol.props.style).toEqual({ backgroundColor: "#686868" });
  expect(JSON.parse(symbol.props.accessibilityHint)).toContainEqual({
    $modifier: "font",
    args: [{ size: 14, weight: "medium" }],
  });
});
