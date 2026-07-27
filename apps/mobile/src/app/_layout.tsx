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
        <Stack.Screen name="sign-in/index" />
        {/* 헤더를 켜는 것은 이 둘뿐이다. 그림자·헤어라인을 덮어쓰지 않는다 —
            iOS 26의 글래스 캡슐 뒤로가기와 scroll edge effect가 손대지 않아야 온다. */}
        <Stack.Screen
          name="sign-in/email"
          options={{
            headerBackButtonDisplayMode: "minimal",
            headerShown: true,
            title: "이메일",
          }}
        />
        <Stack.Screen
          name="sign-in/code"
          options={{
            headerBackButtonDisplayMode: "minimal",
            headerShown: true,
            title: "인증 코드",
          }}
        />
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
