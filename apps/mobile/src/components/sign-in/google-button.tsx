import { useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  Text,
  useColorScheme,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  SOCIAL_BUTTON_HEIGHT,
  SOCIAL_BUTTON_RADIUS,
  socialFontSize,
  socialGapSize,
  socialGlyphSize,
} from "../../theme/buttons";

/**
 * Google 브랜딩 가이드라인이 규정하는 값. iOS 시맨틱 색이 아니라 **Google이 정한
 * 색**을 그대로 쓴다 — 배경·스트로크·라벨 색까지 가이드라인 항목이다.
 */
const GOOGLE = {
  dark: { background: "#131314", label: "#E3E3E3", stroke: "#8E918F" },
  light: { background: "#FFFFFF", label: "#1F1F1F", stroke: "#747775" },
} as const;

/**
 * 표준 컬러 "G" 로고. 벡터로 그리는 이유는 스펙이 로고 크기를 버튼 높이의
 * 비율로 정했기 때문이다 — Dynamic Type에 따라 크기가 계속 바뀌므로 래스터는
 * 정수배가 아닌 스케일에서 뭉개진다. 색과 형태는 손대지 않는다(가이드라인상
 * 리사이즈·리컬러·모노크롬 변환 금지).
 */
function GoogleMark({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 48 48" width={size}>
      <Path
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        fill="#EA4335"
      />
      <Path
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        fill="#4285F4"
      />
      <Path
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        fill="#FBBC05"
      />
      <Path
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        fill="#34A853"
      />
    </Svg>
  );
}

export function GoogleButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = useColorScheme() === "dark" ? GOOGLE.dark : GOOGLE.light;
  const glyph = socialGlyphSize();
  const gap = socialGapSize();

  const style = useCallback(
    ({ pressed }: PressableStateCallbackType): ViewStyle => ({
      alignItems: "center",
      backgroundColor: palette.background,
      // 스트로크는 안쪽으로 — 가이드라인이 1px inside stroke를 규정한다.
      borderColor: palette.stroke,
      borderCurve: "continuous",
      borderRadius: SOCIAL_BUTTON_RADIUS,
      borderWidth: 1,
      flexDirection: "row",
      height: SOCIAL_BUTTON_HEIGHT,
      // Apple 버튼처럼 콘텐츠를 가운데 정렬한다(좌측 정렬 변형이 아니다).
      justifyContent: "center",
      opacity: pressed ? 0.85 : 1,
      width: "100%",
    }),
    [palette]
  );

  return (
    <Pressable
      accessibilityLabel="Google로 계속하기"
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      {/* 간격은 marginRight 하나로만 만든다 — 컨테이너 gap과 겹치면 더해진다. */}
      <View style={{ marginRight: gap }}>
        <GoogleMark size={glyph} />
      </View>
      <Text
        style={{
          color: palette.label,
          fontSize: socialFontSize(),
          fontWeight: "600",
        }}
      >
        Google로 계속하기
      </Text>
    </Pressable>
  );
}
