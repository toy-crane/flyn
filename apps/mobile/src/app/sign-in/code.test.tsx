import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../../lib/supabase", () => ({
  supabase: { auth: { signInWithOtp: jest.fn(), verifyOtp: jest.fn() } },
  supabaseConfigured: true,
}));

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);

import { supabase } from "../../lib/supabase";
import { setSearchParams } from "../../test-support/expo-router";
import CodeScreen from "./code";

const mockAuth = supabase.auth as unknown as { verifyOtp: jest.Mock };
const FIELD = "인증 코드 6자리";
const SUBMIT = "로그인";
const EMAIL = "me@example.test";
const INVALID_CODE_COPY = /코드가 올바르지 않거나 만료/;
const RAW_VENDOR_COPY = /Token has expired/;

async function typeAndSubmit(code: string) {
  await fireEvent.changeText(screen.getByLabelText(FIELD), code);
  await fireEvent.press(screen.getByText(SUBMIT));
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  setSearchParams({ email: EMAIL });
});

describe("CodeScreen", () => {
  it("붙여넣은 코드에서 숫자만 남긴다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />);

    // maxLength로 앞부분만 잘리면 6자로 보여도 검증은 실패한다.
    await typeAndSubmit("코드: 448183");

    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      token: "448183",
      type: "email",
    });
  });

  it("6자리를 채워야 코드를 검증한다", async () => {
    mockAuth.verifyOtp.mockResolvedValue({ error: null });
    await render(<CodeScreen />);

    await typeAndSubmit("12345");
    expect(mockAuth.verifyOtp).not.toHaveBeenCalled();

    await typeAndSubmit("123456");
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
    await render(<CodeScreen />);

    await typeAndSubmit("123456");

    expect(screen.getByText(INVALID_CODE_COPY)).toBeTruthy();
    expect(screen.queryByText(RAW_VENDOR_COPY)).toBeNull();
  });

  // 헤더 뒤로가기가 그 역할을 한다.
  it("다른 이메일로 받기 버튼을 두지 않는다", async () => {
    await render(<CodeScreen />);

    expect(screen.queryByText("다른 이메일로 받기")).toBeNull();
  });

  // 딥링크로 이 화면에 바로 오면 주소가 없다. 그대로 보내면 email: undefined로
  // 검증을 때린다.
  it("주소 없이 열리면 검증하지 않는다", async () => {
    setSearchParams({});
    await render(<CodeScreen />);

    await typeAndSubmit("123456");

    expect(mockAuth.verifyOtp).not.toHaveBeenCalled();
  });
});
