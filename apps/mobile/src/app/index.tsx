import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { HealthCard } from "@/components/health-card";
import { API_BASE_URL, fetchHealth, type HealthState } from "@/lib/health";

export default function HomeScreen() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  const check = useCallback(async (signal?: AbortSignal) => {
    setState({ kind: "loading" });

    try {
      const health = await fetchHealth(signal);
      setState({ health, kind: "ok" });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    check(controller.signal);

    return () => controller.abort();
  }, [check]);

  const onRetry = useCallback(() => {
    check();
  }, [check]);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="gap-4 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      <HealthCard state={state} />

      <View className="gap-1">
        <Text className="text-neutral-500 text-xs uppercase dark:text-neutral-500">
          API base url
        </Text>
        <Text className="text-neutral-800 text-sm dark:text-neutral-200">
          {API_BASE_URL}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        className="items-center rounded-xl bg-blue-600 px-4 py-3 active:opacity-70"
        onPress={onRetry}
      >
        <Text className="font-semibold text-base text-white">다시 확인</Text>
      </Pressable>
    </ScrollView>
  );
}
