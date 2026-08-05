import { render, screen } from "@testing-library/react-native";

const mockNavigatorOptions: { current?: Record<string, unknown> } = {};
const mockNavigationTheme: { current: { colors: Record<string, unknown> } } = {
  current: { colors: {} },
};
const mockRouteOptions: Record<string, Record<string, unknown> | undefined> =
  {};

// 실제 네비게이터 대신 가드 배선만 드러내는 최소 대역. guard가 참인 쪽의 자식만 남긴다.
jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Stack = ({
    children,
    screenOptions,
  }: {
    children: React.ReactNode;
    screenOptions?: Record<string, unknown>;
  }) => {
    mockNavigatorOptions.current = screenOptions;
    return React.createElement(React.Fragment, null, children);
  };

  Stack.Protected = ({
    guard,
    children,
  }: {
    guard: boolean;
    children: React.ReactNode;
  }) => (guard ? React.createElement(React.Fragment, null, children) : null);

  Stack.Screen = ({
    name,
    options,
  }: {
    name: string;
    options?: Record<string, unknown>;
  }) => {
    mockRouteOptions[name] = options;
    return React.createElement(Text, null, `screen:${name}`);
  };

  return { Stack };
});

jest.mock("expo-router/react-navigation", () => ({
  DarkTheme: { colors: {}, dark: true },
  DefaultTheme: { colors: {}, dark: false },
  ThemeProvider: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: { colors: Record<string, unknown> };
  }) => {
    mockNavigationTheme.current = value;
    return children;
  },
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// launch·프로필 오류 화면이 SwiftUI다. 목이 없으면 불투명한 네이티브 뷰 하나로
// 그려져 아래 문구 단언이 아무것도 찾지 못한다.
jest.mock("@expo/ui", () => require("../test-support/expo-ui").universalMock());
jest.mock("@expo/ui/swift-ui", () =>
  require("../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../test-support/expo-ui").modifiersMock()
);

jest.mock("../lib/query-client", () => ({
  queryClient: { clear: jest.fn(), mount: jest.fn(), unmount: jest.fn() },
}));

jest.mock("../lib/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("../lib/use-profile", () => ({ useProfileGate: jest.fn() }));
jest.mock("../lib/auth/sign-out", () => ({ signOut: jest.fn() }));

import { useAuth } from "../lib/use-auth";
import { useProfileGate } from "../lib/use-profile";
import Layout from "./_layout";

const mockUseAuth = useAuth as jest.Mock;
const mockUseProfileGate = useProfileGate as jest.Mock;
const MISSING_ENV = /환경변수 없음/;
const FETCH_FAILED = /계정 정보를 불러오지 못했어요/;
const INTEGRITY = /계정 정보가 올바르지 않아요/;

/** 로그인은 됐고 프로필 판정만 다른 경우가 대부분이라 한 줄로 묶는다. */
function signedInWith(profile: Record<string, unknown>) {
  mockUseAuth.mockReturnValue({ kind: "ready", userId: "user-1" });
  mockUseProfileGate.mockReturnValue(profile);
}

beforeEach(() => {
  jest.resetAllMocks();
  mockNavigatorOptions.current = undefined;
  mockNavigationTheme.current = { colors: {} };
  for (const name of Object.keys(mockRouteOptions)) {
    delete mockRouteOptions[name];
  }
  mockUseProfileGate.mockReturnValue({ kind: "loading" });
});

describe("Layout native stack header", () => {
  it("공통 header는 navigation theme에 색을 맡기고 system back과 hairline 없는 외형을 유지한다", async () => {
    signedInWith({ kind: "ready" });

    await render(<Layout />);

    expect(mockNavigatorOptions.current).toMatchObject({
      headerBackButtonDisplayMode: "minimal",
      headerShadowVisible: false,
    });
    expect(mockNavigatorOptions.current).not.toHaveProperty("contentStyle");
    expect(mockNavigatorOptions.current).not.toHaveProperty("headerStyle");
    expect(mockNavigatorOptions.current).not.toHaveProperty("headerTintColor");
    expect(mockNavigatorOptions.current).not.toHaveProperty("headerTitleStyle");
  });

  it("홈과 push 화면의 native title을 라우트에서 선언한다", async () => {
    signedInWith({ kind: "ready" });

    await render(<Layout />);

    expect(mockRouteOptions.index).toMatchObject({
      headerShown: true,
      title: "채팅",
    });
    expect(mockRouteOptions["chats/[id]"]).toMatchObject({
      headerShown: true,
      title: "새 채팅",
    });
    expect(mockRouteOptions["settings/index"]).toMatchObject({
      headerShown: true,
      title: "설정",
    });
    expect(mockRouteOptions["settings/display-name"]).toBeUndefined();
  });

  it("설정 화면만 grouped background를 native header까지 이어 쓴다", async () => {
    signedInWith({ kind: "ready" });

    await render(<Layout />);

    expect(mockRouteOptions["settings/index"]).toMatchObject({
      headerStyle: {
        backgroundColor: mockNavigationTheme.current.colors.background,
      },
    });
    expect(mockRouteOptions.index).not.toHaveProperty("headerStyle");
    expect(mockRouteOptions["chats/[id]"]).not.toHaveProperty("headerStyle");
  });

  it("온보딩 두 단계의 제목을 native header에 선언한다", async () => {
    signedInWith({ kind: "onboarding", step: "nickname" });

    await render(<Layout />);

    expect(mockRouteOptions["onboarding/nickname"]).toMatchObject({
      headerShown: true,
      title: "닉네임을 정해 주세요",
    });
    expect(mockRouteOptions["onboarding/username"]).toMatchObject({
      headerShown: true,
      title: "아이디를 정해 주세요",
    });
  });

  it("이메일 화면의 system back은 route path 대신 로그인을 읽는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "signedOut" });

    await render(<Layout />);

    expect(mockRouteOptions["sign-in/email"]).toMatchObject({
      headerBackTitle: "로그인",
      headerShown: true,
      title: "이메일",
    });
  });
});

describe("Layout 인증 가드", () => {
  it("ready면 index만 마운트한다", async () => {
    signedInWith({ kind: "ready" });

    await render(<Layout />);

    expect(screen.getByText("screen:index")).toBeTruthy();
    expect(screen.queryByText("screen:sign-in")).toBeNull();
  });

  it("signedOut이면 sign-in 세 화면만 마운트한다", async () => {
    mockUseAuth.mockReturnValue({ kind: "signedOut" });

    await render(<Layout />);

    for (const name of ["sign-in/index", "sign-in/email", "sign-in/code"]) {
      expect(screen.getByText(`screen:${name}`)).toBeTruthy();
    }

    // 여기서 index가 보이면 미로그인 사용자가 인증 화면을 그대로 본다는 뜻이다.
    // getByText는 완전 일치라 "screen:sign-in/index"와 부딪히지 않는다.
    expect(screen.queryByText("screen:index")).toBeNull();
  });

  // 미로그인 상태에서는 프로필 조회가 꺼져 있어 판정이 영영 loading이다.
  // 인증보다 프로필을 먼저 보면 로그인 화면 대신 스피너가 남는다.
  it("미로그인 상태에서는 프로필 판정이 로그인 화면을 가리지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "signedOut" });
    mockUseProfileGate.mockReturnValue({ kind: "loading" });

    await render(<Layout />);

    expect(screen.getByText("screen:sign-in/index")).toBeTruthy();
  });

  it("loading 동안에는 어느 화면도 마운트하지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "loading" });

    await render(<Layout />);

    expect(screen.queryByText("screen:index")).toBeNull();
    expect(screen.queryByText("screen:sign-in/index")).toBeNull();
  });

  it("failed면 이유를 표시하고 어느 화면도 마운트하지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "failed", reason: "환경변수 없음" });

    await render(<Layout />);

    expect(screen.getByText(MISSING_ENV)).toBeTruthy();
    expect(screen.queryByText("screen:index")).toBeNull();
    expect(screen.queryByText("screen:sign-in/index")).toBeNull();
  });

  // `다시 시도`를 일부러 넣지 않았다. failed는 빌드 타임 상수에서만 나와
  // 재시도해도 같은 분기로 되돌아온다 — 부재가 결정이므로 여기서 못박는다.
  it("failed에 다시 시도 버튼을 두지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "failed", reason: "환경변수 없음" });

    await render(<Layout />);

    expect(screen.queryByText("다시 시도")).toBeNull();
  });
});

describe("Layout 온보딩 가드", () => {
  it("미완료 프로필이면 온보딩 스택만 마운트한다", async () => {
    signedInWith({ kind: "onboarding", step: "nickname" });

    await render(<Layout />);

    for (const name of [
      "onboarding/index",
      "onboarding/nickname",
      "onboarding/username",
    ]) {
      expect(screen.getByText(`screen:${name}`)).toBeTruthy();
    }
    // index가 함께 마운트되면 뒤로 가서 앱에 들어갈 수 있다.
    expect(screen.queryByText("screen:index")).toBeNull();
  });

  it("표시 이름이 있으면 온보딩을 마운트하지 않는다", async () => {
    signedInWith({ kind: "ready" });

    await render(<Layout />);

    expect(screen.queryByText("screen:onboarding/index")).toBeNull();
  });

  it("프로필을 불러오는 동안에는 어느 화면도 마운트하지 않는다", async () => {
    signedInWith({ kind: "loading" });

    await render(<Layout />);

    expect(screen.queryByText("screen:index")).toBeNull();
    expect(screen.queryByText("screen:onboarding/index")).toBeNull();
  });
});

// 아래 둘을 온보딩으로 흘려보내면 이미 이름을 정한 사용자가 다시 입력하게 되고,
// 저장은 또 같은 이유로 실패한다.
describe("Layout 프로필 오류 가드", () => {
  it("조회 실패는 재시도 가능한 오류로 보여준다", async () => {
    signedInWith({
      kind: "failed",
      retry: jest.fn(),
      retrying: false,
    });

    await render(<Layout />);

    expect(screen.getByText(FETCH_FAILED)).toBeTruthy();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeTruthy();
    expect(screen.queryByText("screen:onboarding/index")).toBeNull();
  });

  it("재시도 중에는 버튼을 잠근다", async () => {
    signedInWith({ kind: "failed", retry: jest.fn(), retrying: true });

    await render(<Layout />);

    expect(screen.getByRole("button", { name: "다시 시도" })).toBeDisabled();
  });

  // 이 판정에는 권한 오류도 들어온다(세션이 서버에서 폐기된 경우 등). 다시
  // 눌러도 영원히 같은 실패라, 재시도만 두면 강제 종료 말고 나갈 길이 없다.
  it("조회 실패 화면에도 로그아웃 탈출구를 둔다", async () => {
    signedInWith({ kind: "failed", retry: jest.fn(), retrying: false });

    await render(<Layout />);

    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
  });

  it("행 없음은 온보딩이 아니라 무결성 오류로 보여준다", async () => {
    signedInWith({ kind: "missing" });

    await render(<Layout />);

    expect(screen.getByText(INTEGRITY)).toBeTruthy();
    expect(screen.queryByText("screen:onboarding/index")).toBeNull();
    expect(screen.queryByText("screen:index")).toBeNull();
  });

  // 이 화면에서는 설정에 닿을 수 없다. 탈출구가 없으면 앱이 막다른 길이 된다.
  it("무결성 오류에는 로그아웃 탈출구를 둔다", async () => {
    signedInWith({ kind: "missing" });

    await render(<Layout />);

    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
  });
});
