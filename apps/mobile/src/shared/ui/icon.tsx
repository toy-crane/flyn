import { type ThemeColor, useThemeColor } from "heroui-native/hooks";
import ArrowDown from "lucide-react-native/icons/arrow-down";
import ArrowUp from "lucide-react-native/icons/arrow-up";
import Bookmark from "lucide-react-native/icons/bookmark";
import Check from "lucide-react-native/icons/check";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import ChevronUp from "lucide-react-native/icons/chevron-up";
import Copy from "lucide-react-native/icons/copy";
import Lock from "lucide-react-native/icons/lock";
import Pencil from "lucide-react-native/icons/pencil";
import RefreshCw from "lucide-react-native/icons/refresh-cw";
import Sparkles from "lucide-react-native/icons/sparkles";
import Square from "lucide-react-native/icons/square";
import X from "lucide-react-native/icons/x";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

const icons = {
  bookmark: Bookmark,
  check: Check,
  close: X,
  collapse: ChevronUp,
  copy: Copy,
  edit: Pencil,
  expand: ChevronDown,
  forward: ChevronRight,
  latest: ArrowDown,
  /** 교정 표식. 배울 표현이 붙은 자리마다 같은 모양으로 선다. */
  learn: Sparkles,
  /** 아직 열리지 않은 화. 제목은 보이고 여는 것만 막힌다. */
  locked: Lock,
  regenerate: RefreshCw,
  send: ArrowUp,
  stop: Square,
} as const;

const iconSizes = {
  lg: 24,
  md: 20,
  sm: 16,
  xs: 14,
} as const;

const iconSizeClassNames = {
  lg: "size-6",
  md: "size-5",
  sm: "size-4",
  xs: "size-3.5",
} as const satisfies Record<keyof typeof iconSizes, string>;

/**
 * 교정 채널의 보라. HeroUI의 시맨틱 집합에 이 뜻을 가진 역할이 없어서 앱이
 * 전역 CSS에 등재한 변수를 직접 읽는다.
 */
const LEARN_VARIABLE = "--learn";

const iconTones = {
  accent: "accent",
  accentForeground: "accent-foreground",
  danger: "danger-soft-foreground",
  default: "foreground",
  muted: "muted",
  // Not `success`. That one is a light, vivid green, and as a stroke it sits at
  // 2.19:1 against a white field — under the 3:1 a shape has to meet to be seen
  // at all. The soft foreground is the same hue carried toward `foreground`, so
  // it still reads as green while separating from the surface in both schemes.
  success: "success-soft-foreground",
} as const satisfies Record<string, ThemeColor>;

export type IconName = keyof typeof icons;
export type IconSize = keyof typeof iconSizes;
export type IconTone = keyof typeof iconTones | "learn" | "expression";

export interface IconProps {
  /** Paints the shape solid instead of drawing its outline. */
  filled?: boolean;
  name: IconName;
  size?: IconSize;
  testID?: string;
  tone?: IconTone;
}

export function Icon({
  filled = false,
  name,
  size = "md",
  testID,
  tone = "default",
}: IconProps) {
  // 훅은 조건부로 부를 수 없으므로 공통 색과 전용 안내 색을 읽은 뒤 고른다.
  const themeColor = useThemeColor(
    tone === "learn" || tone === "expression" ? "accent" : iconTones[tone]
  );
  const learnColor = useCSSVariable(LEARN_VARIABLE);
  const expressionColor = useCSSVariable("--expression");
  let color: string = themeColor;
  if (tone === "expression") {
    color = String(expressionColor);
  }
  if (tone === "learn") {
    color = String(learnColor);
  }
  const IconComponent = icons[name];
  const pixelSize = iconSizes[size];

  return (
    <View
      accessibilityElementsHidden
      className={iconSizeClassNames[size]}
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      <IconComponent
        accessible={false}
        color={color}
        size={pixelSize}
        strokeWidth={2}
        // Spread rather than `fill={filled ? color : undefined}`: Lucide passes
        // whatever it receives down to the shape, and an explicit `undefined`
        // would replace the "none" that leaves every other icon an outline.
        {...(filled ? { fill: color } : {})}
      />
    </View>
  );
}
