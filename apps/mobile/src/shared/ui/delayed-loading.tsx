import { useEffect, useState } from "react";
import { View } from "react-native";

import { LoadingSpinner } from "./loading-spinner";

/** 빠른 조회에는 보이지 않는 단독 진행 표시. 대기 상태를 화면 읽기에 전한다. */
export function DelayedLoading({ testID }: { testID: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return visible ? (
    <View
      accessibilityLabel="불러오는 중"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      className="min-h-24 items-center justify-center"
      testID={testID}
    >
      <LoadingSpinner sizeRole="standalone" />
    </View>
  ) : null;
}
