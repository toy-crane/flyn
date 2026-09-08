import { View } from "react-native";

/** Android는 흐림 없이 완료 안내 뒤의 대화를 가린다. */
export function ComposerBackdrop({
  height,
  variant = "composer",
}: {
  height: number;
  variant?: "composer" | "closing";
}) {
  if (variant !== "closing" || height <= 0) {
    return null;
  }
  return (
    <View
      accessibilityElementsHidden
      accessible={false}
      className="bg-background"
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ bottom: 0, height, left: 0, position: "absolute", right: 0 }}
      testID="chat-composer-backdrop"
    />
  );
}
