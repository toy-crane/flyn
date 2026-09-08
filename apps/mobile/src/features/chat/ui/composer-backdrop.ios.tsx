import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "heroui-native/hooks";
import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";

const MASK_COLORS = ["transparent", "rgba(0,0,0,0.35)", "black"] as const;
const MASK_LOCATIONS = [0, 0.55, 1] as const;

/** 입력창 위에서 시작해 하단 안전 영역까지 이어지는 시스템 재질. */
export function ComposerBackdrop({ height }: { height: number }) {
  const backgroundColor = useThemeColor("background");
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (active) {
          setReduceTransparency(enabled);
        }
      })
      .catch(() => {
        // 설정을 읽지 못하면 읽기 쉬운 단색 배경을 유지한다.
      });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (height <= 0) {
    return null;
  }

  return (
    <View
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{
        bottom: 0,
        height: height + 72,
        left: 0,
        position: "absolute",
        right: 0,
      }}
      testID="chat-composer-backdrop"
    >
      <MaskedView
        maskElement={
          <LinearGradient
            colors={MASK_COLORS}
            locations={MASK_LOCATIONS}
            style={StyleSheet.absoluteFill}
          />
        }
        style={StyleSheet.absoluteFill}
      >
        {reduceTransparency ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
        ) : (
          <BlurView
            intensity={64}
            style={StyleSheet.absoluteFill}
            tint="systemUltraThinMaterial"
          />
        )}
      </MaskedView>
    </View>
  );
}
