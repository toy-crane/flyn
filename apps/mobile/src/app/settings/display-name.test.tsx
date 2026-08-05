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
  useProfile: jest.fn(),
  useSaveDisplayName: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useProfile, useSaveDisplayName } from "../../lib/use-profile";
import { routerStub } from "../../test-support/expo-router";
import DisplayNameScreen from "./display-name";

const mockUseProfile = useProfile as jest.Mock;
const mockUseSaveDisplayName = useSaveDisplayName as jest.Mock;
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
  mockUseSaveDisplayName.mockReturnValue({ isPending: false, mutate });
});

describe("닉네임 편집 form sheet", () => {
  it("plain native content에 현재 값과 규칙 footer를 보여준다", async () => {
    await render(<DisplayNameScreen />);

    expect(screen.queryByTestId("expo-ui-field-group")).toBeNull();
    expect(screen.getByLabelText("닉네임").props.value).toBe("한울");
    expect(
      screen.getByText("1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.")
    ).toBeTruthy();
  });

  it("native toolbar의 SF Symbol로 닫기와 저장을 제공한다", async () => {
    await render(<DisplayNameScreen />);

    const close = screen.getByRole("button", { name: "닫기" });
    const save = screen.getByRole("button", { name: "저장" });

    expect(close.props.accessibilityHint).toBe("sf:xmark");
    expect(save.props.accessibilityHint).toBe("sf:checkmark");
    expect(save).toBeDisabled();

    await fireEvent.press(close);
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("입력 규칙과 변경 여부로 toolbar 저장을 잠근다", async () => {
    await render(<DisplayNameScreen />);
    const save = screen.getByRole("button", { name: "저장" });

    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름");
    expect(save).not.toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름😀");
    expect(save).toBeDisabled();
  });

  it("저장 성공 때 정규화한 값을 반영하고 form sheet를 닫는다", async () => {
    await render(<DisplayNameScreen />);
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "  새이름  ");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    expect(mutate).toHaveBeenCalledWith("새이름", expect.any(Object));
    const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    await act(() => options.onSuccess());
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("닫기는 바뀐 값을 저장하지 않는다", async () => {
    await render(<DisplayNameScreen />);
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "버릴 값");
    await fireEvent.press(screen.getByRole("button", { name: "닫기" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(routerStub.back).toHaveBeenCalled();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await render(<DisplayNameScreen />);
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = mutate.mock.calls[0]?.[1] as { onError: () => void };
    await act(() => options.onError());

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "저장하지 못했어요",
      "잠시 후 다시 시도해 주세요."
    );
    expect(screen.getByLabelText("닉네임").props.value).toBe("새이름");
  });

  it("저장 중에는 toolbar에 progress를 보이고 입력을 잠근다", async () => {
    mockUseSaveDisplayName.mockReturnValue({ isPending: true, mutate });
    await render(<DisplayNameScreen />);

    expect(screen.getByTestId("profile-edit-progress")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
    expect(screen.getByLabelText("닉네임").props.editable).toBe(false);
  });
});
