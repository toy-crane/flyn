import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithIdToken: jest.fn(),
      updateUser: jest.fn(),
    },
  },
  supabaseConfigured: true,
}));

// jest-expo가 목을 제공하지 않는 네이티브 모듈 — 버튼은 Pressable로 대체한다.
jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    AppleAuthenticationButton: ({ onPress }: { onPress: () => void }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: "button", onPress },
        React.createElement(Text, null, "Sign in with Apple")
      ),
    AppleAuthenticationButtonStyle: { BLACK: 2, WHITE: 0 },
    AppleAuthenticationButtonType: { SIGN_IN: 0 },
    AppleAuthenticationScope: { EMAIL: 1, FULL_NAME: 0 },
    signInAsync: jest.fn(),
  };
});

jest.mock("@react-native-google-signin/google-signin", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  const GoogleSigninButton = ({ onPress }: { onPress: () => void }) =>
    React.createElement(
      Pressable,
      { accessibilityRole: "button", onPress },
      React.createElement(Text, null, "Sign in with Google")
    );
  GoogleSigninButton.Color = { Dark: "dark", Light: "light" };
  GoogleSigninButton.Size = { Icon: 0, Standard: 1, Wide: 2 };
  return {
    GoogleSignin: {
      configure: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    GoogleSigninButton,
  };
});

import { signInAsync } from "expo-apple-authentication";
import SignInScreen from "./sign-in";

const mockSignInAsync = signInAsync as jest.Mock;

const SIGN_IN_FAILURE = /로그인 실패/;

/** 눌러서 생긴 비동기 로그인 플로우까지 act 안에서 정리한다. */
async function pressSettled(label: string) {
  await fireEvent.press(screen.getByText(label));
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("SignInScreen", () => {
  it("Apple과 Google 로그인 버튼을 렌더한다", async () => {
    await render(<SignInScreen />);

    expect(screen.getByText("Sign in with Apple")).toBeTruthy();
    expect(screen.getByText("Sign in with Google")).toBeTruthy();
  });

  it("취소(ERR_REQUEST_CANCELED)는 에러로 표시하지 않는다", async () => {
    mockSignInAsync.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });
    await render(<SignInScreen />);

    await pressSettled("Sign in with Apple");

    expect(screen.queryByText(SIGN_IN_FAILURE)).toBeNull();
  });

  it("로그인 실패는 이유와 함께 표시한다", async () => {
    mockSignInAsync.mockRejectedValue(new Error("boom"));
    await render(<SignInScreen />);

    await pressSettled("Sign in with Apple");

    expect(screen.getByText("로그인 실패: boom")).toBeTruthy();
  });
});
