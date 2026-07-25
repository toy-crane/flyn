import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { queryClient } from "../lib/query-client";
import { useAuth } from "../lib/use-auth";

// useAuth 구독은 여기 한 곳뿐이다 — 화면들은 가드 결과만 받는다.
function Routes() {
  const auth = useAuth();

  if (auth.kind === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-950">
        <ActivityIndicator />
      </View>
    );
  }

  if (auth.kind === "failed") {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6 dark:bg-slate-950">
        <Text className="text-center text-rose-600 dark:text-rose-400">
          인증 실패: {auth.reason}
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={auth.kind === "ready"}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={auth.kind === "signedOut"}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
}
