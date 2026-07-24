import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Text, View } from "react-native";

import type { HealthState } from "@/lib/health";

interface Props {
  state: HealthState;
}

export function HealthCard({ state }: Props) {
  return (
    <View className="gap-3 rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900">
      <View className="flex-row items-center gap-2">
        <StatusIcon state={state} />
        <Text className="font-semibold text-base text-black dark:text-white">
          {headline(state)}
        </Text>
      </View>
      <Text className="text-neutral-600 text-sm dark:text-neutral-400">
        {detail(state)}
      </Text>
    </View>
  );
}

function StatusIcon({ state }: Props) {
  if (state.kind === "loading") {
    return <ActivityIndicator />;
  }

  const ok = state.kind === "ok";

  return (
    <SymbolView
      name={ok ? "checkmark.circle.fill" : "xmark.circle.fill"}
      size={20}
      tintColor={ok ? "#34c759" : "#ff3b30"}
    />
  );
}

function headline(state: HealthState) {
  switch (state.kind) {
    case "loading":
      return "API 확인 중";
    case "ok":
      return `API ${state.health.status}`;
    default:
      return "API 연결 실패";
  }
}

function detail(state: HealthState) {
  switch (state.kind) {
    case "loading":
      return "헬스체크 응답을 기다리는 중입니다.";
    case "ok":
      return `${state.health.service} · ${state.health.time}`;
    default:
      return state.message;
  }
}
