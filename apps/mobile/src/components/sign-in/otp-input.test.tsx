import { fireEvent, render, screen } from "@testing-library/react-native";
import { type ReactElement, useState } from "react";

// 실제 `Keyframe`은 duration·reduceMotion을 밖으로 내주지 않는다. HeroUI가 같은
// 모듈의 나머지(`createAnimatedComponent`, `FadeIn` 등)를 쓰므로 이 클래스만
// 갈아 끼운다.
jest.mock("react-native-reanimated", () => {
  class MockKeyframe {
    config: unknown;
    durationMs?: number;
    reduceMotionV?: string;

    constructor(config: unknown) {
      this.config = config;
    }

    duration(value: number) {
      this.durationMs = value;
      return this;
    }

    reduceMotion(value: string) {
      this.reduceMotionV = value;
      return this;
    }
  }

  const actual = jest.requireActual("react-native-reanimated");

  return {
    ...actual,
    __esModule: true,
    default: actual.default,
    Keyframe: MockKeyframe,
    ReduceMotion: { System: "system" },
  };
});

import { HeroUIWrapper } from "../../test-support/heroui";
import { OtpInput } from "./otp-input";

const FIELD = "인증 코드 6자리";
const HIDDEN = { includeHiddenElements: true };

function noop() {
  // 값 변화를 보지 않는 테스트용
}

function renderInput(ui: ReactElement) {
  return render(ui, { wrapper: HeroUIWrapper });
}

/** 값을 화면이 소유하는 실제 사용 형태. 모션 판정은 값 변화 자체가 만든다. */
function ControlledOtpInput() {
  const [value, setValue] = useState("");

  return <OtpInput onChangeText={setValue} value={value} />;
}

function slotClassName(slot: number): string {
  return screen.getByTestId(`otp-slot-${slot}`, HIDDEN).props.className;
}

describe("OtpInput", () => {
  // 칸은 접근성 트리에서 감춰져 있다(스크린 리더는 필드 하나와 그 값을 읽어야지
  // 숫자 여섯 개를 따로 읽으면 안 된다). RNTL 기본 질의는 감춰진 요소를 건너뛰므로
  // 여기서만 명시적으로 포함시킨다 — 눈에는 보이는 것이 맞다.
  it("값의 각 자리를 칸에 나눠 보여준다", async () => {
    await renderInput(<OtpInput onChangeText={noop} value="123456" />);

    for (const digit of ["1", "2", "3", "4", "5", "6"]) {
      expect(screen.getByText(digit, HIDDEN)).toBeTruthy();
    }
  });

  // 붙여넣기에는 "코드: 448183"처럼 숫자가 아닌 문자가 섞여 온다. TextInput에
  // maxLength를 걸면 onChangeText 이전에 잘려 "코드: 4"가 도착하므로, 자르지 않고
  // 받아서 숫자만 남긴 뒤 자른다. HeroUI `InputOTP`가 탈락한 지점이 정확히 이것이라
  // 이 컴포넌트가 규칙을 소유한다.
  it("붙여넣기에서 숫자만 남기고 6자리로 자른다", async () => {
    const onChangeText = jest.fn();

    await renderInput(<OtpInput onChangeText={onChangeText} value="" />);
    fireEvent.changeText(screen.getByLabelText(FIELD), "코드: 448183");

    expect(onChangeText).toHaveBeenCalledWith("448183");
  });

  it("필드에 maxLength를 걸지 않는다 — 걸면 스크럽할 원문이 사라진다", async () => {
    await renderInput(<OtpInput onChangeText={noop} value="" />);

    expect(screen.getByLabelText(FIELD).props.maxLength).toBeUndefined();
  });

  it("6자리를 넘겨 붙여넣어도 앞 6자리만 남긴다", async () => {
    const onChangeText = jest.fn();

    await renderInput(<OtpInput onChangeText={onChangeText} value="" />);
    fireEvent.changeText(screen.getByLabelText(FIELD), "12345678");

    expect(onChangeText).toHaveBeenCalledWith("123456");
  });

  // 메일로 온 코드를 키보드 위에 띄우는 동작. 이 경로의 핵심이라 명시로 지킨다.
  it("oneTimeCode 자동완성을 켠다", async () => {
    await renderInput(<OtpInput onChangeText={noop} value="" />);

    expect(screen.getByLabelText(FIELD).props.textContentType).toBe(
      "oneTimeCode"
    );
  });

  // 직접 친 칸만 짧게 반응하고, AutoFill·붙여넣기는 최종 값을 즉시 보여준다
  // (docs/decisions/native-motion.md).
  it("직접 입력한 칸은 Reduce Motion을 따르는 짧은 피드백을 받는다", async () => {
    await renderInput(<ControlledOtpInput />);

    await fireEvent.changeText(screen.getByLabelText(FIELD), "1");

    expect(
      screen.getByTestId("otp-digit-0", HIDDEN).props.entering
    ).toMatchObject({ durationMs: 140, reduceMotionV: "system" });
  });

  it("한 번에 들어온 값은 애니메이션 없이 즉시 보여준다", async () => {
    await renderInput(<ControlledOtpInput />);

    await fireEvent.changeText(screen.getByLabelText(FIELD), "448183");

    for (let slot = 0; slot < 6; slot += 1) {
      expect(
        screen.getByTestId(`otp-digit-${slot}`, HIDDEN).props.entering
      ).toBeUndefined();
    }
  });

  // 칸이 탭을 가져가면 키보드가 뜨지 않는다. 표시 레이어는 터치를 통과시켜야 한다.
  it("칸은 터치를 통과시킨다", async () => {
    await renderInput(<OtpInput onChangeText={noop} value="1" />);

    expect(screen.getByTestId("otp-slots", HIDDEN).props.pointerEvents).toBe(
      "none"
    );
  });

  it("검증 중에는 입력을 잠근다", async () => {
    await renderInput(<OtpInput disabled onChangeText={noop} value="123456" />);

    expect(screen.getByLabelText(FIELD)).toBeDisabled();
  });

  // 값은 CSS 토큰이 칠하므로 여기서는 역할 이름까지만 고정한다.
  it("현재 칸은 accent, 오류 상태의 모든 칸은 danger 토큰을 쓴다", async () => {
    const { rerender } = await renderInput(
      <OtpInput onChangeText={noop} value="1" />
    );

    expect(slotClassName(1)).toContain("border-accent");
    expect(slotClassName(0)).toContain("border-transparent");
    expect(slotClassName(0)).toContain("bg-field");

    await rerender(<OtpInput invalid onChangeText={noop} value="1" />);

    expect(slotClassName(0)).toContain("border-danger");
    expect(slotClassName(5)).toContain("border-danger");
  });
});
