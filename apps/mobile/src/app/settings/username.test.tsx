import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, StyleSheet } from "react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
// 헤더 높이는 실물 native stack만 아는 값이다 — jest에서는 자리만 세운다.
jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 70,
}));
// HeroUINativeProvider가 insets 구독에 SafeAreaListener를 쓴다 — 네이티브 뷰라
// jest에서는 자리만 세운다.
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));
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
  return { ...actual, createUsernameSuggestions: jest.fn() };
});
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useProfile, useSaveUsername } from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import { createUsernameSuggestions } from "../../lib/username";
import { routerStub } from "../../test-support/expo-router";
import { HeroUIWrapper, THEME_TOKEN_STUBS } from "../../test-support/heroui";
import UsernameScreen from "./username";

const mockUseProfile = useProfile as jest.Mock;
const mockUseSaveUsername = useSaveUsername as jest.Mock;
const mockAvailability = useUsernameAvailability as jest.Mock;
const mockCreateSuggestions = createUsernameSuggestions as jest.Mock;
const mutate = jest.fn();
const FIELD = "아이디";
const RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";
const TAKEN = "이미 사용 중인 아이디예요.";
const AVAILABLE_SIGNAL = "사용할 수 있는 아이디예요";
const TAKEN_SIGNAL = "사용 중인 아이디예요";
const SUGGESTIONS = ["toycrane1111", "toycrane2222", "toycrane3333"];
const SUCCESS = THEME_TOKEN_STUBS["--color-success"];
const DANGER = THEME_TOKEN_STUBS["--color-danger"];
/** 본문이 자기 background를 칠했는지 보는 자리. */
const ANY_BACKGROUND = /\bbg-/;

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderScreen() {
  return render(<UsernameScreen />, { wrapper: HeroUIWrapper });
}

beforeEach(() => {
  // resetAllMocks는 jest-expo가 세운 asset registry 대역까지 지운다 — 그러면
  // 가용성 아이콘이 레지스트리를 찾지 못해 본문이 서지 않는다.
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  mockUseProfile.mockReturnValue({
    data: {
      display_name: "한울",
      email: "me@example.test",
      id: "user-1",
      username: "toycrane",
    },
  });
  mockUseSaveUsername.mockReturnValue({ isPending: false, mutate });
  mockAvailability.mockReturnValue("available");
  mockCreateSuggestions.mockResolvedValue(SUGGESTIONS);
});

describe("아이디 편집 form sheet", () => {
  it("현재 값과 규칙 각주를 보여준다", async () => {
    await renderScreen();

    expect(screen.getByLabelText(FIELD).props.value).toBe("toycrane");
    expect(screen.getByText(RULE)).toBeTruthy();
  });

  // 시트 제목이 이미 무엇을 고치는지 말한다 — 본문에 같은 말을 label로 또 두지
  // 않는다(docs/specs/input-form-style/spec.md).
  it("제목이 말하는 것을 본문 label로 되풀이하지 않는다", async () => {
    await renderScreen();

    expect(screen.queryByText(FIELD)).toBeNull();
  });

  // sheet의 background와 material은 iOS가 소유한다 — 본문이 자기 색을 칠하면
  // native surface가 가려진다(docs/decisions/settings-edits-use-native-form.md).
  it("본문이 sheet를 다시 칠하지 않는다", async () => {
    await renderScreen();

    expect(screen.getByTestId("profile-edit-body").props.className).not.toMatch(
      ANY_BACKGROUND
    );
  });

  it("native toolbar의 SF Symbol로 닫기와 저장을 제공한다", async () => {
    await renderScreen();

    const close = screen.getByRole("button", { name: "닫기" });
    const save = screen.getByRole("button", { name: "저장" });

    expect(close.props.accessibilityHint).toBe("sf:xmark");
    expect(save.props.accessibilityHint).toBe("sf:checkmark");
    expect(save).toBeDisabled();

    await fireEvent.press(close);
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("사용 가능한 새 아이디만 toolbar에서 저장할 수 있다", async () => {
    await renderScreen();
    const save = screen.getByRole("button", { name: "저장" });

    await fireEvent.changeText(screen.getByLabelText(FIELD), "new.name");
    expect(save).not.toBeDisabled();
    expect(screen.getByLabelText(AVAILABLE_SIGNAL)).toBeTruthy();
  });

  // 확인 중과 규칙 위반에는 아직 말할 것이 없다 — 어느 신호도 그리지 않는다
  // (docs/decisions/self-contained-native-ui-boundaries.md).
  it.each(["checking", "invalid"])(
    "%s 상태에서는 가용성 신호를 그리지 않는다",
    async (status) => {
      mockAvailability.mockReturnValue(status);
      await renderScreen();

      expect(screen.queryByLabelText(AVAILABLE_SIGNAL)).toBeNull();
      expect(screen.queryByLabelText(TAKEN_SIGNAL)).toBeNull();
    }
  );

  // 아이콘만 남는 신호라 뜻을 나르는 것은 모양과 색뿐이다. 두 색이 뒤바뀌어도
  // 문구가 대신 말해 주지 않으므로 여기서 색을 직접 붙잡는다.
  it.each([
    ["available", AVAILABLE_SIGNAL, SUCCESS],
    ["taken", TAKEN_SIGNAL, DANGER],
  ])("%s 신호는 그 상태의 의미 색으로 칠한다", async (status, label, color) => {
    mockAvailability.mockReturnValue(status);
    await renderScreen();

    const icon = screen.getByLabelText(label);

    expect(StyleSheet.flatten(icon.props.style).color).toBe(color);
  });

  it("중복이면 danger 상태와 추천 3개를 보여주고 저장을 잠근다", async () => {
    mockAvailability.mockReturnValue("taken");
    await renderScreen();

    expect(screen.getByText(TAKEN)).toBeTruthy();
    // 규칙은 danger로 다시 칠하지 않고 오류에 자리를 내준다.
    expect(screen.queryByText(RULE)).toBeNull();
    expect(screen.getByLabelText(TAKEN_SIGNAL)).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    const suggestions = await Promise.all(
      SUGGESTIONS.map((suggestion) =>
        screen.findByRole("button", { name: suggestion })
      )
    );
    expect(suggestions).toHaveLength(3);
  });

  // 규칙 위반은 저장만 잠그고 빨간 오류를 보이지 않는다 — danger는 중복 전용이다
  // (docs/decisions/settings-edits-use-native-form.md).
  it("규칙 위반은 저장만 잠그고 오류를 띄우지 않는다", async () => {
    mockAvailability.mockReturnValue("invalid");
    await renderScreen();

    expect(screen.getByText(RULE)).toBeTruthy();
    expect(screen.queryByText(TAKEN)).toBeNull();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("추천은 값만 채우고 자동 저장하지 않는다", async () => {
    mockAvailability.mockReturnValue("taken");
    await renderScreen();
    await fireEvent.press(await screen.findByText(SUGGESTIONS[0]));

    expect(screen.getByLabelText(FIELD).props.value).toBe(SUGGESTIONS[0]);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("저장 순간 중복은 alert 대신 중복 상태로 되돌린다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    await act(() => options.onError({ code: "23505" }));

    expect(await screen.findByText(TAKEN)).toBeTruthy();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("저장 성공 때 form sheet를 닫는다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    expect(mutate).toHaveBeenCalledWith("new.name", expect.any(Object));
    const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    await act(() => options.onSuccess());
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    await act(() => options.onError(new Error("network")));

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "저장하지 못했어요",
      "잠시 후 다시 시도해 주세요."
    );
    expect(screen.getByLabelText(FIELD).props.value).toBe("new.name");
  });

  it("저장 중에는 toolbar에 progress를 보이고 입력과 추천을 잠근다", async () => {
    mockAvailability.mockReturnValue("taken");
    mockUseSaveUsername.mockReturnValue({ isPending: true, mutate });
    await renderScreen();

    expect(screen.getByTestId("profile-edit-progress")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
    expect(screen.getByLabelText(FIELD).props.editable).toBe(false);
    expect(
      await screen.findByRole("button", { name: SUGGESTIONS[0] })
    ).toBeDisabled();
  });
});
