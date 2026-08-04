import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);
jest.mock("../../lib/auth/sign-out", () => ({ signOut: jest.fn() }));
jest.mock("../../lib/use-profile", () => ({
  checkUsernameAvailability: jest.fn().mockResolvedValue(true),
  isUsernameAlreadyTaken: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505",
  useProfile: jest.fn(),
  useSaveUsername: jest.fn(),
}));
jest.mock("../../lib/use-username-availability", () => ({
  useUsernameAvailability: jest.fn(),
}));
jest.mock("../../lib/username", () => {
  const actual = jest.requireActual("../../lib/username");
  return {
    ...actual,
    createUsernameSuggestions: jest.fn(),
    findAvailableUsername: jest.fn(),
  };
});
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));
jest.mock("../../theme/app-theme", () => ({
  useAppTheme: () => ({
    background: "#f7f7f5",
    danger: "#c62828",
    foreground: "#202124",
    mutedForeground: "#6b6f76",
    placeholder: "#8c9199",
    primary: "#275dff",
    primaryForeground: "#ffffff",
    success: "#1f7a35",
    surface: "#ffffff",
  }),
}));

import { useProfile, useSaveUsername } from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import {
  createUsernameSuggestions,
  findAvailableUsername,
} from "../../lib/username";
import UsernameOnboardingScreen from "./username";

const mockAvailability = useUsernameAvailability as jest.Mock;
const mockCreateSuggestions = createUsernameSuggestions as jest.Mock;
const mockFindUsername = findAvailableUsername as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;
const mockUseSave = useSaveUsername as jest.Mock;
const mutate = jest.fn();
const OTHER_PEOPLE = /다른 사람이/;
const LOGIN = /로그인/;

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailability.mockReturnValue("available");
  mockCreateSuggestions.mockResolvedValue([
    "toycrane1111",
    "toycrane2222",
    "toycrane3333",
  ]);
  mockFindUsername.mockResolvedValue("toycrane");
  mockUseProfile.mockReturnValue({
    data: {
      display_name: "한울",
      email: "toycrane@example.com",
      id: "user-1",
      username: null,
    },
  });
  mockUseSave.mockReturnValue({ isPending: false, mutate });
});

async function renderScreen(status = "available") {
  mockAvailability.mockReturnValue(status);
  await render(<UsernameOnboardingScreen />);
  await screen.findByLabelText("아이디");
}

it("설명 문단 없이 아이디 필드·규칙·시작 행동만 보여준다", async () => {
  await renderScreen();

  expect(screen.getByText("아이디")).toBeTruthy();
  expect(
    screen.getByText("4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.")
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "시작하기" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "로그아웃" })).toBeNull();
  expect(screen.queryByText(OTHER_PEOPLE)).toBeNull();
  expect(screen.queryByText(LOGIN)).toBeNull();
});

it("사용 가능한 이메일 기반 아이디를 미리 채운다", async () => {
  await renderScreen();

  expect(mockFindUsername).toHaveBeenCalledWith(
    "toycrane@example.com",
    expect.any(Function)
  );
  expect(screen.getByLabelText("아이디").props.value).toBe("toycrane");
});

it("아이디 입력은 라틴 키보드·소문자·자동수정 끔으로 설정한다", async () => {
  await renderScreen();

  expect(screen.getByLabelText("아이디").props).toMatchObject({
    autoCapitalize: "none",
    autoCorrect: false,
    keyboardType: "ascii-capable",
  });
});

it.each(["invalid", "checking", "taken"])(
  "%s 상태에서는 저장을 잠근다",
  async (status) => {
    await renderScreen(status);

    expect(screen.getByRole("button", { name: "시작하기" })).toBeDisabled();
  }
);

it("사용 가능하면 초록 체크를 보여주고 저장을 연다", async () => {
  await renderScreen("available");

  expect(screen.getByLabelText("checkmark.circle.fill")).toHaveStyle({
    backgroundColor: "#1f7a35",
  });
  expect(screen.getByRole("button", { name: "시작하기" })).not.toBeDisabled();
});

it("가용성 요청이 실패한 unknown은 체크 없이 저장을 연다", async () => {
  await renderScreen("unknown");

  expect(screen.queryByLabelText("checkmark.circle.fill")).toBeNull();
  expect(screen.getByRole("button", { name: "시작하기" })).not.toBeDisabled();
});

it("중복이면 오류와 추천 3개를 보여준다", async () => {
  await renderScreen("taken");

  expect(screen.getByText("이미 사용 중인 아이디예요.")).toBeTruthy();
  expect(screen.getByLabelText("exclamationmark.circle.fill")).toBeTruthy();
  expect(screen.getByText("추천")).toBeTruthy();
  const suggestionNodes = await Promise.all(
    ["toycrane1111", "toycrane2222", "toycrane3333"].map((suggestion) =>
      screen.findByText(suggestion)
    )
  );
  expect(suggestionNodes).toHaveLength(3);
});

it("추천을 누르면 값만 채우고 저장하지 않는다", async () => {
  await renderScreen("taken");
  await fireEvent.press(await screen.findByText("toycrane1111"));

  expect(screen.getByLabelText("아이디").props.value).toBe("toycrane1111");
  expect(mutate).not.toHaveBeenCalled();
});

it("저장 순간의 유니크 위반은 alert 대신 중복 상태로 되돌린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen("available");
  await fireEvent.press(screen.getByText("시작하기"));

  const options = mutate.mock.calls[0]?.[1] as {
    onError: (error: unknown) => void;
  };
  await act(() => options.onError({ code: "23505" }));

  expect(await screen.findByText("이미 사용 중인 아이디예요.")).toBeTruthy();
  expect(alert).not.toHaveBeenCalled();
});

it("일반 저장 실패는 입력값을 둔 채 alert로 알린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen("available");
  await fireEvent.press(screen.getByText("시작하기"));

  const options = mutate.mock.calls[0]?.[1] as {
    onError: (error: unknown) => void;
  };
  await act(() => options.onError(new Error("network")));

  expect(alert).toHaveBeenCalledWith(
    "저장하지 못했어요",
    "잠시 후 다시 시도해 주세요."
  );
  expect(screen.getByLabelText("아이디").props.value).toBe("toycrane");
});
