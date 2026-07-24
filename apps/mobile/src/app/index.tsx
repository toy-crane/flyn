import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { HealthStatus } from "../components/health-status";
import { ScratchNotes } from "../components/scratch-notes";
import { ServerStats } from "../components/server-stats";
import { useAuth } from "../lib/use-auth";

export default function SkeletonScreen() {
  const auth = useAuth();

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
            익명 로그인으로 세션을 얻고, 아래 카드가 RLS로 내 행만 CRUD 한다.
            서버 전용 집계는 Hono 인증 게이트를 거친다. 제품 화면은 아직 없다.
          </Text>
        </View>

        <HealthStatus />

        {auth.kind === "loading" ? (
          <View className="w-full rounded-2xl bg-white/80 p-5 dark:bg-white/10">
            <ActivityIndicator />
          </View>
        ) : null}

        {auth.kind === "failed" ? (
          <View className="w-full rounded-2xl bg-white/80 p-5 dark:bg-white/10">
            <Text className="font-semibold text-rose-600 dark:text-rose-400">
              인증 실패: {auth.reason}
            </Text>
          </View>
        ) : null}

        {auth.kind === "ready" ? (
          <>
            <ScratchNotes />
            <ServerStats />
          </>
        ) : null}
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}
