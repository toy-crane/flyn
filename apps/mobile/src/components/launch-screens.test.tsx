import { act, render, screen } from "@testing-library/react-native";
import { processColor } from "react-native";
import { HeroUIWrapper } from "../test-support/heroui";
import { LaunchChecking, LaunchFailed } from "./launch-screens";

// jest는 Metro를 거치지 않아 CSS 토큰이 비어 있다(jest.config.js). 토큰 resolve
// 한 단계만 대신 세우면 실제 HeroUI 컴포넌트가 칠하는 색을 단언할 수 있다.
// 팩토리는 import 시점에 돌지만 이 함수 본문은 렌더 시점에 돈다 —
// `mockThemeTokens`는 그때 이미 초기화돼 있다.
jest.mock("uniwind", () => ({
  ...jest.requireActual("uniwind"),
  useCSSVariable: (names: string[]) =>
    names.map((name) => mockThemeTokens[name] ?? "invalid"),
}));

// 역할이 뒤바뀌면 바로 드러나도록 회색과 파랑으로 갈라 둔다. 실제 팔레트 값이
// 아니라 자리다 — 값의 원본은 global.css다.
const NEUTRAL = "#808080";
const ACCENT = "#0000ff";
const mockThemeTokens: Record<string, string> = {
  "--color-accent": ACCENT,
  "--color-muted": NEUTRAL,
};

const MISSING_ENV = /환경변수 없음/;
const ANY_PROGRESS_COPY = /확인|불러오|로딩/;

/**
 * HeroUI `Spinner`의 색은 SVG gradient stop으로만 남는다 — react-native-svg가
 * stop을 부모의 `gradient` prop(offset, ARGB 정수가 번갈아 오는 배열)으로 접어
 * 넣기 때문이다. 실제로 칠해진 색을 그 자리에서 꺼낸다. gradient는 signed
 * int32로 접히고 `processColor`는 unsigned를 주므로 축을 맞춰 돌려준다.
 */
function paintedColors(node: unknown): number[] {
  if (Array.isArray(node)) {
    return node.flatMap(paintedColors);
  }
  if (!node || typeof node !== "object") {
    return [];
  }

  const { props, children } = node as {
    children?: unknown;
    props?: { gradient?: unknown };
  };
  const gradient = props?.gradient;
  const own = Array.isArray(gradient)
    ? gradient
        .filter((_, index) => index % 2 === 1)
        .map((color: number) => (color < 0 ? color + 2 ** 32 : color))
    : [];

  return [...own, ...paintedColors(children)];
}

describe("LaunchFailed", () => {
  it("무엇이 잘못됐는지 그대로 보여준다", async () => {
    await render(
      <LaunchFailed reason="Supabase 환경변수 없음 — .env.local을 설정하라." />,
      { wrapper: HeroUIWrapper }
    );

    expect(screen.getByText(MISSING_ENV)).toBeTruthy();
  });

  // failed는 오직 !supabaseConfigured에서만 나오고 그건 빌드 타임에 인라인되는
  // 값이라 런타임에 바뀔 수 없다. 누르면 같은 분기로 되돌아올 뿐이라
  // `다시 시도` 버튼은 위약이다. 부재를 의도로 못박는다.
  it("다시 시도 버튼을 두지 않는다 — 재시도할 것이 없다", async () => {
    await render(<LaunchFailed reason="Supabase 환경변수 없음" />, {
      wrapper: HeroUIWrapper,
    });

    expect(screen.queryByText("다시 시도")).toBeNull();
  });

  // iOS Dynamic Type ramp를 걸어야 시스템 글자 크기 설정을 따라간다.
  it("사유 문구를 body ramp에 걸어 시스템 글자 크기를 따른다", async () => {
    await render(<LaunchFailed reason="Supabase 환경변수 없음" />, {
      wrapper: HeroUIWrapper,
    });

    expect(screen.getByText(MISSING_ENV).props.dynamicTypeRamp).toBe("body");
  });
});

describe("LaunchChecking", () => {
  // 정상 경로에서는 한순간이라 문구가 오히려 깜빡임으로 보인다.
  it("문구 없이 스피너만 그린다", async () => {
    jest.useFakeTimers();

    try {
      await render(<LaunchChecking />, { wrapper: HeroUIWrapper });
      await act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole("progressbar")).toBeTruthy();
      expect(screen.queryByText(ANY_PROGRESS_COPY)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("짧은 판정에는 progress를 그리지 않고 실제 대기에서만 보여준다", async () => {
    jest.useFakeTimers();

    try {
      await render(<LaunchChecking />, { wrapper: HeroUIWrapper });

      expect(
        screen.queryByRole("progressbar", { includeHiddenElements: true })
      ).toBeNull();

      await act(() => {
        jest.advanceTimersByTime(199);
      });
      expect(
        screen.queryByRole("progressbar", { includeHiddenElements: true })
      ).toBeNull();

      await act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(screen.getByRole("progressbar")).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  // 수동형 indicator는 진행 중임을 조용히 알릴 뿐 누를 수 있는 것이 아니다.
  // Spinner 기본값(`color="default"`)은 브랜드 accent라 그대로 두면 파란 action
  // tint가 남는다(docs/specs/neutral-loading-indicators/spec.md).
  it("중립 회색으로 그린다 — 브랜드 accent를 쓰지 않는다", async () => {
    jest.useFakeTimers();

    try {
      await render(<LaunchChecking />, { wrapper: HeroUIWrapper });
      await act(() => {
        jest.advanceTimersByTime(200);
      });

      const painted = paintedColors(screen.toJSON());

      expect(painted).toContain(processColor(NEUTRAL));
      expect(painted).not.toContain(processColor(ACCENT));
    } finally {
      jest.useRealTimers();
    }
  });
});
