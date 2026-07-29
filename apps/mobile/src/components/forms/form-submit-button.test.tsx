import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui", () =>
  require("../../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { FormSubmitButton } from "./form-submit-button";

describe("FormSubmitButton", () => {
  it("처리 중에도 같은 label을 유지하고 중복 제출을 막는다", async () => {
    await render(<FormSubmitButton label="저장" onPress={jest.fn()} pending />);

    expect(screen.getByText("저장")).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });
});
