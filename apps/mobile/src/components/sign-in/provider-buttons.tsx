import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from "expo-apple-authentication";
import { Button } from "heroui-native";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useUniwind } from "uniwind";

/**
 * Apple과 Google은 한 세트다(docs/decisions/sign-in-methods.md). 두 버튼은
 * HeroUI 층 안에 서지만 외형은 각 브랜드 지침이 소유하므로 앱 토큰으로 다시
 * 칠하지 않는다(docs/decisions/uniwind-css-theme.md의 vendor 경계).
 *
 * Apple 버튼은 우리가 스타일링할 수 없으므로(style의 backgroundColor·
 * borderRadius는 동작하지 않고 App Store 가이드라인 위반이다) **Apple이
 * 기준이고 Google을 거기 맞춘다.**
 *
 * Apple은 수치를 문서로 주지 않고 "스타일을 바꿔도 콘텐츠가 이상적인 비율을
 * 유지한다"고만 한다. 그래서 시뮬레이터에서 실제로 렌더된
 * ASAuthorizationAppleIDButton을 3배율로 측정했다(312×48pt, iOS 26.5):
 *
 *   로고 글리프 높이 13.3pt = 높이의 27.8%
 *   라벨 캡 높이     13.3pt = 높이의 27.8%  ← 로고와 정확히 같다
 *   로고 → 라벨 간격  7.7pt = 높이의 16.0%
 *   로고+라벨 블록은 가운데 정렬(좌측 아님)
 *
 * 높이 52pt와 corner radius 16pt는 표현 계약이 정한 값이다
 * (docs/decisions/social-sign-in-presentation.md).
 */
const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 16;
/** 로고 높이와 라벨 캡 높이가 같은 지점 */
const GLYPH_SIZE = Math.round(BUTTON_HEIGHT * 0.278);
/** 그 캡 높이를 만드는 폰트 크기 (캡 ≈ 폰트 × 0.72) */
const LABEL_FONT_SIZE = Math.round(BUTTON_HEIGHT * 0.386);
const GLYPH_LABEL_GAP = Math.round(BUTTON_HEIGHT * 0.16);

/**
 * Google 브랜딩 가이드라인이 규정하는 값. 앱 테마가 아니라 **Google이 정한
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

export function AppleContinueButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useUniwind();

  return (
    // 벤더 뷰에는 disabled 손잡이가 없다. 표현 계약이 요구하는 대로 버튼을
    // 치우지 않고 자리에 둔 채 입력만 막는다.
    <View pointerEvents={disabled ? "none" : "auto"}>
      <AppleAuthenticationButton
        buttonStyle={
          theme === "dark"
            ? AppleAuthenticationButtonStyle.WHITE
            : AppleAuthenticationButtonStyle.BLACK
        }
        buttonType={AppleAuthenticationButtonType.CONTINUE}
        cornerRadius={BUTTON_RADIUS}
        onPress={onPress}
        // 명시적 크기는 선택이 아니다 — 없으면 버튼이 아예 렌더되지 않는다.
        // 네이티브 뷰라 Uniwind className이 닿지 않는 자리이기도 하다.
        style={{ height: BUTTON_HEIGHT, width: "100%" }}
      />
    </View>
  );
}

export function GoogleContinueButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useUniwind();
  const palette = theme === "dark" ? GOOGLE.dark : GOOGLE.light;

  return (
    <Button
      accessibilityLabel="Google로 계속하기"
      isDisabled={disabled}
      onPress={onPress}
      // 브랜드 값은 앱 토큰이 아니라서 `@theme`에 올리지 않는다. HeroUI가
      // 상호작용·접근성·press 피드백을 소유하고 외형만 여기서 덮는다.
      // 스트로크는 안쪽으로 — 가이드라인이 1px inside stroke를 규정한다.
      style={{
        backgroundColor: palette.background,
        borderColor: palette.stroke,
        borderRadius: BUTTON_RADIUS,
        borderWidth: 1,
        gap: GLYPH_LABEL_GAP,
        height: BUTTON_HEIGHT,
        width: "100%",
      }}
      testID="google-button"
      variant="outline"
    >
      <GoogleMark size={GLYPH_SIZE} />
      <Button.Label
        style={{
          color: palette.label,
          fontSize: LABEL_FONT_SIZE,
          fontWeight: "600",
        }}
      >
        Google로 계속하기
      </Button.Label>
    </Button>
  );
}
