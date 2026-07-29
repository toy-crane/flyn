import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("../../lib/supabase", () => ({
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

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

// jest-expo가 목을 제공하지 않는 네이티브 모듈 — 버튼은 Pressable로 대체한다.
// buttonType과 cornerRadius를 그대로 실어 보낸다: CONTINUE와 16은 App Store
// 가이드라인·세트감 요구라 "값이 넘어갔는가"를 단언할 수 있어야 한다.
jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    AppleAuthenticationButton: ({
      buttonType,
      cornerRadius,
      onPress,
    }: {
      buttonType: number;
      cornerRadius: number;
      onPress: () => void;
    }) =>
      React.createElement(
        Pressable,
        {
          accessibilityRole: "button",
          buttonType,
          cornerRadius,
          onPress,
          testID: "apple-button",
        },
        // 실물 라벨은 기기 로케일을 따른다. 테스트가 이 문자열에 기대면 안 되므로
        // 조회는 testID로 하고 이 문자열은 자리만 채운다.
        React.createElement(Text, null, "Apple")
      ),
    AppleAuthenticationButtonStyle: { BLACK: 2, WHITE: 0 },
    // 실제 enum 값. CONTINUE 키가 없으면 undefined가 넘어가고 테스트는 초록인 채
    // 아무것도 검증하지 않는다.
    AppleAuthenticationButtonType: { CONTINUE: 1, SIGN_IN: 0, SIGN_UP: 2 },
    AppleAuthenticationScope: { EMAIL: 1, FULL_NAME: 0 },
    signInAsync: jest.fn(),
  };
});

jest.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Error: "error", Success: "success" },
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

// GoogleSigninButton은 버렸다. GoogleSignin 모듈은 auth/google.ts가 아직 쓴다.
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    getTokens: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { signInAsync } from "expo-apple-authentication";
import { notificationAsync } from "expo-haptics";
import { routerStub } from "../../test-support/expo-router";
import SignInScreen from "./index";

const mockSignInAsync = signInAsync as jest.Mock;
const mockHaptic = notificationAsync as jest.Mock;
const GOOGLE = "Google로 계속하기";
const SCAFFOLD_EYEBROW = /walking skeleton/i;

async function pressSettled(element: Parameters<typeof fireEvent.press>[0]) {
  await fireEvent.press(element);
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  // clearAllMocks는 호출 기록만 지우고 구현을 남겨 테스트가 선언 순서에 묶인다.
  jest.resetAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {
    // 얼럿 인자만 본다.
  });
  // resetAllMocks가 구현을 지우면 notificationAsync가 undefined를 돌려주고
  // haptics의 .catch가 거기서 터진다. 팩토리의 구현은 리셋을 못 넘긴다.
  mockHaptic.mockResolvedValue(undefined);
});

describe("SignInScreen", () => {
  it("Apple과 Google 로그인 버튼을 렌더한다", async () => {
    await render(<SignInScreen />);

    expect(screen.getByTestId("apple-button")).toBeTruthy();
    expect(screen.getByText(GOOGLE)).toBeTruthy();
  });

  // SIGN_IN이 아니라 CONTINUE다. 코너는 Google 버튼과 맞춘 16.
  it("Apple 버튼을 CONTINUE와 코너 16으로 세운다", async () => {
    await render(<SignInScreen />);

    const apple = screen.getByTestId("apple-button");

    expect(apple.props.buttonType).toBe(1);
    expect(apple.props.cornerRadius).toBe(16);
  });

  it("취소(ERR_REQUEST_CANCELED)는 에러로 표시하지 않는다", async () => {
    mockSignInAsync.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });
    await render(<SignInScreen />);

    await pressSettled(screen.getByTestId("apple-button"));

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  // 소셜 실패는 모달 흐름의 결과라 인라인이 아니라 얼럿이다. 그리고
  // 벤더 원문("boom")이 아니라 한국어 문장이 나가야 한다.
  it("로그인 실패는 얼럿으로 알리되 원문을 노출하지 않는다", async () => {
    mockSignInAsync.mockRejectedValue(new Error("boom"));
    await render(<SignInScreen />);

    await pressSettled(screen.getByTestId("apple-button"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "로그인하지 못했습니다",
      "잠시 후에 다시 시도해 주세요.",
      expect.anything()
    );
  });

  it("실패에는 진동으로도 알린다", async () => {
    mockSignInAsync.mockRejectedValue(new Error("boom"));
    await render(<SignInScreen />);

    await pressSettled(screen.getByTestId("apple-button"));

    expect(mockHaptic).toHaveBeenCalledWith("error");
  });

  // 취소는 실패가 아니다. 여기서 진동하면 사용자가 자기 행동을 오류로 읽는다.
  it("취소에는 진동하지 않는다", async () => {
    mockSignInAsync.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });
    await render(<SignInScreen />);

    await pressSettled(screen.getByTestId("apple-button"));

    expect(mockHaptic).not.toHaveBeenCalled();
  });

  it("헬퍼가 던져도 화면이 잠기지 않는다", async () => {
    // busy 플래그를 try/finally로 풀지 않으면 이후 모든 버튼이 조용히 죽는다.
    mockSignInAsync.mockRejectedValue(new Error("first"));
    await render(<SignInScreen />);

    await pressSettled(screen.getByTestId("apple-button"));
    await pressSettled(screen.getByTestId("apple-button"));

    expect(mockSignInAsync).toHaveBeenCalledTimes(2);
  });

  it("이메일로 계속하기는 이메일 화면으로 보낸다", async () => {
    await render(<SignInScreen />);

    await pressSettled(screen.getByText("이메일로 계속하기"));

    expect(routerStub.push).toHaveBeenCalledWith("/sign-in/email");
  });

  it("소셜과 이메일을 대등하게 두던 구분선을 없앴다", async () => {
    await render(<SignInScreen />);

    expect(screen.queryByText("또는")).toBeNull();
    expect(screen.queryByText(SCAFFOLD_EYEBROW)).toBeNull();
  });

  it("로그인 동작은 화면 하단 action 영역에 모은다", async () => {
    await render(<SignInScreen />);

    expect(screen.getByTestId("sign-in-flex-spacer")).toBeTruthy();
    expect(screen.getByTestId("sign-in-actions")).toBeTruthy();
    expect(screen.getByTestId("sign-in-scroll").props).toMatchObject({
      contentContainerStyle: {
        paddingBottom: 42,
        paddingTop: 83,
      },
      contentInsetAdjustmentBehavior: "never",
    });
  });

  it("Apple 로그인 중에는 전체 화면 대신 Apple 버튼 내부에 progress를 표시한다", async () => {
    mockSignInAsync.mockReturnValue(new Promise(() => undefined));
    await render(<SignInScreen />);

    await fireEvent.press(screen.getByTestId("apple-button"));

    expect(
      screen.getByTestId("apple-button-progress", {
        includeHiddenElements: true,
      })
    ).toBeTruthy();
    expect(
      screen.getByTestId("apple-button", { includeHiddenElements: true })
    ).toHaveTextContent("Apple");
    expect(screen.queryByTestId("sign-in-loading-overlay")).toBeNull();
    expect(
      screen.getByText(GOOGLE, { includeHiddenElements: true })
    ).toBeTruthy();
    expect(
      screen.getByText("이메일로 계속하기", {
        includeHiddenElements: true,
      })
    ).toBeTruthy();
  });

  it("Google 로그인 중에는 Google 버튼 내부에 progress를 표시한다", async () => {
    const {
      GoogleSignin,
    } = require("@react-native-google-signin/google-signin");
    GoogleSignin.signIn.mockReturnValue(new Promise(() => undefined));
    await render(<SignInScreen />);

    await fireEvent.press(screen.getByText(GOOGLE));

    expect(screen.getByTestId("google-button-progress")).toBeTruthy();
    expect(screen.getByText(GOOGLE)).toBeTruthy();
    expect(screen.queryByTestId("sign-in-loading-overlay")).toBeNull();
    expect(
      screen.getByTestId("apple-button", { includeHiddenElements: true })
    ).toBeTruthy();
    expect(
      screen.getByText("이메일로 계속하기", {
        includeHiddenElements: true,
      })
    ).toBeTruthy();
  });
});
