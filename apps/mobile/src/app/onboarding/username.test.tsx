import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, processColor, StyleSheet } from "react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);

// 네이티브 모듈이라 jest에서는 서지 않는다 — 자리만 세운다.
jest.mock(
  "react-native-keyboard-controller",
  () => ({ KeyboardAvoidingView: require("react-native").View }),
  { virtual: true }
);

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

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

import { useProfile, useSaveUsername } from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import {
  createUsernameSuggestions,
  findAvailableUsername,
} from "../../lib/username";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../../test-support/heroui";
import UsernameOnboardingScreen from "./username";

const mockAvailability = useUsernameAvailability as jest.Mock;
const mockCreateSuggestions = createUsernameSuggestions as jest.Mock;
const mockFindUsername = findAvailableUsername as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;
const mockUseSave = useSaveUsername as jest.Mock;
const mutate = jest.fn();
const FIELD = "아이디";
const SUBMIT = "시작하기";
const RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";
const TAKEN = "이미 사용 중인 아이디예요.";
const AVAILABLE_SIGNAL = "사용할 수 있는 아이디예요";
const TAKEN_SIGNAL = "사용 중인 아이디예요";
const SUGGESTIONS = ["toycrane1111", "toycrane2222", "toycrane3333"];
const OTHER_PEOPLE = /다른 사람이/;
const LOGIN = /로그인/;
const ON_ACCENT = THEME_TOKEN_STUBS["--color-accent-foreground"];
const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];
const SUCCESS = THEME_TOKEN_STUBS["--color-success"];
const DANGER = THEME_TOKEN_STUBS["--color-danger"];

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailability.mockReturnValue("available");
  mockCreateSuggestions.mockResolvedValue(SUGGESTIONS);
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
  await render(<UsernameOnboardingScreen />, { wrapper: HeroUIWrapper });
  await screen.findByLabelText(FIELD);
}

it("설명 문단 없이 아이디 필드·규칙·시작 행동만 보여준다", async () => {
  await renderScreen();

  // label은 field 밖에 남는다(docs/specs/input-form-style/spec.md).
  expect(screen.getByText(FIELD)).toBeTruthy();
  expect(screen.getByText(RULE)).toBeTruthy();
  expect(screen.getByRole("button", { name: SUBMIT })).toBeTruthy();
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
  expect(screen.getByLabelText(FIELD).props.value).toBe("toycrane");
});

// placeholder는 accessibilityLabel과 별개다 — 지워도 getByLabelText는 계속
// 통과하므로 빈 칸에 남는 안내를 따로 붙잡는다.
it("빈 칸에도 무엇을 넣는 자리인지 남긴다", async () => {
  await renderScreen();

  expect(screen.getByLabelText(FIELD).props.placeholder).toBe(FIELD);
});

// 전진 CTA는 부모의 정렬이 아니라 스스로 폭을 잡는다 — row 안에 감싸도 줄지
// 않는다.
it("하단 CTA가 가로를 꽉 채운다", async () => {
  await renderScreen();

  expect(
    screen.getByRole("button", { name: SUBMIT }).props.className
  ).toContain("w-full");
});

it("아이디 입력은 라틴 키보드·소문자·자동수정 끔으로 설정한다", async () => {
  await renderScreen();

  expect(screen.getByLabelText(FIELD).props).toMatchObject({
    autoCapitalize: "none",
    autoCorrect: false,
    keyboardType: "ascii-capable",
  });
});

it.each(["invalid", "checking", "taken"])(
  "%s 상태에서는 저장을 잠근다",
  async (status) => {
    await renderScreen(status);

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  }
);

it("사용 가능하면 필드 안에서 그렇게 말하고 저장을 연다", async () => {
  await renderScreen("available");

  expect(screen.getByLabelText(AVAILABLE_SIGNAL)).toBeTruthy();
  expect(screen.getByRole("button", { name: SUBMIT })).not.toBeDisabled();
});

it("가용성 요청이 실패한 unknown은 신호 없이 저장을 연다", async () => {
  await renderScreen("unknown");

  expect(screen.queryByLabelText(AVAILABLE_SIGNAL)).toBeNull();
  expect(screen.getByRole("button", { name: SUBMIT })).not.toBeDisabled();
});

// 확인 중에는 아직 말할 것이 없다 — 어느 쪽 신호도 띄우지 않는다.
it("확인 중에는 신호를 그리지 않는다", async () => {
  await renderScreen("checking");

  expect(screen.queryByLabelText(AVAILABLE_SIGNAL)).toBeNull();
  expect(screen.queryByLabelText(TAKEN_SIGNAL)).toBeNull();
});

// 아이콘만 남는 신호라 뜻을 나르는 것은 모양과 색뿐이다. 두 색이 뒤바뀌어도
// 문구가 대신 말해 주지 않으므로 여기서 색을 직접 붙잡는다.
it.each([
  ["available", AVAILABLE_SIGNAL, SUCCESS],
  ["taken", TAKEN_SIGNAL, DANGER],
])("%s 신호는 그 상태의 의미 색으로 칠한다", async (status, label, color) => {
  await renderScreen(status);

  const icon = screen.getByLabelText(label);

  expect(StyleSheet.flatten(icon.props.style).color).toBe(color);
});

it("중복이면 규칙 각주를 오류로 바꾸고 추천 3개를 보여준다", async () => {
  await renderScreen("taken");

  expect(screen.getByText(TAKEN)).toBeTruthy();
  // 규칙은 danger로 다시 칠하지 않고 오류에 자리를 내준다.
  expect(screen.queryByText(RULE)).toBeNull();
  expect(screen.getByLabelText(TAKEN_SIGNAL)).toBeTruthy();
  expect(screen.getByText("추천")).toBeTruthy();
  const suggestionNodes = await Promise.all(
    SUGGESTIONS.map((suggestion) =>
      screen.findByRole("button", { name: suggestion })
    )
  );
  expect(suggestionNodes).toHaveLength(3);
});

// 규칙 위반은 저장만 잠그고 빨간 오류를 보이지 않는다 — danger는 중복 전용이다
// (docs/decisions/settings-edits-use-native-form.md).
it("규칙 위반에는 오류 없이 규칙 각주만 남긴다", async () => {
  await renderScreen("invalid");

  expect(screen.getByText(RULE)).toBeTruthy();
  expect(screen.queryByText(TAKEN)).toBeNull();
});

it("추천을 누르면 값만 채우고 저장하지 않는다", async () => {
  await renderScreen("taken");
  await fireEvent.press(await screen.findByText(SUGGESTIONS[0]));

  expect(screen.getByLabelText(FIELD).props.value).toBe(SUGGESTIONS[0]);
  expect(mutate).not.toHaveBeenCalled();
});

it("저장 순간의 유니크 위반은 alert 대신 중복 상태로 되돌린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen("available");
  await fireEvent.press(screen.getByText(SUBMIT));

  const options = mutate.mock.calls[0]?.[1] as {
    onError: (error: unknown) => void;
  };
  await act(() => options.onError({ code: "23505" }));

  expect(await screen.findByText(TAKEN)).toBeTruthy();
  expect(alert).not.toHaveBeenCalled();
});

it("일반 저장 실패는 입력값을 둔 채 alert로 알린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen("available");
  await fireEvent.press(screen.getByText(SUBMIT));

  const options = mutate.mock.calls[0]?.[1] as {
    onError: (error: unknown) => void;
  };
  await act(() => options.onError(new Error("network")));

  expect(alert).toHaveBeenCalledWith(
    "저장하지 못했어요",
    "잠시 후 다시 시도해 주세요."
  );
  expect(screen.getByLabelText(FIELD).props.value).toBe("toycrane");
});

// 버튼 안 progress는 수동형 indicator의 중립 회색이 아니라 버튼 전경색이다
// (docs/specs/neutral-loading-indicators/spec.md).
it("저장 중에는 버튼 자리에 버튼 전경색 progress를 그린다", async () => {
  mockUseSave.mockReturnValue({ isPending: true, mutate });
  await renderScreen("available");

  const painted = paintedColors(screen.toJSON());

  expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  expect(painted).toContain(processColor(ON_ACCENT));
  expect(painted).not.toContain(processColor(NEUTRAL));
});
