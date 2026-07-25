import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithIdToken: jest.fn(),
      signInWithOtp: jest.fn(),
      updateUser: jest.fn(),
      verifyOtp: jest.fn(),
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
import { supabase } from "../lib/supabase";
import SignInScreen from "./sign-in";

const mockSignInAsync = signInAsync as jest.Mock;
const mockAuth = supabase.auth as unknown as {
  signInWithOtp: jest.Mock;
  verifyOtp: jest.Mock;
};

const SIGN_IN_FAILURE = /로그인 실패/;
const CODE_PROMPT = /6자리 코드를 입력하라/;

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

  it("코드 발송에 성공하면 코드 입력 단계로 넘어간다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    await render(<SignInScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("이메일 주소"),
      "me@example.test"
    );
    await pressSettled("코드 받기");

    expect(screen.getByText(CODE_PROMPT)).toBeTruthy();
    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      email: "me@example.test",
      options: { shouldCreateUser: true },
    });
  });

  it("코드 발송에 실패하면 이메일 단계에 머무른다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({
      error: { message: "rate limit" },
    });
    await render(<SignInScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("이메일 주소"),
      "me@example.test"
    );
    await pressSettled("코드 받기");

    expect(screen.getByText("로그인 실패: rate limit")).toBeTruthy();
    expect(screen.queryByText(CODE_PROMPT)).toBeNull();
  });

  it("6자리를 채워야 코드를 검증한다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<SignInScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("이메일 주소"),
      "me@example.test"
    );
    await pressSettled("코드 받기");

    // 5자리에서는 버튼이 잠겨 있어 검증이 일어나지 않는다.
    await fireEvent.changeText(screen.getByPlaceholderText("000000"), "12345");
    await pressSettled("로그인");
    expect(mockAuth.verifyOtp).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByPlaceholderText("000000"), "123456");
    await pressSettled("로그인");
    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      email: "me@example.test",
      token: "123456",
      type: "email",
    });
  });
});
