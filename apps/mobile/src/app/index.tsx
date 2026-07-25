import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CardError } from "../components/card";
import { HealthStatus } from "../components/health-status";
import { ScratchNotes } from "../components/scratch-notes";
import { ServerStats } from "../components/server-stats";
import { signOut } from "../lib/auth/sign-out";

export default function SkeletonScreen() {
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // 성공하면 _layout의 가드가 sign-in으로 보낸다. 실패는 아무 일도 안 일어난 것처럼
  // 보이므로 반드시 표시한다.
  const handleSignOut = useCallback(async () => {
    setSignOutError(null);
    const result = await signOut();

    if (result) {
      setSignOutError(result.error);
    }
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-slate-100 dark:bg-slate-950"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-6 px-6 py-16">
        <View className="gap-2">
          <Text className="font-medium text-sky-600 text-xs uppercase tracking-[3px] dark:text-sky-400">
            walking skeleton
          </Text>
          <Text className="font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
            flyn
          </Text>
          <Text className="text-base text-slate-600 leading-relaxed dark:text-slate-400">
            Apple·Google 또는 이메일 로그인으로 세션을 얻고, 아래 카드가 RLS로
            내 행만 CRUD 한다. 서버 전용 집계는 Hono 인증 게이트를 거친다. 제품
            화면은 아직 없다.
          </Text>
        </View>

        <HealthStatus />

        <ScratchNotes />

        <ServerStats />

        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-white/80 p-4 dark:bg-white/10"
          onPress={handleSignOut}
        >
          <Text className="font-semibold text-rose-600 dark:text-rose-400">
            로그아웃
          </Text>
        </Pressable>

        {signOutError ? (
          <CardError>로그아웃 실패: {signOutError}</CardError>
        ) : null}
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}
