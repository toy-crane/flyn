import { Stack } from "expo-router";

/**
 * 책 상세 is pushed inside this stack rather than at the root, which is what
 * keeps the tab bar on it — the spec's rule, expressed as structure. The tab
 * root draws its own heading, so only the pushed screen wears a header.
 */
export default function LibraryStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: "#191f28",
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontSize: 16, color: "#191f28" },
      }}
    >
      <Stack.Screen name="library" options={{ headerShown: false }} />
    </Stack>
  );
}
