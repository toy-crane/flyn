import { hide as hideSplashScreen } from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusLine } from "@/shared/ui/status-line";

/** 로그인과 필수 프로필 확인은 같은 화면 수명 안에서 하나의 대기로 센다. */
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
  const label =
    phase === "session"
      ? "로그인 상태를 확인하고 있어요."
      : "프로필을 확인하고 있어요.";
  const announcement =
    phase === "session" ? "로그인 상태 확인 중" : "프로필 확인 중";
  return (
    <View
      accessibilityLabel={visible ? undefined : announcement}
      accessibilityState={{ busy: true }}
      accessible={!visible}
      className="flex-1 bg-background"
      testID="session-checking"
    >
      {visible ? (
        <View className="flex-1 items-center justify-center px-6">
          <StatusLine label={label} loading sizeRole="screen" />
        </View>
      ) : null}
    </View>
  );
}
