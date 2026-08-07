import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { processColor } from "react-native";

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

// 네이티브 모듈이라 jest에서는 서지 않는다. 키보드를 피해 CTA를 올리는 일은
// 시뮬레이터가 확인하고, 여기서는 자리만 세운다.
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: require("react-native").View,
}));

// HeroUINativeProvider가 insets 구독에 SafeAreaListener를 쓴다 — 네이티브 뷰라
// jest에서는 자리만 세운다.
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

import { supabase } from "../../lib/supabase";
import { routerStub } from "../../test-support/expo-router";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../../test-support/heroui";
import EmailScreen from "./email";

const mockAuth = supabase.auth as unknown as { signInWithOtp: jest.Mock };
const FIELD = "이메일 주소";
const SUBMIT = "코드 받기";
const RATE_LIMIT_COPY = /요청이 너무 잦아요/;
const RAW_VENDOR_COPY = /rate limit/;
const ON_ACCENT = THEME_TOKEN_STUBS["--color-accent-foreground"];
const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];

function renderScreen() {
  return render(<EmailScreen />, { wrapper: HeroUIWrapper });
}

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
    await renderScreen();

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

  // 앞뒤 공백은 자동완성·붙여넣기에서 흔하다. 여기서 다듬지 않으면 코드를 보낸
  // 주소와 검증할 주소가 갈려 사용자는 이유를 알 수 없다. 둘이 같은지만 보면
  // 부족하다 — 제출 가능 판정이 안에서 trim하므로 공백을 그대로 보내도 통과한다.
  it("앞뒤 공백을 떼고 보내며 같은 주소를 넘긴다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({ error: null });
    await renderScreen();

    await sendCodeTo("  me@example.test  ");

    const sent = mockAuth.signInWithOtp.mock.calls[0][0].email;
    const handed = routerStub.push.mock.calls[0][0].params.email;

    expect(sent).toBe("me@example.test");
    expect(handed).toBe("me@example.test");
  });

  // 주소가 될 수 없는 값에는 CTA를 열지 않는다.
  it("주소 꼴이 아니면 제출을 잠근다", async () => {
    await renderScreen();

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText(FIELD), "me@example.test");

    expect(screen.getByRole("button", { name: SUBMIT })).not.toBeDisabled();
  });

  it("이메일 자동완성을 켠다", async () => {
    await renderScreen();

    expect(screen.getByLabelText(FIELD).props.autoComplete).toBe("email");
  });

  // getByLabelText는 accessibilityLabel로 닿으므로 이 단언이 없으면 눈에 보이는
  // label을 지워도 아무 테스트가 깨지지 않는다. label은 field 밖에 남는다
  // (docs/specs/input-form-style/spec.md).
  it("입력창 밖에 label을 보여준다", async () => {
    await renderScreen();

    expect(screen.getByText(FIELD)).toBeTruthy();
  });

  it("코드 발송에 실패하면 넘어가지 않고 각주로 알린다", async () => {
    mockAuth.signInWithOtp.mockResolvedValue({
      error: { message: "rate limit" },
    });
    await renderScreen();

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
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText(FIELD), "me@example.test");
    await fireEvent.press(screen.getByText(SUBMIT));
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(mockAuth.signInWithOtp).toHaveBeenCalledTimes(1);

    await act(async () => {
      release({ error: null });
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(routerStub.push).toHaveBeenCalledTimes(1);
  });

  // 단일 form의 submit은 화면 전체 overlay가 아니라 같은 자리의 button-local
  // progress다. 버튼 안 spinner는 중립 회색이 아니라 버튼 전경색을 따른다
  // (docs/decisions/apple-hig-with-app-theme.md).
  it("발송 중에는 버튼 자리에 버튼 전경색 progress를 그린다", async () => {
    mockAuth.signInWithOtp.mockReturnValue(new Promise(() => undefined));
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText(FIELD), "me@example.test");
    await fireEvent.press(screen.getByText(SUBMIT));

    const painted = paintedColors(screen.toJSON());

    // 버튼은 자리를 지키되 잠긴다 — 화면 전체를 덮는 overlay가 아니다.
    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
    expect(painted).toContain(processColor(ON_ACCENT));
    expect(painted).not.toContain(processColor(NEUTRAL));
  });
});
