import { Stack } from "expo-router";

/** 로그인 · 온보딩 — outside the tabs tree, so no tab bar. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
