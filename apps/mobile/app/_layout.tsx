import "../global.css";

import { Stack } from "expo-router";
import { hide as hideSplashScreen } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native/provider";
import { type ReactNode, useEffect } from "react";
import { BackHandler, Modal, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

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
import { AuthSessionProvider } from "@/features/auth/state/auth-session";
import { ProfileUnavailableScreen } from "@/screens/session/profile-unavailable-screen";
import { SessionCheckingScreen } from "@/screens/session/session-checking-screen";
import { SetupNeededScreen } from "@/screens/session/setup-needed-screen";
import { UpdateRequiredScreen } from "@/screens/session/update-required-screen";

/**
 * 방금 한 일을 알리는 짧은 문구는 화면 위쪽에 뜬다.
 *
 * 아래쪽은 입력창, 최신 메시지 버튼과 키보드가 차례로 쓰는 자리다. 토스트는
 * 화면 전체를 덮는 층에 그려져서 그 컨트롤들의 높이를 알 수 없으므로, 아래에
 * 두면 어느 화면에서는 입력창을 덮고 어느 화면에서는 이유 없이 떠 있는다.
 * 위쪽은 어느 화면에서나 비어 있고 iOS의 시스템 배너가 서는 자리이기도 하다.
 */
const heroUIConfig = {
  devInfo: { stylingPrinciples: false },
  toast: { defaultProps: { placement: "top" } },
} as const;

const keepUpdateScreenOpen = () => undefined;

function ThemedRootLayout() {
  const { background, foreground, scheme } = useAppTheme();
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
  if (area === "checking") {
    content = <SessionCheckingScreen phase={checkingPhase} />;
  } else if (area === "misconfigured" || area === "profileUnavailable") {
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
          gestureEnabled: versionGate.status !== "blocked",
          headerShown: false,
        }}
      >
        <Stack.Protected guard={area === "app"}>
          <Stack.Screen name="(tabs)" />
          {/* 상세와 기록은 탭 전체를 덮고, 뒤로 가면 들어온 화면으로 돌아간다. */}
          {storyScreens.map((storyScreen) => (
            <Stack.Screen
              key={storyScreen.name}
              name={storyScreen.name}
              options={{ ...storyScreenOptions, title: storyScreen.title }}
            />
          ))}
          {/* 에피소드는 화면 전체를 쓰므로 탭과 루트 헤더 위에 push한다. */}
          <Stack.Screen name="episode" />
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
        <Stack.Protected guard={area === "onboarding"}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={area === "signedOut"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    );
  }

  return (
    <>
      <View
        accessibilityElementsHidden={versionGate.status === "blocked"}
        importantForAccessibility={
          versionGate.status === "blocked" ? "no-hide-descendants" : "auto"
        }
        pointerEvents={versionGate.status === "blocked" ? "none" : "auto"}
        style={{ flex: 1 }}
      >
        {content}
      </View>
      <Modal
        animationType="none"
        onRequestClose={keepUpdateScreenOpen}
        visible={showUpdateScreen}
      >
        <UpdateRequiredScreen
          checkError={versionGate.checkError}
          isRechecking={versionGate.isRechecking}
          onOpenInstall={versionGate.openInstall}
          openError={versionGate.openError}
        />
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      </Modal>
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
