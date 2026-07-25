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

  return { Stack };
});

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

  it("signedOut이면 sign-in만 마운트한다", async () => {
    mockUseAuth.mockReturnValue({ kind: "signedOut" });

    await render(<Layout />);

    expect(screen.getByText("screen:sign-in")).toBeTruthy();
    // 여기서 index가 보이면 미로그인 사용자가 인증 화면을 그대로 본다는 뜻이다.
    expect(screen.queryByText("screen:index")).toBeNull();
  });

  it("loading 동안에는 어느 화면도 마운트하지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "loading" });

    await render(<Layout />);

    expect(screen.queryByText("screen:index")).toBeNull();
    expect(screen.queryByText("screen:sign-in")).toBeNull();
  });

  it("failed면 이유를 표시하고 어느 화면도 마운트하지 않는다", async () => {
    mockUseAuth.mockReturnValue({ kind: "failed", reason: "환경변수 없음" });

    await render(<Layout />);

    expect(screen.getByText(MISSING_ENV)).toBeTruthy();
    expect(screen.queryByText("screen:index")).toBeNull();
    expect(screen.queryByText("screen:sign-in")).toBeNull();
  });
});
