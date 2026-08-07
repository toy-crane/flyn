import { Spinner, Typography, useThemeColor } from "heroui-native";
import { useSyncExternalStore } from "react";
import type { StreamingStore } from "./streaming-store";

/**
 * 지금 받고 있는 응답 한 덩어리. 실제 text가 오기 전에는 자리에 수동형 진행만
 * 서고, 첫 글자가 오면 진행 표시 없이 응답만 남는다
 * (docs/decisions/ai-chat-experience.md). 반복 애니메이션이나 cursor는 두지
 * 않는다(docs/decisions/native-motion.md).
 */
export function StreamingMessage({ store }: { store: StreamingStore }) {
  // 스스로 나타나는 수동형 진행이라 중립 회색이다
  // (docs/decisions/apple-hig-with-app-theme.md).
  const neutral = useThemeColor("muted");
  const text = useSyncExternalStore(store.subscribe, store.get);

  if (!text) {
    return (
      <Spinner
        accessibilityLabel="응답 생성 중"
        className="ml-2 self-start"
        color={neutral}
        size="sm"
        testID="assistant-response-spinner"
      />
    );
  }

  return <Typography selectable>{text}</Typography>;
}
