import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../../lib/supabase", () => ({
  supabase: { auth: { signInWithOtp: jest.fn(), verifyOtp: jest.fn() } },
  supabaseConfigured: true,
}));

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui", () =>
  require("../../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { supabase } from "../../lib/supabase";
import { routerStub } from "../../test-support/expo-router";
import EmailScreen from "./email";

const mockAuth = supabase.auth as unknown as { signInWithOtp: jest.Mock };
const FIELD = "이메일 주소";
const SUBMIT = "코드 받기";
const RATE_LIMIT_COPY = /요청이 너무 잦아요/;
const RAW_VENDOR_COPY = /rate limit/;

async function sendCodeTo(address: string) {
  await fireEvent.changeText(screen.getByLabelText(FIELD), address);
  await fireEvent.press(screen.getByText(SUBMIT));
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("EmailScreen", () => {
  it("코드 발송에 성공하면 코드 화면으로 넘어간다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    await render(<EmailScreen />);

    await sendCodeTo("me@example.test");

    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      email: "me@example.test",
      options: { shouldCreateUser: true },
    });
    expect(routerStub.push).toHaveBeenCalledWith({
      params: { email: "me@example.test" },
      pathname: "/sign-in/code",
    });
  });

  // 코드를 보낸 주소와 코드 화면이 검증할 주소가 갈리면 사용자는 이유를 알 수 없다.
  it("보낸 주소와 넘기는 주소가 같다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    await render(<EmailScreen />);

    await sendCodeTo("  me@example.test  ");

    const sent = mockAuth.signInWithOtp.mock.calls[0][0].email;
    const handed = routerStub.push.mock.calls[0][0].params.email;

    expect(handed).toBe(sent);
  });

  it("코드 발송에 실패하면 넘어가지 않고 각주로 알린다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({
      error: { message: "rate limit" },
    });
    await render(<EmailScreen />);

    await sendCodeTo("me@example.test");

    expect(routerStub.push).not.toHaveBeenCalled();
    // 원문("rate limit")이 아니라 한국어 문장이 나가야 한다.
    expect(screen.getByText(RATE_LIMIT_COPY)).toBeTruthy();
    expect(screen.queryByText(RAW_VENDOR_COPY)).toBeNull();
  });

  // 재진입으로 무시된 호출(IGNORED)은 성공이 아니다. 여기서 넘어가면 보내지도 않은
  // 코드의 입력 화면이 열린다.
  it("연타해도 한 번만 넘어간다", async () => {
    // 첫 호출을 붙잡아 둔다. 여기서 저절로 resolve되면 두 번째 누름이 재진입이
    // 아니라 정당한 새 호출이 되어 테스트가 아무것도 검증하지 못한다.
    let release: (value: { error: null }) => void = () => {
      // 아래에서 덮어쓴다
    };
    mockAuth.signInWithOtp.mockReturnValue(
      new Promise<{ error: null }>((resolve) => {
        release = resolve;
      })
    );
    await render(<EmailScreen />);

    await fireEvent.changeText(screen.getByLabelText(FIELD), "me@example.test");
    await fireEvent.press(screen.getByText(SUBMIT));
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(mockAuth.signInWithOtp).toHaveBeenCalledTimes(1);

    await act(async () => {
      release({ error: null });
      await Promise.resolve();
    });

    expect(routerStub.push).toHaveBeenCalledTimes(1);
  });
});
