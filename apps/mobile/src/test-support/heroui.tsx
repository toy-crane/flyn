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
