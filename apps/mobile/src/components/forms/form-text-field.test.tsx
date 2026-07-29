import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { useNativeState } from "@expo/ui";
import { FormTextField } from "./form-text-field";

function TestField({ error }: { error?: string }) {
  const value = useNativeState("");

  return (
    <FormTextField
      error={error}
      label="표시 이름"
      placeholder="이름을 입력해 주세요"
      value={value}
    />
  );
}

describe("FormTextField", () => {
  it("label과 입력 오류를 한 단위로 보여준다", async () => {
    await render(<TestField error="이름을 저장하지 못했습니다." />);

    expect(screen.getByText("표시 이름")).toBeTruthy();
    expect(screen.getByLabelText("표시 이름")).toBeTruthy();
    expect(screen.getByPlaceholderText("이름을 입력해 주세요")).toBeTruthy();
    expect(screen.getByText("이름을 저장하지 못했습니다.")).toBeTruthy();
  });
});
