import { View } from "react-native";

import { LoadingSpinner } from "./loading-spinner";

/**
 * 화면 전체가 기다리는 자리. 가운데에 진행 표시 하나만 선다.
 *
 * 무엇을 기다리는지는 사용자가 방금 한 행동이 이미 말해 주므로 문구를 두지 않는다.
 * 화면 읽기에는 같은 사실을 이름으로 전한다. 화면의 일부만 기다리는 자리는
 * 나머지 화면이 살아 있으므로 문구가 있는 `StatusLine`을 쓴다.
 */
export function ScreenLoading({
  label,
  testID,
}: {
  /** 화면 읽기로만 전하는 이름. 화면에는 보이지 않는다. */
  label: string;
  testID?: string;
}) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessible
      className="flex-1 items-center justify-center bg-background"
      testID={testID}
    >
      <LoadingSpinner sizeRole="standalone" />
    </View>
  );
}
