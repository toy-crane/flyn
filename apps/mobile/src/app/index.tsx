import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { HealthStatus } from "../components/health-status";
import { ScratchNotes } from "../components/scratch-notes";
import { ServerStats } from "../components/server-stats";

export default function SkeletonScreen() {
  const router = useRouter();

  const openSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  return (
    <>
      {/* 설정 진입은 네이티브 헤더 버튼이다(§4). RN 뷰를 헤더에 얹지 않으므로
          글래스 효과와 눌림 반응을 iOS가 그대로 준다. 스크롤 콘텐츠 안이 아니라
          형제로 둔다 — 화면에 그려지는 것이 아니라 헤더에 등록되는 것이다. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="설정"
          icon="gearshape"
          onPress={openSettings}
        />
      </Stack.Toolbar>

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
              내 행만 CRUD 한다. 서버 전용 집계는 Hono 인증 게이트를 거친다.
              제품 화면은 아직 없다.
            </Text>
          </View>

          <HealthStatus />

          <ScratchNotes />

          <ServerStats />
        </View>

        <StatusBar style="auto" />
      </ScrollView>
    </>
  );
}
