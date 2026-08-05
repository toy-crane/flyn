import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);
jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
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
import UsernameScreen from "./username";

const mockUseProfile = useProfile as jest.Mock;
const mockUseSaveUsername = useSaveUsername as jest.Mock;
const mockAvailability = useUsernameAvailability as jest.Mock;
const mockCreateSuggestions = createUsernameSuggestions as jest.Mock;
const mutate = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
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
  mockCreateSuggestions.mockResolvedValue([
    "toycrane1111",
    "toycrane2222",
    "toycrane3333",
  ]);
});

describe("아이디 편집 form sheet", () => {
  it("plain native content에 현재 값과 상태 footer를 보여준다", async () => {
    await render(<UsernameScreen />);

    expect(screen.queryByTestId("expo-ui-field-group")).toBeNull();
    expect(screen.getByLabelText("아이디").props.value).toBe("toycrane");
    expect(screen.getByLabelText("checkmark.circle.fill")).toBeTruthy();
    expect(
      screen.getByText("4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.")
    ).toBeTruthy();
  });

  it("native toolbar의 SF Symbol로 닫기와 저장을 제공한다", async () => {
    await render(<UsernameScreen />);

    const close = screen.getByRole("button", { name: "닫기" });
    const save = screen.getByRole("button", { name: "저장" });

    expect(close.props.accessibilityHint).toBe("sf:xmark");
    expect(save.props.accessibilityHint).toBe("sf:checkmark");
    expect(save).toBeDisabled();

    await fireEvent.press(close);
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("사용 가능한 새 아이디만 toolbar에서 저장할 수 있다", async () => {
    await render(<UsernameScreen />);
    const save = screen.getByRole("button", { name: "저장" });

    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    expect(save).not.toBeDisabled();
  });

  it("중복이면 danger 상태와 추천을 보여주고 저장을 잠근다", async () => {
    mockAvailability.mockReturnValue("taken");
    await render(<UsernameScreen />);

    expect(screen.getByText("이미 사용 중인 아이디예요.")).toBeTruthy();
    expect(screen.getByLabelText("exclamationmark.circle.fill")).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    expect(await screen.findByText("toycrane1111")).toBeTruthy();
    expect(await screen.findByText("toycrane2222")).toBeTruthy();
    expect(await screen.findByText("toycrane3333")).toBeTruthy();
  });

  it("추천은 값만 채우고 자동 저장하지 않는다", async () => {
    mockAvailability.mockReturnValue("taken");
    await render(<UsernameScreen />);
    await fireEvent.press(await screen.findByText("toycrane1111"));

    expect(screen.getByLabelText("아이디").props.value).toBe("toycrane1111");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("저장 순간 중복은 alert 대신 중복 상태로 되돌린다", async () => {
    await render(<UsernameScreen />);
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    await act(() => options.onError({ code: "23505" }));

    expect(await screen.findByText("이미 사용 중인 아이디예요.")).toBeTruthy();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("저장 성공 때 form sheet를 닫는다", async () => {
    await render(<UsernameScreen />);
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    expect(mutate).toHaveBeenCalledWith("new.name", expect.any(Object));
    const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    await act(() => options.onSuccess());
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await render(<UsernameScreen />);
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    await act(() => options.onError(new Error("network")));

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "저장하지 못했어요",
      "잠시 후 다시 시도해 주세요."
    );
    expect(screen.getByLabelText("아이디").props.value).toBe("new.name");
  });
});
