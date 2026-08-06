import { Text, View } from "react-native";

/**
 * native header의 title 자리에 두 줄을 세운다. 화면이 나르는 결정(생성 스텝의
 * 이전 선택, 대화의 시나리오와 역할)이 본문을 차지하지 않게 하는 자리다.
 *
 * HeroUI `Typography`를 쓰지 않는다 — `Typography`의 body는 16pt에 자체 Dynamic
 * Type ramp를 걸어서, 같은 스택의 기본 header title(17pt semibold)과 나란히 서면
 * 두 줄짜리만 다른 크기로 읽힌다. 크기는 플랫폼 관용을 따른다
 * (docs/decisions/apple-hig-with-app-theme.md).
 *
 * 색이 `foreground`인 것은 이 자리의 선택이 아니라 수렴이다. navigation
 * bridge가 이미 React Navigation의 `colors.text`를 `foreground`에 매어 두어
 * (components/navigation/navigation-theme.ts) 같은 스택의 한 줄짜리 title은
 * 전부 그 색으로 나가고 있었다 — 여기만 플랫폼 색으로 남을 이유가 없다
 * (docs/decisions/uniwind-css-theme.md).
 */
export function HeaderTitles({
  subtitle,
  title,
}: {
  subtitle: string | null;
  title: string;
}) {
  return (
    <View className="items-center">
      <Text
        className="font-semibold text-foreground text-header-title"
        numberOfLines={1}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          className="mt-0.5 text-header-subtitle text-muted"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
