import { Stack } from "expo-router";

/**
 * 책 상세 is pushed inside this stack rather than at the root, which is what
 * keeps the tab bar on it — the spec's rule, expressed as structure.
 * LibraryScreen declares its own large title via Stack.Screen.
 */
export default function LibraryStackLayout() {
  return <Stack />;
}
