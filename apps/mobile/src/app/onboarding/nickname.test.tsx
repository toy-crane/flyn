import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, processColor } from "react-native";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);

// 네이티브 모듈이라 jest에서는 서지 않는다. 키보드를 피해 CTA를 올리는 일은
// 시뮬레이터가 확인하고, 여기서는 자리만 세운다.
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: require("react-native").View,
}));

// HeroUINativeProvider가 insets 구독에 SafeAreaListener를 쓴다 — 네이티브 뷰라
// jest에서는 자리만 세운다.
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

jest.mock("../../lib/auth/name-candidate", () => ({
  fetchNameCandidate: jest.fn(),
}));
jest.mock("../../lib/use-profile", () => ({
  useSaveDisplayName: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useRouter } from "expo-router";
import { fetchNameCandidate } from "../../lib/auth/name-candidate";
import { useSaveDisplayName } from "../../lib/use-profile";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../../test-support/heroui";
import NicknameOnboardingScreen from "./nickname";

const mockFetchCandidate = fetchNameCandidate as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSave = useSaveDisplayName as jest.Mock;
const mutate = jest.fn();
const push = jest.fn();
const FIELD = "닉네임";
const SUBMIT = "아이디 정하기";
const RULE = "1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.";
const OTHER_PEOPLE = /다른 사람에게/;
const LATER_IN_SETTINGS = /나중에 설정/;
const ON_ACCENT = THEME_TOKEN_STUBS["--color-accent-foreground"];
const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchCandidate.mockResolvedValue("김한울");
  mockUseRouter.mockReturnValue({ push });
  mockUseSave.mockReturnValue({ isPending: false, mutate });
});

async function renderScreen() {
  await render(<NicknameOnboardingScreen />, { wrapper: HeroUIWrapper });
  await screen.findByLabelText(FIELD);
}

it("설명 문단 없이 닉네임 필드·규칙·다음 행동만 보여준다", async () => {
  await renderScreen();

  // getByLabelText는 accessibilityLabel로 닿으므로 이 단언이 없으면 눈에 보이는
  // label을 지워도 아무 테스트가 깨지지 않는다. label은 field 밖에 남는다
  // (docs/specs/input-form-style/spec.md).
  expect(screen.getByText(FIELD)).toBeTruthy();
  expect(screen.getByText(RULE)).toBeTruthy();
  expect(screen.getByRole("button", { name: SUBMIT })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "로그아웃" })).toBeNull();
  expect(screen.queryByText(OTHER_PEOPLE)).toBeNull();
  expect(screen.queryByText(LATER_IN_SETTINGS)).toBeNull();
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

it("provider 이름을 미리 채우되 자동 저장하지 않는다", async () => {
  await renderScreen();

  expect(screen.getByLabelText(FIELD).props.value).toBe("김한울");
  expect(mutate).not.toHaveBeenCalled();
});

it("닉네임 저장이 성공하면 아이디 단계로 push한다", async () => {
  await renderScreen();
  await fireEvent.changeText(screen.getByLabelText(FIELD), "  한울  ");
  await fireEvent.press(screen.getByText(SUBMIT));

  expect(mutate).toHaveBeenCalledWith("한울", expect.any(Object));
  const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
  await act(() => options.onSuccess());

  expect(push).toHaveBeenCalledWith("/onboarding/username");
});

// 규칙 위반은 빨간 오류가 아니라 잠긴 CTA로만 말한다
// (docs/decisions/settings-edits-use-native-form.md).
it("허용하지 않는 이름에는 버튼을 잠그고 규칙 각주를 그대로 둔다", async () => {
  await renderScreen();
  await fireEvent.changeText(screen.getByLabelText(FIELD), "한울😀");

  expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  expect(screen.getByText(RULE)).toBeTruthy();
});

it("저장 실패는 입력 규칙 자리가 아니라 alert로 알린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen();
  await fireEvent.press(screen.getByText(SUBMIT));

  const options = mutate.mock.calls[0]?.[1] as { onError: () => void };
  await act(() => options.onError());

  expect(alert).toHaveBeenCalledWith(
    "저장하지 못했어요",
    "잠시 후 다시 시도해 주세요."
  );
});

// 버튼 안 spinner는 수동형 indicator의 중립 회색이 아니라 버튼 전경색을 따른다
// (docs/decisions/apple-hig-with-app-theme.md).
it("저장 중에는 버튼 자리에 버튼 전경색 progress를 그린다", async () => {
  mockUseSave.mockReturnValue({ isPending: true, mutate });
  await renderScreen();

  const painted = paintedColors(screen.toJSON());

  expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  expect(painted).toContain(processColor(ON_ACCENT));
  expect(painted).not.toContain(processColor(NEUTRAL));
});
