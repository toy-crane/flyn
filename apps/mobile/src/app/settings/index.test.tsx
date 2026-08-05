import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

jest.mock("../../lib/account", () => ({ deleteAccount: jest.fn() }));
jest.mock("../../lib/auth/sign-out", () => ({ signOut: jest.fn() }));
jest.mock("../../lib/use-profile", () => ({
  checkUsernameAvailability: jest.fn().mockResolvedValue(true),
  isUsernameAlreadyTaken: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505",
  useProfile: jest.fn(),
  useSaveDisplayName: jest.fn(),
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

import { deleteAccount } from "../../lib/account";
import { signOut } from "../../lib/auth/sign-out";
import {
  useProfile,
  useSaveDisplayName,
  useSaveUsername,
} from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import { createUsernameSuggestions } from "../../lib/username";
import SettingsScreen from "./index";

const mockUseProfile = useProfile as unknown as jest.Mock;
const mockUseSaveDisplayName = useSaveDisplayName as jest.Mock;
const mockUseSaveUsername = useSaveUsername as jest.Mock;
const mockAvailability = useUsernameAvailability as jest.Mock;
const mockCreateSuggestions = createUsernameSuggestions as jest.Mock;
const mockSignOut = signOut as unknown as jest.Mock;
const mockDeleteAccount = deleteAccount as unknown as jest.Mock;
const nicknameMutate = jest.fn();
const usernameMutate = jest.fn();

const IRREVERSIBLE = /되돌릴 수 없습니다/;

const PROFILE = {
  display_name: "한울",
  email: "me@example.test",
  id: "user-1",
  username: "toycrane",
};

/**
 * Alert의 마지막 호출에서 라벨이 label인 버튼을 눌러 준다. 핸들러가 비동기라
 * 그 안의 상태 변경까지 act로 감싼다.
 */
function pressAlertButton(label: string) {
  const button = alertButtons().find((candidate) => candidate.text === label);

  return act(async () => {
    button?.onPress?.();
    await Promise.resolve();
  });
}

/** 마지막 얼럿의 버튼 목록 — 역할(style)까지 본다. */
function alertButtons() {
  const spy = Alert.alert as unknown as jest.Mock;

  return (spy.mock.calls.at(-1)?.[2] ?? []) as {
    onPress?: () => void;
    style?: string;
    text: string;
  }[];
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  mockUseProfile.mockReturnValue({ data: PROFILE });
  mockUseSaveDisplayName.mockReturnValue({
    isPending: false,
    mutate: nicknameMutate,
  });
  mockUseSaveUsername.mockReturnValue({
    isPending: false,
    mutate: usernameMutate,
  });
  mockAvailability.mockReturnValue("available");
  mockCreateSuggestions.mockResolvedValue([
    "toycrane1111",
    "toycrane2222",
    "toycrane3333",
  ]);
  mockSignOut.mockResolvedValue(undefined);
  mockDeleteAccount.mockResolvedValue(null);
});

describe("설정 — 프로필", () => {
  it("상단 프로필 헤더에 닉네임 아바타와 @아이디를 보여준다", async () => {
    await render(<SettingsScreen />);

    const header = screen.getByTestId("settings-profile-header");

    expect(within(header).getByTestId("settings-profile-avatar")).toBeTruthy();
    expect(within(header).getByText("한")).toBeTruthy();
    expect(within(header).getByText("한울")).toBeTruthy();
    expect(within(header).getByText("@toycrane")).toBeTruthy();
    expect(within(header).queryByText("me@example.test")).toBeNull();
  });

  it("프로필 헤더가 Dynamic Type과 iOS 16 전체 너비를 지원한다", async () => {
    await render(<SettingsScreen />);

    const header = screen.getByTestId("settings-profile-header");
    const headerModifiers = JSON.parse(header.props.accessibilityHint);
    const headerScope = within(header);

    expect(headerModifiers).toContainEqual(
      expect.objectContaining({
        $modifier: "frame",
        args: [{ maxWidth: "Infinity" }],
      })
    );
    expect(headerScope.getByText("한울").props.modifiers).toContainEqual(
      expect.objectContaining({
        $modifier: "font",
        args: [{ textStyle: "title", weight: "bold" }],
      })
    );
    expect(headerScope.getByText("@toycrane").props.modifiers).toContainEqual(
      expect.objectContaining({
        $modifier: "font",
        args: [{ textStyle: "callout" }],
      })
    );
    expect(headerScope.getByText("@toycrane").props.modifiers).toContainEqual(
      expect.objectContaining({
        $modifier: "multilineTextAlignment",
        args: ["center"],
      })
    );
  });

  it("프로필 목록에 닉네임·아이디·이메일을 보여준다", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText("닉네임")).toBeTruthy();
    expect(screen.getAllByText("한울")).toHaveLength(2);
    expect(screen.getByText("아이디")).toBeTruthy();
    expect(screen.getByText("toycrane")).toBeTruthy();
    expect(screen.getByText("이메일")).toBeTruthy();
    expect(screen.getAllByText("me@example.test")).toHaveLength(1);
  });

  it("닉네임과 아이디를 누르면 각각 다른 시트를 연다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("닉네임"));
    expect(screen.getByTestId("nickname-edit-sheet")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "닫기" }));
    await fireEvent.press(screen.getByText("아이디"));

    expect(screen.getByTestId("username-edit-sheet")).toBeTruthy();
  });

  it("두 편집 행은 disclosure를, 이메일 행은 읽기 전용을 유지한다", async () => {
    await render(<SettingsScreen />);

    const indicators = screen.getAllByLabelText("chevron.right");

    expect(indicators).toHaveLength(2);
    expect(JSON.parse(indicators[0]?.props.accessibilityHint)).toContainEqual(
      expect.objectContaining({
        $modifier: "font",
        args: [{ size: 14, weight: "medium" }],
      })
    );
  });

  // 원본은 auth.users이고 앱에는 update 열 권한이 없다. 누를 수 있게 두면
  // 서버가 거부할 일을 UI가 약속하는 셈이다.
  it("이메일 행은 눌러도 아무 데도 가지 않는다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("이메일"));

    expect(screen.queryByTestId("nickname-edit-sheet")).toBeNull();
    expect(screen.queryByTestId("username-edit-sheet")).toBeNull();
  });
});

describe("설정 — 닉네임 편집 시트", () => {
  async function openNickname() {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("닉네임"));
  }

  it("전체 높이 plain sheet에 입력과 규칙 footer를 보여준다", async () => {
    await openNickname();

    const sheet = screen.getByTestId("nickname-edit-sheet");
    expect(JSON.parse(sheet.props.accessibilityHint)).toEqual({
      showDragIndicator: true,
      snapPoints: ["full"],
    });
    expect(within(sheet).queryByTestId("expo-ui-field-group")).toBeNull();
    expect(screen.getByLabelText("닉네임").props.value).toBe("한울");
    expect(
      screen.getByText("1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.")
    ).toBeTruthy();
  });

  it("바뀐 값이 없거나 규칙에 맞지 않으면 저장을 잠근다", async () => {
    await openNickname();
    const save = screen.getByRole("button", { name: "저장" });

    expect(save).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름");
    expect(save).not.toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름😀");
    expect(save).toBeDisabled();
  });

  it("닫거나 끌어내리면 저장하지 않고 다음에 저장값으로 다시 연다", async () => {
    await openNickname();
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "버릴 값");
    await fireEvent.press(screen.getByLabelText("시트 끌어내리기"));

    expect(screen.queryByTestId("nickname-edit-sheet")).toBeNull();
    expect(nicknameMutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText("닉네임"));
    expect(screen.getByLabelText("닉네임").props.value).toBe("한울");
  });

  it("저장 성공 때 전체 프로필 mutation 뒤 시트를 닫는다", async () => {
    await openNickname();
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "  새이름  ");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    expect(nicknameMutate).toHaveBeenCalledWith("새이름", expect.any(Object));
    const options = nicknameMutate.mock.calls[0]?.[1] as {
      onSuccess: () => void;
    };
    await act(() => options.onSuccess());
    expect(screen.queryByTestId("nickname-edit-sheet")).toBeNull();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await openNickname();
    await fireEvent.changeText(screen.getByLabelText("닉네임"), "새이름");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = nicknameMutate.mock.calls[0]?.[1] as {
      onError: () => void;
    };
    await act(() => options.onError());

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "저장하지 못했어요",
      "잠시 후 다시 시도해 주세요."
    );
    expect(screen.getByLabelText("닉네임").props.value).toBe("새이름");
  });

  it("저장 중에는 checkmark 자리를 progress로 바꾸고 입력을 잠근다", async () => {
    mockUseSaveDisplayName.mockReturnValue({
      isPending: true,
      mutate: nicknameMutate,
    });
    await openNickname();

    expect(screen.getByTestId("profile-edit-progress")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
    expect(screen.getByLabelText("닉네임").props.editable).toBe(false);
  });
});

describe("설정 — 아이디 편집 시트", () => {
  async function openUsername(status = "available") {
    mockAvailability.mockReturnValue(status);
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("아이디"));
  }

  it("plain sheet에 입력과 상태 footer를 보여준다", async () => {
    await openUsername();

    const sheet = screen.getByTestId("username-edit-sheet");

    expect(within(sheet).queryByTestId("expo-ui-field-group")).toBeNull();
    expect(screen.getByLabelText("아이디").props.value).toBe("toycrane");
    expect(
      screen.getByText("4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.")
    ).toBeTruthy();
  });

  it("현재 아이디는 사용 가능이어도 바뀐 값이 없어 저장하지 않는다", async () => {
    await openUsername();

    expect(screen.getByLabelText("아이디").props.value).toBe("toycrane");
    expect(screen.getByLabelText("checkmark.circle.fill")).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("사용 가능한 새 아이디는 저장할 수 있다", async () => {
    await openUsername();
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");

    expect(screen.getByRole("button", { name: "저장" })).not.toBeDisabled();
  });

  it("중복이면 danger 오류와 추천 3개를 보여주고 저장을 잠근다", async () => {
    await openUsername("taken");

    expect(screen.getByText("이미 사용 중인 아이디예요.")).toBeTruthy();
    expect(screen.getByLabelText("exclamationmark.circle.fill")).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    expect(await screen.findByText("toycrane1111")).toBeTruthy();
    expect(await screen.findByText("toycrane2222")).toBeTruthy();
    expect(await screen.findByText("toycrane3333")).toBeTruthy();
  });

  it("추천을 누르면 값만 채우고 저장하지 않는다", async () => {
    await openUsername("taken");
    await fireEvent.press(await screen.findByText("toycrane1111"));

    expect(screen.getByLabelText("아이디").props.value).toBe("toycrane1111");
    expect(usernameMutate).not.toHaveBeenCalled();
  });

  it("저장 순간 중복은 alert 대신 중복 상태로 되돌린다", async () => {
    await openUsername();
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = usernameMutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    await act(() => options.onError({ code: "23505" }));

    expect(await screen.findByText("이미 사용 중인 아이디예요.")).toBeTruthy();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("일반 저장 실패는 입력값을 보존한 채 alert로 알린다", async () => {
    await openUsername();
    await fireEvent.changeText(screen.getByLabelText("아이디"), "new.name");
    await fireEvent.press(screen.getByRole("button", { name: "저장" }));

    const options = usernameMutate.mock.calls[0]?.[1] as {
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

describe("설정 — 계정", () => {
  it("로그아웃은 확인을 거친다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("로그아웃"));

    expect(Alert.alert).toHaveBeenCalled();
    // 확인 전에는 세션을 건드리지 않는다.
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("확인하면 로그아웃한다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("로그아웃"));

    await pressAlertButton("로그아웃");

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("취소하면 로그아웃하지 않는다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("로그아웃"));

    await pressAlertButton("취소");

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // auth-js는 요청이 실패해도 로컬 세션을 지우고 SIGNED_OUT을 쏜다. 그래서
  // 실패 얼럿은 방금 도착한 로그인 화면 위에 거짓말을 겹치는 짓이었다.
  it("로그아웃 실패 얼럿을 띄우지 않는다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("로그아웃"));

    await pressAlertButton("로그아웃");

    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
});

// 계정 생성이 있는 앱은 앱 안에서 전체 삭제를 시작할 수 있어야 한다.
// 일시 비활성화나 로그아웃으로 대신하지 않는다.
describe("설정 — 계정 삭제", () => {
  it("삭제는 명시적 확인을 거친다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    expect(Alert.alert).toHaveBeenCalled();
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("확인 버튼이 destructive 역할이다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    expect(alertButtons().find((b) => b.text === "삭제")?.style).toBe(
      "destructive"
    );
  });

  // 되돌릴 수 없다는 사실이 확인 문구에 있어야 한다.
  it("되돌릴 수 없음을 알린다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    const [, message] = (Alert.alert as unknown as jest.Mock).mock.calls.at(
      -1
    ) as [string, string];

    expect(message).toMatch(IRREVERSIBLE);
  });

  it("취소하면 삭제하지 않는다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    await pressAlertButton("취소");

    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("확인하면 삭제한다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    await pressAlertButton("삭제");

    expect(mockDeleteAccount).toHaveBeenCalled();
  });

  // 서버가 지우지 못했으면 사용자는 왜 멈췄는지 알아야 한다.
  it("서버가 중단한 이유를 그대로 전한다", async () => {
    mockDeleteAccount.mockResolvedValue({
      error: "계정을 삭제하지 못했어요.",
    });

    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    await pressAlertButton("삭제");

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "계정을 삭제하지 못했어요",
      "계정을 삭제하지 못했어요."
    );
  });
});
