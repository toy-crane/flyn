import "../global.css";

import { Stack } from "expo-router";
import { hide as hideSplashScreen } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native/provider";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useProtectedArea } from "@/core/navigation/protected-area";
import {
  getSettingsScreenOptions,
  settingsScreens,
} from "@/core/navigation/settings-screens";
import { QueryProvider } from "@/core/providers/query-provider";
import { AppThemeBridge, useAppTheme } from "@/core/theme/app-theme-bridge";
import { AuthSessionProvider } from "@/features/auth/state/auth-session";
import { ProfileUnavailableScreen } from "@/screens/session/profile-unavailable-screen";
import { SessionCheckingScreen } from "@/screens/session/session-checking-screen";
import { SetupNeededScreen } from "@/screens/session/setup-needed-screen";

const heroUIConfig = {
  devInfo: { stylingPrinciples: false },
} as const;

function ThemedRootLayout() {
  const { background, scheme } = useAppTheme();
  const { area, checkingPhase, isRetryingProfile, problem, retryProfile } =
    useProtectedArea();
  const settingsScreenOptions = getSettingsScreenOptions(background);
  useEffect(() => {
    if (area === "misconfigured" || area === "profileUnavailable") {
      hideSplashScreen();
    }
  }, [area]);

  if (area === "checking") {
    return <SessionCheckingScreen phase={checkingPhase} />;
  }

  if (area === "misconfigured" || area === "profileUnavailable") {
    return (
      <>
        {area === "misconfigured" ? (
          <SetupNeededScreen problem={problem ?? ""} />
        ) : (
          <ProfileUnavailableScreen
            isRetrying={isRetryingProfile}
            onRetry={retryProfile}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/*
        The guards decide which group exists at all, so there is no screen to
        navigate away from and no redirect to write. Expo Router also drops the
        history of a group whose guard turns false, which is what keeps a signed
        out person from swiping back into a protected screen — and what closes
        onboarding the moment the profile is finished.
      */}
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: background },
          headerShown: false,
        }}
      >
        <Stack.Protected guard={area === "app"}>
          <Stack.Screen name="(tabs)" />
          {/*
            An episode is pushed here so the native push covers the tab bar.
            The scene needs the whole screen. It brings its own stack,
            which draws the episode's header
            and presents asking about a correction as a sheet over it. Left on,
            this screen would show a second header above that one.
          */}
          <Stack.Screen name="episode" />
          {/*
            The settings hierarchy is pushed here, screen by screen, for the
            same reason: the native push covers the tab bar. Unlike
            에피소드 these bring no stack of their own — a nested stack would
            make 설정 a first screen, and a first screen has no native back
            button to go back to the tab with.
          */}
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
