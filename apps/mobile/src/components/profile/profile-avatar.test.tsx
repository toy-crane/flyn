import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { ProfileAvatar } from "./profile-avatar";

describe("ProfileAvatar", () => {
  it("이름 첫 글자를 고정된 원형 색상 위에 보여준다", async () => {
    await render(<ProfileAvatar name="한울" testID="profile-avatar" />);

    const avatar = screen.getByTestId("profile-avatar");

    expect(screen.getByText("한")).toBeTruthy();
    expect(avatar.props.style).toMatchObject({
      backgroundColor: "#1A73E8",
      borderRadius: 44,
      height: 88,
      width: 88,
    });
    expect(avatar.props.textStyle).toMatchObject({
      color: "#FFFFFF",
      textAlign: "center",
    });
  });

  it("전체 이름에 따라 서로 다른 색을 안정적으로 고른다", async () => {
    await render(
      <>
        <ProfileAvatar name="한울" testID="avatar-hanul" />
        <ProfileAvatar name="민지" testID="avatar-minji" />
      </>
    );

    expect(screen.getByTestId("avatar-hanul").props.style.backgroundColor).toBe(
      "#1A73E8"
    );
    expect(screen.getByTestId("avatar-minji").props.style.backgroundColor).toBe(
      "#C5221F"
    );
  });

  it("첫 글자가 결합 이모지여도 하나의 grapheme으로 보여준다", async () => {
    await render(
      <ProfileAvatar name="👨‍👩‍👧 가족" testID="emoji-profile-avatar" />
    );

    expect(screen.getByText("👨‍👩‍👧")).toBeTruthy();
  });
});
