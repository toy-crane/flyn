import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

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
  useProfile: jest.fn(),
  useSaveDisplayName: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useProfile, useSaveDisplayName } from "../../lib/use-profile";
import { routerStub } from "../../test-support/expo-router";
import { HeroUIWrapper } from "../../test-support/heroui";
import DisplayNameScreen from "./display-name";

const mockUseProfile = useProfile as jest.Mock;
const mockUseSaveDisplayName = useSaveDisplayName as jest.Mock;
const mutate = jest.fn();
const FIELD = "닉네임";
const RULE = "1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.";
/** 본문이 자기 background를 칠했는지 보는 자리. */
const ANY_BACKGROUND = /\bbg-/;

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderScreen() {
  return render(<DisplayNameScreen />, { wrapper: HeroUIWrapper });
}

beforeEach(() => {
  // resetAllMocks는 jest-expo가 세운 asset registry 대역까지 지운다 — 그러면
  // 아이콘 글리프가 레지스트리를 찾지 못해 본문이 서지 않는다.
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
  mockUseSaveDisplayName.mockReturnValue({ isPending: false, mutate });
});

describe("닉네임 편집 form sheet", () => {
  it("현재 값과 규칙 각주를 보여준다", async () => {
    await renderScreen();

    expect(screen.getByLabelText(FIELD).props.value).toBe("한울");
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

  it("입력 규칙과 변경 여부로 toolbar 저장을 잠근다", async () => {
    await renderScreen();
    const save = screen.getByRole("button", { name: "저장" });

    await fireEvent.changeText(screen.getByLabelText(FIELD), "새이름");
    expect(save).not.toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText(FIELD), "새이름😀");
    expect(save).toBeDisabled();
  });

  // 규칙 위반은 저장만 잠그고 빨간 오류를 보이지 않는다 — danger는 중복 전용이라
  // 닉네임 시트에는 오류 자리 자체가 없다.
  it("규칙 위반에도 규칙 각주만 남긴다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "새이름😀");

    expect(screen.getByText(RULE)).toBeTruthy();
  });

  it("저장 성공 때 정규화한 값을 반영하고 form sheet를 닫는다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "  새이름  ");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    expect(mutate).toHaveBeenCalledWith("새이름", expect.any(Object));
    const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    await act(() => options.onSuccess());
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("닫기는 바뀐 값을 저장하지 않는다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "버릴 값");
    await fireEvent.press(screen.getByRole("button", { name: "닫기" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "새이름");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as { onError: () => void };
    await act(() => options.onError());

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "저장하지 못했어요",
      "잠시 후 다시 시도해 주세요."
    );
    expect(screen.getByLabelText(FIELD).props.value).toBe("새이름");
  });

  it("저장 중에는 toolbar에 progress를 보이고 입력을 잠근다", async () => {
    mockUseSaveDisplayName.mockReturnValue({ isPending: true, mutate });
    await renderScreen();

    expect(screen.getByTestId("profile-edit-progress")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
    expect(screen.getByLabelText(FIELD).props.editable).toBe(false);
  });
});
