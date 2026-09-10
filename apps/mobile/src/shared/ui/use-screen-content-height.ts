import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useState } from "react";
import { type LayoutChangeEvent, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** 네이티브 헤더와 하단 안전 영역을 제외한 스크롤 본문의 최소 높이. */
export function useScreenContentHeight() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  // iOS ScrollView의 프레임은 자동으로 더해지는 content inset까지 포함한다.
  // Android의 불투명한 네이티브 셸은 이미 본문 프레임 밖에 있다.
  const minHeight = Math.max(
    0,
    height - (Platform.OS === "ios" ? headerHeight + insets.bottom : 0)
  );

  return { contentContainerStyle: { minHeight }, onLayout };
}
