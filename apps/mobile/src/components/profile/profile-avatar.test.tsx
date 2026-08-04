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
    await render(
      <ProfileAvatar
        colorKey="toycrane"
        displayName="한울"
        testID="profile-avatar"
      />
    );

    const avatar = screen.getByTestId("profile-avatar");

    expect(screen.getByText("한")).toBeTruthy();
    expect(avatar.props.style).toMatchObject({
      backgroundColor: "#137333",
      borderRadius: 44,
      height: 88,
      width: 88,
    });
    expect(avatar.props.textStyle).toMatchObject({
      color: "#FFFFFF",
      textAlign: "center",
    });
  });

  it("닉네임이 같아도 아이디가 다르면 서로 다른 색을 고른다", async () => {
    await render(
      <>
        <ProfileAvatar
          colorKey="toycrane"
          displayName="한울"
          testID="avatar-one"
        />
        <ProfileAvatar
          colorKey="another"
          displayName="한울"
          testID="avatar-two"
        />
      </>
    );

    expect(
      screen.getByTestId("avatar-one").props.style.backgroundColor
    ).not.toBe(screen.getByTestId("avatar-two").props.style.backgroundColor);
    expect(screen.getAllByText("한")).toHaveLength(2);
  });

  it("아이디가 같으면 닉네임을 바꿔도 색은 유지한다", async () => {
    await render(
      <>
        <ProfileAvatar
          colorKey="toycrane"
          displayName="한울"
          testID="avatar-hanul"
        />
        <ProfileAvatar
          colorKey="toycrane"
          displayName="민지"
          testID="avatar-minji"
        />
      </>
    );

    expect(screen.getByTestId("avatar-hanul").props.style.backgroundColor).toBe(
      screen.getByTestId("avatar-minji").props.style.backgroundColor
    );
    expect(screen.getByText("한")).toBeTruthy();
    expect(screen.getByText("민")).toBeTruthy();
  });
});
