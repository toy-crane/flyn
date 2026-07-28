import { Text } from "@expo/ui";
import {
  accessibilityAddTraits,
  accessibilityLabel,
} from "@expo/ui/swift-ui/modifiers";
import { normalizeDisplayName } from "../../lib/display-name";

// Google 계정의 기본 아바타처럼 선명하게 구분되면서, 흰 글자와 4.5:1 이상의
// 대비가 나는 색만 쓴다. 전체 이름의 해시가 인덱스를 고르므로 이름이 같으면
// 앱을 다시 열어도 같은 색이다.
const PROFILE_AVATAR_COLORS = [
  "#1A73E8",
  "#C5221F",
  "#8430CE",
  "#137333",
  "#B06000",
  "#007B83",
  "#3F51B5",
  "#A50E0E",
  "#9C166B",
] as const;

const NAME_SEGMENTER =
  typeof Intl.Segmenter === "undefined"
    ? null
    : new Intl.Segmenter("ko", { granularity: "grapheme" });

interface ProfileAvatarProps {
  name: string;
  size?: number;
  testID?: string;
}

function colorForName(name: string) {
  let hash = 0;

  for (const character of name) {
    hash = Math.imul(hash, 31) + (character.codePointAt(0) ?? 0);
  }

  const paletteIndex =
    ((hash % PROFILE_AVATAR_COLORS.length) + PROFILE_AVATAR_COLORS.length) %
    PROFILE_AVATAR_COLORS.length;

  return PROFILE_AVATAR_COLORS[paletteIndex];
}

function initialForName(name: string) {
  const firstGrapheme = NAME_SEGMENTER
    ? [...NAME_SEGMENTER.segment(name)][0]?.segment
    : Array.from(name)[0];

  return firstGrapheme?.toLocaleUpperCase() ?? "?";
}

export function ProfileAvatar({ name, size = 88, testID }: ProfileAvatarProps) {
  const normalizedName = normalizeDisplayName(name).normalize("NFC");
  const initial = initialForName(normalizedName);
  const backgroundColor = colorForName(normalizedName);

  return (
    <Text
      modifiers={[
        accessibilityLabel(`${normalizedName} 아바타`),
        accessibilityAddTraits(["isImage"]),
      ]}
      style={{
        backgroundColor,
        borderRadius: size / 2,
        height: size,
        width: size,
      }}
      testID={testID}
      textStyle={{
        color: "#FFFFFF",
        fontSize: Math.round(size * 0.42),
        fontWeight: "600",
        textAlign: "center",
      }}
    >
      {initial}
    </Text>
  );
}
