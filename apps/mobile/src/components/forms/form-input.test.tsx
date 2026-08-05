import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);
jest.mock("@expo/ui/jetpack-compose/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { useNativeState } from "@expo/ui";
import { FormInput } from "./form-input";

function TestInput() {
  const value = useNativeState("");

  return (
    <FormInput
      invalid
      label="표시 이름"
      placeholder="이름"
      testID="display-name-input"
      trailing={<Text>상태</Text>}
      value={value}
    />
  );
}

describe("FormInput", () => {
  it("adaptive fill과 capsule을 한 input surface에 적용한다", async () => {
    await render(<TestInput />);

    expect(screen.getByTestId("display-name-input-surface")).toHaveStyle({
      backgroundColor: "#222222",
      borderColor: "#111111",
      borderRadius: 26,
      borderWidth: 1,
      height: 52,
      paddingRight: 16,
    });
    expect(screen.getByTestId("display-name-input")).toHaveStyle({
      height: 52,
      paddingHorizontal: 18,
    });
    expect(screen.getByLabelText("표시 이름")).toBeTruthy();
    expect(screen.getByText("상태")).toBeTruthy();
  });
});
