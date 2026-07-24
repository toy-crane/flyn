import "@/global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerLargeTitle: true }}>
        <Stack.Screen name="index" options={{ title: "flyn" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
