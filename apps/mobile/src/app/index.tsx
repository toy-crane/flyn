import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { HealthStatus } from "../components/health-status";

export default function SkeletonScreen() {
  return (
    <View className="flex-1 justify-center gap-6 bg-slate-100 px-6 dark:bg-slate-950">
      <View className="gap-2">
        <Text className="font-medium text-sky-600 text-xs uppercase tracking-[3px] dark:text-sky-400">
          walking skeleton
        </Text>
        <Text className="font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          flyn
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed dark:text-slate-400">
          Expo Router와 Uniwind가 붙어 있고, 아래 카드가 로컬 Hono API를 실제로
          호출한다. 제품 화면은 아직 없다.
        </Text>
      </View>

      <HealthStatus />

      <StatusBar style="auto" />
    </View>
  );
}
