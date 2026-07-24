import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { fetchHealth } from "@/lib/api";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; body: string }
  | { kind: "error"; message: string };

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthState>({ kind: "loading" });

  const checkHealth = useCallback(() => {
    setHealth({ kind: "loading" });
    fetchHealth()
      .then((body) => setHealth({ body: JSON.stringify(body), kind: "ok" }))
      .catch((error: Error) =>
        setHealth({ kind: "error", message: error.message })
      );
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-6 bg-white px-6">
      <Text className="font-bold text-3xl text-slate-900">flyn</Text>
      <Text className="text-center text-base text-slate-500">
        모노레포 골격이 준비됐습니다.
      </Text>

      <View className="w-full gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <Text className="font-semibold text-slate-700 text-sm">
          Hono API 헬스체크
        </Text>
        {health.kind === "loading" && (
          <Text className="text-slate-500" testID="health-status">
            확인 중…
          </Text>
        )}
        {health.kind === "ok" && (
          <Text className="text-emerald-600" testID="health-status">
            OK — {health.body}
          </Text>
        )}
        {health.kind === "error" && (
          <Text className="text-red-600" testID="health-status">
            실패 — {health.message}
          </Text>
        )}
      </View>

      <Pressable
        className="rounded-full bg-slate-900 px-6 py-3 active:opacity-80"
        onPress={checkHealth}
      >
        <Text className="font-medium text-white">다시 확인</Text>
      </Pressable>
    </SafeAreaView>
  );
}
