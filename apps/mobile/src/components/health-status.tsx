import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { API_BASE_URL } from "../lib/api";

interface Health {
  service: string;
  status: string;
}

type HealthState =
  | { kind: "loading" }
  | { kind: "ready"; health: Health }
  | { kind: "failed"; reason: string };

function isHealth(value: unknown): value is Health {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.service === "string" &&
    typeof candidate.status === "string"
  );
}

async function fetchHealth(): Promise<Health> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body: unknown = await response.json();

  if (!isHealth(body)) {
    throw new Error("Unexpected response shape");
  }

  return body;
}

export function HealthStatus() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((health) => {
        if (!cancelled) {
          setState({ health, kind: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const reason =
            error instanceof Error ? error.message : "Unknown error";
          setState({ kind: "failed", reason });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="w-full rounded-2xl bg-white/80 p-5 dark:bg-white/10">
      <Text className="mb-2 text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
        API health
      </Text>

      {state.kind === "loading" ? <ActivityIndicator /> : null}

      {state.kind === "ready" ? (
        <Text className="font-semibold text-emerald-600 text-lg dark:text-emerald-400">
          {state.health.service} · {state.health.status}
        </Text>
      ) : null}

      {state.kind === "failed" ? (
        <Text className="font-semibold text-lg text-rose-600 dark:text-rose-400">
          {state.reason}
        </Text>
      ) : null}

      <Text className="mt-2 text-gray-500 text-xs dark:text-gray-400">
        {API_BASE_URL}
      </Text>
    </View>
  );
}
