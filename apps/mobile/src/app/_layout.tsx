import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useMemo } from "react";
import { useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { LaunchChecking, LaunchFailed } from "../components/launch";
import {
  ProfileMissing,
  ProfileUnavailable,
} from "../components/profile/profile-unavailable";
import { signOut } from "../lib/auth/sign-out";
import { queryClient } from "../lib/query-client";
import { useAuth } from "../lib/use-auth";
import { useProfileGate } from "../lib/use-profile";
import { UserIdProvider } from "../lib/user-id";
import { useAppTheme } from "../theme/app-theme";

// signOut은 실패를 스스로 콘솔에 남기고, 어느 경우든 로컬 세션은 지워진다 —
// 여기서 돌려받아 처리할 것이 없다.
function discardSession() {
  signOut();
}

function AppNavigationTheme({ children }: { children: ReactNode }) {
  const app = useAppTheme();
  const dark = useColorScheme() === "dark";
  const value = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        background: app.background,
        border: app.border,
        card: app.background,
        notification: app.danger,
        primary: app.primary,
        text: app.foreground,
      },
    };
  }, [
    app.background,
    app.border,
    app.danger,
    app.foreground,
    app.primary,
    dark,
  ]);

  return <ThemeProvider value={value}>{children}</ThemeProvider>;
}

// useAuth 구독은 여기 한 곳뿐이다 — 화면들은 가드 결과만 받는다.
function Routes() {
  const app = useAppTheme();
  const auth = useAuth();
  const userId = auth.kind === "ready" ? auth.userId : null;
  // 훅은 조건부로 부를 수 없다. 로그인 전에는 userId가 null이라 조회가 꺼져
  // 있고, 아래에서 로그인 이후에만 이 판정을 본다.
  const profile = useProfileGate(userId);

  if (auth.kind === "loading") {
    return <LaunchChecking />;
  }

  if (auth.kind === "failed") {
    // "인증 실패:" 접두사를 떼었다. reason이 이미 무엇을 고쳐야 하는지 말하는
    // 문장이고, 접두사는 사용자가 뭘 잘못한 것처럼 읽히게 한다.
    return <LaunchFailed reason={auth.reason} />;
  }

  // 프로필 판정은 로그인한 사용자에게만 의미가 있다. 미로그인 상태에서 보면
  // 조회가 꺼져 있어 영영 loading이고, 로그인 화면 대신 스피너가 남는다.
  if (auth.kind === "ready") {
    if (profile.kind === "loading") {
      return <LaunchChecking />;
    }

    if (profile.kind === "failed") {
      return (
        <ProfileUnavailable
          onRetry={profile.retry}
          onSignOut={discardSession}
          retrying={profile.retrying}
        />
      );
    }

    if (profile.kind === "missing") {
      return <ProfileMissing onSignOut={discardSession} />;
    }
  }

  return (
    <UserIdProvider userId={userId}>
      {/* layout과 back gesture는 native stack이 소유하고 색만 CSS 테마가 준다. */}
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: app.background },
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerShown: false,
          headerStyle: { backgroundColor: app.background },
          headerTintColor: app.foreground,
          headerTitleStyle: { color: app.foreground, fontWeight: "500" },
        }}
      >
        <Stack.Protected
          guard={auth.kind === "ready" && profile.kind === "ready"}
        >
          {/* 헤더를 켜야 우측 상단 설정 버튼이 설 자리가 생긴다. */}
          <Stack.Screen
            name="index"
            options={{ headerShown: true, title: "채팅" }}
          />
          <Stack.Screen
            name="chats/[id]"
            options={{ headerShown: true, title: "새 채팅" }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: true,
              title: "설정",
            }}
          />
          <Stack.Screen
            name="settings/display-name"
            options={{
              headerShown: true,
              title: "표시 이름",
            }}
          />
        </Stack.Protected>
        {/* 온보딩만 마운트한다 — 뒤로 가서 앱에 들어갈 스택 자체를 만들지 않는다. */}
        <Stack.Protected
          guard={auth.kind === "ready" && profile.kind === "onboarding"}
        >
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: true, title: "이름 정하기" }}
          />
        </Stack.Protected>
        <Stack.Protected guard={auth.kind === "signedOut"}>
          <Stack.Screen name="sign-in/index" />
          <Stack.Screen
            name="sign-in/email"
            options={{
              headerBackTitle: "로그인",
              headerShown: true,
              title: "이메일",
            }}
          />
          <Stack.Screen
            name="sign-in/code"
            options={{
              headerShown: true,
              title: "인증 코드",
            }}
          />
        </Stack.Protected>
      </Stack>
    </UserIdProvider>
  );
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <AppNavigationTheme>
          <Routes />
          <StatusBar style="auto" />
        </AppNavigationTheme>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
