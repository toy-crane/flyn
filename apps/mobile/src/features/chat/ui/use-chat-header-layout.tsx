import { type ReactNode, useCallback, useState } from "react";
import { type LayoutChangeEvent, Platform, View } from "react-native";

/** iOS 목록은 네이티브 헤더 뒤로 이어지고 상황 줄만 고정한다. */
export function useChatHeaderLayout(banner: ReactNode, topInset: number) {
  const [bannerHeight, setBannerHeight] = useState<number>();
  const hasBanner = banner !== undefined && banner !== null;
  const overlaysList = hasBanner && Platform.OS === "ios";
  const measureBanner = useCallback((event: LayoutChangeEvent) => {
    setBannerHeight(event.nativeEvent.layout.height);
  }, []);
  const bannerView = hasBanner ? (
    <View
      onLayout={overlaysList ? measureBanner : undefined}
      pointerEvents="none"
      style={
        overlaysList
          ? { left: 0, position: "absolute", right: 0, top: topInset }
          : undefined
      }
      testID="chat-banner"
    >
      {banner}
    </View>
  ) : null;

  return {
    aboveList: overlaysList ? null : bannerView,
    contentTopInset: overlaysList ? topInset + (bannerHeight ?? 0) : 0,
    // 높이를 모르는 목록을 먼저 만들면 위치 유지가 첫 장면을 배너 뒤로 밀 수 있다.
    listReady: !overlaysList || bannerHeight !== undefined,
    overlay: overlaysList ? bannerView : null,
    panelTopInset: overlaysList ? 0 : topInset,
  };
}
