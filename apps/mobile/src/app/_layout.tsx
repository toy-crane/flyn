import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { LaunchChecking, LaunchFailed } from "../components/launch-screens";
import { useNavigationTheme } from "../components/navigation/navigation-theme";
import {
  ProfileMissing,
  ProfileUnavailable,
} from "../components/profile/profile-unavailable";
import { signOut } from "../lib/auth/sign-out";
import { queryClient } from "../lib/query-client";
import { useAuth } from "../lib/use-auth";
import { useProfileGate } from "../lib/use-profile";
import { UserIdProvider } from "../lib/user-id";
import { AppThemeProvider, useTheme } from "../theme/app-theme";
import "../../global.css";

// GestureHandlerRootView는 uniwind가 감싸는 컴포넌트가 아니라 className을 받지
// 못한다 — 루트를 채우는 flex만 style로 남는다.
const styles = StyleSheet.create({
  root: { flex: 1 },
});

// signOut은 실패를 스스로 콘솔에 남기고, 어느 경우든 로컬 세션은 지워진다 —
// 여기서 돌려받아 처리할 것이 없다.
function discardSession() {
  signOut();
}

function AppNavigationTheme({ children }: { children: ReactNode }) {
  const value = useNavigationTheme();

  return <ThemeProvider value={value}>{children}</ThemeProvider>;
}

// useAuth 구독은 여기 한 곳뿐이다 — 화면들은 가드 결과만 받는다.
function Routes() {
  const { colors } = useTheme();
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
      {/* layout과 back gesture는 native stack이 소유하고 색만 navigation theme가 준다. */}
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerShown: false,
        }}
      >
        <Stack.Protected
          guard={auth.kind === "ready" && profile.kind === "ready"}
        >
          {/* 헤더를 켜야 우측 상단 설정 버튼이 설 자리가 생긴다. */}
          <Stack.Screen
            name="index"
            options={{ headerShown: true, title: "에피소드" }}
          />
          {/* 큰 제목과 서브타이틀은 생성 화면이 스텝마다 직접 바꾼다. */}
          <Stack.Screen
            name="episodes/new"
            options={{ headerShown: true, title: "새 에피소드" }}
          />
          {/* 시나리오 제목과 역할은 대화 화면이 헤더에 직접 세운다. */}
          <Stack.Screen
            name="episodes/[id]"
            options={{ headerShown: true, title: "대화" }}
          />
          {/*
           * 결과 화면. 헤더에는 뒤로 가기와 `다시 하기`만 둔다 — 시나리오
           * 제목은 본문 맨 위 작은 줄로 내려 잘림 없이 보인다.
           */}
          <Stack.Screen
            name="episodes/result"
            options={{ headerShown: true, title: "" }}
          />
          {/*
           * 첨삭 시트. 번역이든 교정이든 같은 시트 하나이고, 라벨이 무엇을
           * 보는지 말하므로 헤더 없이 medium detent와 grabber만 쓴다.
           */}
          <Stack.Screen
            name="episodes/feedback"
            options={{
              headerShown: false,
              presentation: "formSheet",
              sheetAllowedDetents: [0.5],
              sheetGrabberVisible: true,
            }}
          />
          {/*
           * 문장 질문. 시트 위에 시트를 쌓지 않고 대화 위에 push한다. 헤더가
           * 어느 에피소드에서 물고 왔는지를 나르므로 화면이 직접 세운다.
           */}
          <Stack.Screen
            name="episodes/question"
            options={{ headerShown: true, title: "문장 이야기" }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.groupedBackground },
              title: "설정",
            }}
          />
          <Stack.Screen
            name="settings/display-name"
            options={{
              headerBackVisible: false,
              headerShown: true,
              presentation: "formSheet",
              sheetAllowedDetents: [1],
              sheetGrabberVisible: true,
              title: "닉네임",
            }}
          />
          <Stack.Screen
            name="settings/username"
            options={{
              headerBackVisible: false,
              headerShown: true,
              presentation: "formSheet",
              sheetAllowedDetents: [1],
              sheetGrabberVisible: true,
              title: "아이디",
            }}
          />
        </Stack.Protected>
        {/* 온보딩만 마운트한다 — 뒤로 가서 앱에 들어갈 스택 자체를 만들지 않는다. */}
        <Stack.Protected
          guard={auth.kind === "ready" && profile.kind === "onboarding"}
        >
          <Stack.Screen
            name="onboarding/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="onboarding/nickname"
            options={{ headerShown: true, title: "닉네임을 정해 주세요" }}
          />
          <Stack.Screen
            name="onboarding/username"
            options={{ headerShown: true, title: "아이디를 정해 주세요" }}
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
    // HeroUI 설치 계약이 요구하는 두 래퍼가 가장 바깥이다. AppThemeProvider는
    // 아직 이전되지 않은 화면들이 쓰는 TS 토큰을 계속 공급한다 — 두 시스템의
    // 공존은 이전이 끝날 때까지의 설계다.
    <GestureHandlerRootView style={styles.root}>
      <HeroUINativeProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <AppNavigationTheme>
                <Routes />
                <StatusBar style="auto" />
              </AppNavigationTheme>
            </KeyboardProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
