import { HeroUINativeProvider } from "heroui-native";
import type { ReactNode } from "react";

/**
 * HeroUI 컴포넌트는 provider 아래에서만 선다. 화면 테스트는 앱 root 밖에서 각
 * surface를 직접 렌더하므로 이 래퍼로 같은 계약을 세운다 —
 * `render(ui, { wrapper: HeroUIWrapper })`.
 */
// 스타일 안내 배너는 개발자에게 한 번 보여 주려는 것이라 렌더마다 다시 찍히면
// 테스트 출력만 덮는다.
const config = { devInfo: { stylingPrinciples: false } };

export function HeroUIWrapper({ children }: { children: ReactNode }) {
  return (
    <HeroUINativeProvider config={config}>{children}</HeroUINativeProvider>
  );
}

/**
 * jest는 Metro를 거치지 않아 CSS 토큰이 비어 있다(jest.config.js). 토큰 resolve
 * 한 단계만 대신 세우면 실제 HeroUI 컴포넌트가 칠하는 색을 단언할 수 있다.
 *
 * 역할이 뒤바뀌면 바로 드러나도록 값을 갈라 둔다. 실제 팔레트가 아니라 자리다 —
 * 값의 원본은 `global.css`다.
 */
export const THEME_TOKEN_STUBS: Record<string, string> = {
  "--color-accent": "#0000ff",
  "--color-accent-foreground": "#ffffff",
  "--color-danger": "#ff0000",
  "--color-muted": "#808080",
  "--color-success": "#00ff00",
  "--color-success-foreground": "#00ffff",
};

/**
 * `jest.mock("uniwind", () => require("...").uniwindThemeMock())`로 쓴다.
 * 팩토리 밖의 값을 참조할 수 없는 자리라 토큰 표까지 여기서 함께 준다.
 *
 * 표는 팩토리가 아니라 **렌더 시점에** 읽는다 — 이 모듈이 `heroui-native`를
 * 거쳐 `uniwind`를 부르는 순환 안에서 팩토리가 돌기 때문에, 그 순간에는 위
 * 상수가 아직 비어 있다.
 */
export function uniwindThemeMock(tokens?: Record<string, string>) {
  return {
    ...jest.requireActual("uniwind"),
    useCSSVariable: (names: string[]) =>
      names.map((name) => (tokens ?? THEME_TOKEN_STUBS)[name] ?? "invalid"),
  };
}

/**
 * HeroUI `Spinner`의 색은 SVG gradient stop으로만 남는다 — react-native-svg가
 * stop을 부모의 `gradient` prop(offset, ARGB 정수가 번갈아 오는 배열)으로 접어
 * 넣기 때문이다. 실제로 칠해진 색을 그 자리에서 꺼낸다. gradient는 signed
 * int32로 접히고 `processColor`는 unsigned를 주므로 축을 맞춰 돌려준다.
 */
export function paintedColors(node: unknown): number[] {
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
