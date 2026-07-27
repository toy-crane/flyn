import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  Color: jest.requireActual("expo-router/build/color").Color,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("../../lib/account", () => ({ deleteAccount: jest.fn() }));
jest.mock("../../lib/auth/sign-out", () => ({ signOut: jest.fn() }));
jest.mock("../../lib/use-profile", () => ({ useProfile: jest.fn() }));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { deleteAccount } from "../../lib/account";
import { signOut } from "../../lib/auth/sign-out";
import { useProfile } from "../../lib/use-profile";
import SettingsScreen from "./index";

const mockUseProfile = useProfile as unknown as jest.Mock;
const mockSignOut = signOut as unknown as jest.Mock;
const mockDeleteAccount = deleteAccount as unknown as jest.Mock;

const IRREVERSIBLE = /되돌릴 수 없습니다/;

const PROFILE = {
  display_name: "한울",
  email: "me@example.test",
  id: "user-1",
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
  mockSignOut.mockResolvedValue(null);
  mockDeleteAccount.mockResolvedValue(null);
});

describe("설정 — 프로필", () => {
  it("현재 표시 이름과 이메일을 보여준다", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText("표시 이름")).toBeTruthy();
    expect(screen.getByText("한울")).toBeTruthy();
    expect(screen.getByText("이메일")).toBeTruthy();
    expect(screen.getByText("me@example.test")).toBeTruthy();
  });

  it("표시 이름을 누르면 편집 화면으로 push한다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("표시 이름"));

    expect(mockPush).toHaveBeenCalledWith("/settings/display-name");
  });

  // 원본은 auth.users이고 앱에는 update 열 권한이 없다. 누를 수 있게 두면
  // 서버가 거부할 일을 UI가 약속하는 셈이다.
  it("이메일 행은 눌러도 아무 데도 가지 않는다", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("이메일"));

    expect(mockPush).not.toHaveBeenCalled();
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

  // 실패하면 화면이 그대로 남아 아무 일도 안 일어난 것처럼 보인다.
  it("로그아웃 실패를 알린다", async () => {
    mockSignOut.mockResolvedValue({ error: "Network request failed" });

    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("로그아웃"));

    await pressAlertButton("로그아웃");

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "로그아웃하지 못했습니다",
      "Network request failed"
    );
  });
});

// 계정 생성이 있는 앱은 앱 안에서 전체 삭제를 시작할 수 있어야 한다(§5).
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

  // Apple 취소 실패가 정확히 이 경우다 — 사용자는 왜 멈췄는지 알아야 한다.
  it("서버가 중단한 이유를 그대로 전한다", async () => {
    mockDeleteAccount.mockResolvedValue({
      error: "Apple 로그인 해제에 실패했습니다.",
    });

    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByText("계정 삭제"));

    await pressAlertButton("삭제");

    expect(Alert.alert).toHaveBeenLastCalledWith(
      "계정을 삭제하지 못했습니다",
      "Apple 로그인 해제에 실패했습니다."
    );
  });
});
