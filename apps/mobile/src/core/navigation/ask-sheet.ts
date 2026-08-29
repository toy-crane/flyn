import { Platform } from "react-native";

/**
 * AI에게 물어보기는 그 대화 위에 뜨는 시트다.
 *
 * `formSheet`나 BottomSheet가 아니라 `pageSheet`인 이유는, 키보드와 긴 메시지를
 * 가진 대화 하나이지 부분 높이의 조각이 아니기 때문이다. 시트의 배경, 모서리,
 * 전환과 닫기 제스처는 네이티브 Stack이 소유한다. 나가는 길은 닫기이지 뒤로
 * 가기가 아니다: 뒤에 있는 대화는 이 화면이 거쳐 온 화면이 아니다.
 *
 * 헤더도 그 대화의 헤더 그대로다. iOS에서는 메시지가 부드러운 스크롤 경계 뒤로
 * 지나가고, Android는 테마 배경을 유지한다. 물어보는 자리는 그것이 시작된
 * 대화처럼 읽히고 스크롤되므로, 헤더를 다르게 만날 이유가 없다.
 */
export function getAskSheetOptions(background: string, title: string) {
  return {
    headerBackVisible: false,
    presentation: "pageSheet" as const,
    title,
    ...(Platform.OS === "ios"
      ? {
          headerShadowVisible: false,
          headerTransparent: true,
          scrollEdgeEffects: { top: "soft" as const },
        }
      : {
          headerShadowVisible: false,
          headerStyle: { backgroundColor: background },
        }),
  };
}
