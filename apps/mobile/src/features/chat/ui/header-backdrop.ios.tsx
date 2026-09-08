import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "heroui-native/hooks";
import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";

import { HEADER_BACKDROP_FADE_HEIGHT } from "./header-backdrop-layout";

/** 네이티브 헤더와 상황 줄 뒤에서 한 번만 적용하는 상단 흐림. */
export function HeaderBackdrop({ height }: { height: number }) {
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
        // 설정을 읽지 못하면 선명한 단색 배경을 유지한다.
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
  return (
    <View
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{
        height: height + HEADER_BACKDROP_FADE_HEIGHT,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      }}
      testID="chat-header-backdrop"
    >
      <MaskedView
        maskElement={
          <LinearGradient
            colors={["black", "black", "transparent"]}
            locations={[0, height / (height + HEADER_BACKDROP_FADE_HEIGHT), 1]}
            style={StyleSheet.absoluteFill}
          />
        }
        style={StyleSheet.absoluteFill}
      >
        {reduceTransparency ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
        ) : (
          <>
            <BlurView
              intensity={100}
              style={StyleSheet.absoluteFill}
              tint="systemMaterial"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor, opacity: 0.65 },
              ]}
            />
          </>
        )}
      </MaskedView>
    </View>
  );
}
