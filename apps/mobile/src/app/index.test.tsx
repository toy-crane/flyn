import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () =>
  require("../test-support/expo-router").expoRouterMock()
);
jest.mock("../lib/use-profile", () => ({ useProfile: jest.fn() }));
jest.mock("../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useProfile } from "../lib/use-profile";
import { routerStub } from "../test-support/expo-router";
import HomeScreen from "./index";

const mockUseProfile = useProfile as jest.Mock;
const GREETING = /안녕하세요/;
const NAME = /테스터님/;
const WALKING_SKELETON = /walking skeleton/i;

beforeEach(() => {
  jest.resetAllMocks();
  mockUseProfile.mockReturnValue({
    data: { display_name: "테스터", email: "tester@example.com" },
  });
});

describe("HomeScreen", () => {
  it("프로필의 표시 이름으로 최소 인사 화면을 보여준다", async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(GREETING)).toBeTruthy();
    expect(screen.getByText(NAME)).toBeTruthy();
    expect(screen.getByText("오늘도 가볍게 시작해 보세요.")).toBeTruthy();
    expect(screen.queryByText(WALKING_SKELETON)).toBeNull();
  });

  it("native toolbar의 설정 action으로 설정 화면을 연다", async () => {
    await render(<HomeScreen />);

    fireEvent.press(screen.getByRole("button", { name: "설정" }));

    expect(routerStub.push).toHaveBeenCalledWith("/settings");
  });
});
