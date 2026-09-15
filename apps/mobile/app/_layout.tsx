import "../global.css";

import { Stack } from "expo-router";
import { hide as hideSplashScreen } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native/provider";
import { type ReactNode, useEffect } from "react";
import { BackHandler, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { getAskSheetOptions } from "@/core/navigation/ask-sheet";
import { useProtectedArea } from "@/core/navigation/protected-area";
import {
  getSettingsScreenOptions,
  settingsScreens,
} from "@/core/navigation/settings-screens";
import {
  getStoryScreenOptions,
  storyScreens,
} from "@/core/navigation/story-screens";
import { QueryProvider } from "@/core/providers/query-provider";
import { AppThemeBridge, useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAppVersionGate } from "@/features/app-version/use-app-version-gate";
import { useUpdateScreenVisibility } from "@/features/app-version/use-update-screen-visibility";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/features/auth/state/auth-session";
import { NoteAsksProvider } from "@/features/note/state/note-asks";
import { noteLabels } from "@/features/note/ui/note-labels";
import { streakLabels } from "@/features/streak/ui/streak-labels";
import { ProfileUnavailableScreen } from "@/screens/session/profile-unavailable-screen";
import { SessionCheckingScreen } from "@/screens/session/session-checking-screen";
import { SetupNeededScreen } from "@/screens/session/setup-needed-screen";

const heroUIConfig = {
  devInfo: { stylingPrinciples: false },
} as const;

function AppContent({
  blocked,
  children,
}: {
  blocked: boolean;
  children: ReactNode;
}) {
  return (
    <View
      accessibilityElementsHidden={blocked}
      importantForAccessibility={blocked ? "no-hide-descendants" : "auto"}
      pointerEvents={blocked ? "none" : "auto"}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  );
}

function ThemedRootLayout() {
  const { background, foreground, scheme } = useAppTheme();
  const { session } = useAuthSession();
  const { area, checkingPhase, isRetryingProfile, problem, retryProfile } =
    useProtectedArea();
  const versionGate = useAppVersionGate();
  const showUpdateScreen = useUpdateScreenVisibility(
    versionGate.status === "blocked"
  );
  const settingsScreenOptions = getSettingsScreenOptions(background);
  const storyScreenOptions = getStoryScreenOptions({ background, foreground });
  useEffect(() => {
    if (
      area === "misconfigured" ||
      area === "profileUnavailable" ||
      versionGate.status === "blocked"
    ) {
      hideSplashScreen();
    }
  }, [area, versionGate.status]);
  useEffect(() => {
    if (versionGate.status !== "blocked") {
      return;
    }
    const listener = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => listener.remove();
  }, [versionGate.status]);

  if (versionGate.status === "checking") {
    return (
      <SessionCheckingScreen
        phase={area === "checking" ? checkingPhase : "version"}
      />
    );
  }

  let content: ReactNode;
  if (!showUpdateScreen && area === "checking") {
    content = <SessionCheckingScreen phase={checkingPhase} />;
  } else if (
    !showUpdateScreen &&
    (area === "misconfigured" || area === "profileUnavailable")
  ) {
    content =
      area === "misconfigured" ? (
        <SetupNeededScreen problem={problem ?? ""} />
      ) : (
        <ProfileUnavailableScreen
          isRetrying={isRetryingProfile}
          onRetry={retryProfile}
        />
      );
  } else {
    content = (
      // The protected groups still own navigation. Keep this tree mounted so
      // an in-flight response or save can settle before the modal covers it.
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: background },
          headerShown: false,
        }}
      >
        <Stack.Protected guard={showUpdateScreen}>
          <Stack.Screen
            name="update-required"
            options={{ animation: "none", gestureEnabled: false }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!showUpdateScreen && area === "app"}>
          <Stack.Screen name="(tabs)" />
          {/* 상세와 기록은 탭 전체를 덮고, 뒤로 가면 들어온 화면으로 돌아간다. */}
          {storyScreens.map((storyScreen) => (
            <Stack.Screen
              key={storyScreen.name}
              name={storyScreen.name}
              options={{ ...storyScreenOptions, title: storyScreen.title }}
            />
          ))}
          <Stack.Screen
            name="record-episodes"
            options={{
              headerShown: false,
              presentation: "formSheet",
              sheetAllowedDetents: [0.78, 0.92],
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen
            name="record-episodes-short"
            options={{
              headerShown: false,
              presentation: "formSheet",
              sheetAllowedDetents: [0.4, 0.85],
              sheetGrabberVisible: true,
            }}
          />
          {/* 연속 기록도 탭 없이 보는 상세 화면이라 기록과 같은 헤더로 연다. */}
          <Stack.Screen
            name="streak"
            options={{ ...storyScreenOptions, title: streakLabels.streak }}
          />
          {/* 에피소드는 화면 전체를 쓰므로 탭과 루트 헤더 위에 push한다. */}
          <Stack.Screen name="episode" />
          {/*
            표현 노트에서 연 물어보기. 대화에서 여는 것과 같은 시트지만 노트 탭
            위에서 열리므로 루트에 둔다.
          */}
          <Stack.Screen
            name="note-ask"
            options={{
              ...getAskSheetOptions(background, noteLabels.ask),
              headerShown: true,
            }}
          />
          {/* 설정 계층은 같은 루트 Stack에서 네이티브 뒤로 가기를 공유한다. */}
          {settingsScreens.map((settingsScreen) => (
            <Stack.Screen
              key={settingsScreen.name}
              name={settingsScreen.name}
              options={{
                ...settingsScreenOptions,
                title: settingsScreen.title,
              }}
            />
          ))}
        </Stack.Protected>
        <Stack.Protected guard={!showUpdateScreen && area === "onboarding"}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={!showUpdateScreen && area === "signedOut"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    );
  }

  return (
    <>
      <AppContent
        blocked={versionGate.status === "blocked" && !showUpdateScreen}
      >
        {/*
          노트에서 연 물어보기는 탭과 원래 대화를 오가도 남아야 하므로 앱의
          화면 전체 위에 둔다. 계정이 바뀌면 안의 대화가 비워진다.
        */}
        <NoteAsksProvider
          accessToken={session?.access_token}
          userId={session?.user.id}
        >
          {content}
        </NoteAsksProvider>
      </AppContent>
      {/*
        The chosen screen mode, not the operating system's. `auto` reads the OS,
        so a person who picks 다크 while the phone is light gets dark text on
        the dark header they just chose.
      */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/*
        Wraps everything below it, including navigation, because the keyboard
        views inside screens read their position from this provider.
      */}
      <KeyboardProvider>
        <QueryProvider>
          <HeroUINativeProvider config={heroUIConfig}>
            <AppThemeBridge>
              <AuthSessionProvider>
                <ThemedRootLayout />
              </AuthSessionProvider>
            </AppThemeBridge>
          </HeroUINativeProvider>
        </QueryProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
