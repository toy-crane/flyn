import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { LaunchChecking, LaunchFailed } from "../components/launch";
import { queryClient } from "../lib/query-client";
import { useAuth } from "../lib/use-auth";

// useAuth 구독은 여기 한 곳뿐이다 — 화면들은 가드 결과만 받는다.
function Routes() {
  const auth = useAuth();

  if (auth.kind === "loading") {
    return <LaunchChecking />;
  }

  if (auth.kind === "failed") {
    // "인증 실패:" 접두사를 떼었다. reason이 이미 무엇을 고쳐야 하는지 말하는
    // 문장이고, 접두사는 사용자가 뭘 잘못한 것처럼 읽히게 한다.
    return <LaunchFailed reason={auth.reason} />;
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
