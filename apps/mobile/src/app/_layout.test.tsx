import { render, screen } from "@testing-library/react-native";

// 실제 네비게이터 대신 가드 배선만 드러내는 최소 대역. guard가 참인 쪽의 자식만 남긴다.
jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Stack = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  Stack.Protected = ({
    guard,
    children,
  }: {
    guard: boolean;
    children: React.ReactNode;
  }) => (guard ? React.createElement(React.Fragment, null, children) : null);

  Stack.Screen = ({ name }: { name: string }) =>
    React.createElement(Text, null, `screen:${name}`);

  // theme/colors.ts가 Color.ios.<토큰>을 모듈 로드 시점에 읽는다. 여기서 빠뜨리면
  // Color가 undefined가 되어 색과 무관한 이 테스트가 로드 단계에서 통째로 죽는다.
  // 실물 색 모듈만 되살린다 — requireActual("expo-router")는 네비게이터까지 끌어온다.
  return { Color: jest.requireActual("expo-router/build/color").Color, Stack };
});

// launch 화면이 SwiftUI다. 목이 없으면 불투명한 네이티브 뷰 하나로 그려져
// 아래 failed 단언이 문구를 찾지 못한다.
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

import { useAuth } from "../lib/use-auth";
import Layout from "./_layout";

const mockUseAuth = useAuth as jest.Mock;
const MISSING_ENV = /환경변수 없음/;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Layout 가드", () => {
  it("ready면 index만 마운트한다", async () => {
    mockUseAuth.mockReturnValue({ kind: "ready", userId: "user-1" });

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

  // 스펙 §8이 요구한 `다시 시도`를 일부러 넣지 않았다. failed는 빌드 타임 상수에서만
  // 나와 재시도해도 같은 분기로 되돌아온다 — 부재가 결정이므로 여기서 못박는다.
  it("failed에 다시 시도 버튼을 두지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "failed", reason: "환경변수 없음" });

    await render(<Layout />);

    expect(screen.queryByText("다시 시도")).toBeNull();
  });
});
