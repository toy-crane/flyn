import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";
import { queryKeys } from "../lib/query-keys";
import { rpc } from "../lib/rpc";

async function fetchStats() {
  const res = await rpc.server["scratch-notes"].stats.$get();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await res.json();
}

export function ServerStats() {
  const stats = useQuery({
    queryFn: fetchStats,
    queryKey: queryKeys.serverStats,
  });

  return (
    <View className="w-full gap-1 rounded-2xl bg-white/80 p-5 dark:bg-white/10">
      <Text className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
        server-only stats · Hono RPC + JWT 게이트
      </Text>

      {stats.isPending ? <ActivityIndicator /> : null}

      {stats.isError ? (
        <Text className="font-semibold text-lg text-rose-600 dark:text-rose-400">
          {stats.error.message}
        </Text>
      ) : null}

      {stats.data ? (
        <Text className="font-semibold text-emerald-600 text-lg dark:text-emerald-400">
          전체 {stats.data.totalNotes}개 · 소유자 {stats.data.distinctOwners}명
        </Text>
      ) : null}
    </View>
  );
}
