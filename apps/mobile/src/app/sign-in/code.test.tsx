import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../../lib/supabase", () => ({
  supabase: { auth: { signInWithOtp: jest.fn(), verifyOtp: jest.fn() } },
  supabaseConfigured: true,
}));

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);

// HeroUINativeProvider가 insets 구독에 SafeAreaListener를 쓴다 — 네이티브 뷰라
// jest에서는 자리만 세운다.
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

import { supabase } from "../../lib/supabase";
import { setSearchParams } from "../../test-support/expo-router";
import { HeroUIWrapper } from "../../test-support/heroui";
import CodeScreen from "./code";

const mockAuth = supabase.auth as unknown as {
  signInWithOtp: jest.Mock;
  verifyOtp: jest.Mock;
};
const FIELD = "인증 코드 6자리";
const EMAIL = "me@example.test";
const LONG_EMAIL = "a-very-long-email-address-for-ui@example.test";
const INVALID_CODE_COPY = /코드가 올바르지 않거나 만료/;
const NETWORK_COPY = /인터넷에 연결/;
const RATE_LIMIT_COPY = /요청이 너무 잦아요/;
const RAW_VENDOR_COPY = /Token has expired/;
const RESEND = "코드 다시 받기";

async function typeCode(code: string) {
  await fireEvent.changeText(screen.getByLabelText(FIELD), code);
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  setSearchParams({ email: EMAIL });
});

afterEach(() => {
  jest.useRealTimers();
});

async function finishCooldown() {
  await act(async () => {
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
  });
}

describe("CodeScreen", () => {
  it("긴 이메일은 코드 안내와 분리해 전체 주소를 보여준다", async () => {
    setSearchParams({ email: LONG_EMAIL });

    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    expect(screen.getByText("6자리 코드를 입력해 주세요.")).toBeTruthy();
    expect(screen.getByText(LONG_EMAIL)).toBeTruthy();
  });

  it("붙여넣은 코드에서 숫자만 남기고 즉시 검증한다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    // maxLength로 앞부분만 잘리면 6자로 보여도 검증은 실패한다.
    await typeCode("코드: 448183");

    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      token: "448183",
      type: "email",
    });
  });

  it("6자리를 채워야 코드를 검증한다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    await typeCode("12345");
    expect(mockAuth.verifyOtp).not.toHaveBeenCalled();

    await typeCode("123456");
    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      token: "123456",
      type: "email",
    });
  });

  it("검증 실패는 원문 대신 한국어 각주로 알린다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({
      error: { message: "Token has expired" },
    });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    await typeCode("123456");

    expect(screen.getByText(INVALID_CODE_COPY)).toBeTruthy();
    expect(screen.queryByText(RAW_VENDOR_COPY)).toBeNull();
    expect(screen.getByLabelText(FIELD).props.value).toBe("");
  });

  it("별도 로그인 CTA 없이 여섯 자리에서 한 번만 자동 제출한다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    await typeCode("123456");
    await typeCode("123456");

    expect(screen.queryByText("로그인")).toBeNull();
    expect(mockAuth.verifyOtp).toHaveBeenCalledTimes(1);
  });

  // 딥링크로 이 화면에 바로 오면 주소가 없다. 그대로 보내면 email: undefined로
  // 검증을 때린다.
  it("주소 없이 열리면 검증하지 않는다", async () => {
    setSearchParams({});
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    await typeCode("123456");

    expect(mockAuth.verifyOtp).not.toHaveBeenCalled();
    expect(screen.getByText("이메일 주소를 다시 입력해 주세요.")).toBeTruthy();
  });

  it("검증 중에는 입력과 재전송을 잠그고 inline progress를 보여준다", async () => {
    let settle: ((value: { error: null }) => void) | undefined;
    mockAuth.verifyOtp.mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      })
    );
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    await typeCode("123456");

    expect(screen.getByLabelText(FIELD)).toBeDisabled();
    expect(screen.getByText("확인 중…")).toBeTruthy();

    await act(async () => {
      settle?.({ error: null });
      await Promise.resolve();
    });
  });

  it("첫 30초 동안 남은 시간을 보이고 끝나면 재전송을 연다", async () => {
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });

    expect(screen.getByText("30초 후 다시 받기")).toBeTruthy();

    await finishCooldown();

    expect(screen.getByRole("button", { name: RESEND })).not.toBeDisabled();
  });

  it("재전송에 성공하면 입력을 비우고 cooldown을 다시 시작한다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });
    await typeCode("123");
    await finishCooldown();

    await fireEvent.press(screen.getByRole("button", { name: RESEND }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: true },
    });
    expect(screen.getByLabelText(FIELD).props.value).toBe("");
    expect(screen.getByText("30초 후 다시 받기")).toBeTruthy();
  });

  it("서버가 더 긴 retry-after를 주면 그 시간으로 재전송을 잠근다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({
      error: {
        message:
          "For security purposes, you can only request this after 47 seconds.",
      },
    });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });
    await finishCooldown();

    await fireEvent.press(screen.getByRole("button", { name: RESEND }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("47초 후 다시 받기")).toBeTruthy();
    expect(screen.getByText(RATE_LIMIT_COPY)).toBeTruthy();
  });

  it("재전송 자체가 실패하면 만료된 action을 열어 둔다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({
      error: { message: "Network request failed" },
    });
    await render(<CodeScreen />, { wrapper: HeroUIWrapper });
    await finishCooldown();

    await fireEvent.press(screen.getByRole("button", { name: RESEND }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: RESEND })).not.toBeDisabled();
    expect(screen.getByText(NETWORK_COPY)).toBeTruthy();
  });
});
