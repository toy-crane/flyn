import { hide as hideSplashScreen } from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ScreenLoading } from "@/shared/ui/screen-loading";

/**
 * 로그인과 필수 프로필 확인은 같은 화면 수명 안에서 하나의 대기로 센다.
 *
 * 앱을 열었으니 앱이 열리는 중이라는 것은 사용자가 이미 안다. 화면에는 글자 없이
 * 진행 표시만 두고, 무엇을 확인하는지는 화면 읽기 이름으로만 전한다.
 */
export function SessionCheckingScreen({
  phase = "session",
}: {
  phase?: "session" | "profile";
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (visible) {
      hideSplashScreen();
    }
  }, [visible]);
  const label = phase === "session" ? "로그인 상태 확인 중" : "프로필 확인 중";
  return (
    <View
      accessibilityLabel={visible ? undefined : label}
      accessibilityState={{ busy: true }}
      accessible={!visible}
      className="flex-1 bg-background"
      testID="session-checking"
    >
      {visible ? <ScreenLoading label={label} /> : null}
    </View>
  );
}
