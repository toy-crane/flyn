import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";
import { queryKeys } from "../lib/query-keys";
import { rpc } from "../lib/rpc";
import { Card, CardError, CardValue } from "./card";

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
    <Card label="server-only stats · Hono RPC + JWT 게이트">
      {stats.isPending ? <ActivityIndicator /> : null}

      {stats.isError ? <CardError>{stats.error.message}</CardError> : null}

      {stats.data ? (
        <CardValue>
          전체 {stats.data.totalNotes}개 · 소유자 {stats.data.distinctOwners}명
        </CardValue>
      ) : null}
    </Card>
  );
}
