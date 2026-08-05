import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("react-native-reanimated", () => {
  const { View: NativeView } = require("react-native");

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

  return {
    __esModule: true,
    default: { View: NativeView },
    Keyframe: MockKeyframe,
    ReduceMotion: { System: "system" },
  };
});

jest.mock("../../theme/app-theme", () => ({
  useColors: () => ({
    danger: "#d70015",
    inputFill: "#eeeeef",
    primary: "#0066ff",
    text: "#171719",
  }),
}));

import { CodeInput } from "./code-input";

const FIELD = "인증 코드 6자리";
const HIDDEN = { includeHiddenElements: true };

function noop() {
  // 값 변화를 보지 않는 테스트용
}

describe("CodeInput", () => {
  // 칸은 접근성 트리에서 감춰져 있다(스크린 리더는 필드 하나와 그 값을 읽어야지
  // 숫자 여섯 개를 따로 읽으면 안 된다). RNTL 기본 질의는 감춰진 요소를 건너뛰므로
  // 여기서만 명시적으로 포함시킨다 — 눈에는 보이는 것이 맞다.
  it("값의 각 자리를 칸에 나눠 보여준다", async () => {
    await render(<CodeInput onChangeText={noop} value="123456" />);

    for (const digit of ["1", "2", "3", "4", "5", "6"]) {
      expect(screen.getByText(digit, HIDDEN)).toBeTruthy();
    }
  });

  it("숫자 feedback은 Reduce Motion을 따르고 slot별 지연하지 않는다", async () => {
    await render(<CodeInput onChangeText={noop} value="123456" />);

    for (let slot = 0; slot < 6; slot += 1) {
      const entering = screen.getByTestId(`code-digit-${slot}`, HIDDEN).props
        .entering as {
        delayV?: number;
        durationMs?: number;
        reduceMotionV?: string;
      };

      expect(entering).toMatchObject({
        durationMs: 140,
        reduceMotionV: "system",
      });
      expect(entering.delayV).toBeUndefined();
    }
  });

  // 붙여넣기에는 "코드: 448183"처럼 숫자가 아닌 문자가 섞여 온다. TextInput에
  // maxLength를 걸면 onChangeText 이전에 잘려 "코드: 4"가 도착하므로, 자르지 않고
  // 받아서 숫자만 남긴 뒤 자른다. 이 컴포넌트가 그 규칙을 소유한다.
  it("붙여넣기에서 숫자만 남기고 6자리로 자른다", async () => {
    const onChangeText = jest.fn();

    await render(<CodeInput onChangeText={onChangeText} value="" />);
    fireEvent.changeText(screen.getByLabelText(FIELD), "코드: 448183");

    expect(onChangeText).toHaveBeenCalledWith("448183");
  });

  it("6자리를 넘겨 붙여넣어도 앞 6자리만 남긴다", async () => {
    const onChangeText = jest.fn();

    await render(<CodeInput onChangeText={onChangeText} value="" />);
    fireEvent.changeText(screen.getByLabelText(FIELD), "12345678");

    expect(onChangeText).toHaveBeenCalledWith("123456");
  });

  // 메일로 온 코드를 키보드 위에 띄우는 동작. 이 경로의 핵심이라 명시로 지킨다.
  it("oneTimeCode 자동완성을 켠다", async () => {
    await render(<CodeInput onChangeText={noop} value="" />);

    expect(screen.getByLabelText(FIELD).props.textContentType).toBe(
      "oneTimeCode"
    );
  });

  // 칸이 탭을 가져가면 키보드가 뜨지 않는다. 표시 레이어는 터치를 통과시켜야 한다.
  it("칸은 터치를 통과시킨다", async () => {
    await render(<CodeInput onChangeText={noop} value="1" />);

    expect(
      screen.getByTestId("code-input-boxes", HIDDEN).props.pointerEvents
    ).toBe("none");
  });

  it("검증 중에는 입력을 잠근다", async () => {
    await render(<CodeInput disabled onChangeText={noop} value="123456" />);

    expect(screen.getByLabelText(FIELD)).toBeDisabled();
  });

  it("현재 slot은 action 색, 오류 상태의 모든 slot은 danger 색을 쓴다", async () => {
    const { rerender } = await render(
      <CodeInput onChangeText={noop} value="1" />
    );

    expect(screen.getByTestId("code-slot-1", HIDDEN)).toHaveStyle({
      borderColor: "#0066ff",
    });
    expect(screen.getByTestId("code-slot-0", HIDDEN)).toHaveStyle({
      backgroundColor: "#eeeeef",
      borderColor: "transparent",
    });

    await rerender(<CodeInput invalid onChangeText={noop} value="1" />);

    expect(screen.getByTestId("code-slot-0", HIDDEN)).toHaveStyle({
      borderColor: "#d70015",
    });
    expect(screen.getByTestId("code-slot-5", HIDDEN)).toHaveStyle({
      borderColor: "#d70015",
    });
  });
});
