import "../global.css";

import { Stack } from "expo-router";
import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";

/**
 * Root stack, and the place the spec's IA tab-bar rule is enforced:
 *
 *   (tabs)  — tab roots plus anything pushed inside a tab → tab bar visible
 *   (auth)  — 로그인 · 온보딩                              → no tab bar
 *   (story) — 몰입 플로우                                  → no tab bar
 *
 * The immersive screens deliberately have no layout of their own: they push
 * onto this stack, on top of the tabs, so each one gets a real back control.
 * A nested stack would make the first of them the root of its own history and
 * leave it with nothing to go back to.
 *
 * Headers are the native stack's own — the back control has to be Apple's, and
 * with it come swipe-back, the safe area, and Dynamic Type. Screens set their
 * titles through Stack.Screen options. Dark mode is deferred, so the light
 * theme is fixed rather than following the system.
 */
export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#191f28",
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { fontSize: 16, color: "#191f28" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
