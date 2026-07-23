import { Redirect } from "expo-router";

/**
 * Entry. S1 replaces this with the real guard: no session → 로그인,
 * onboarding unfinished → 온보딩, otherwise 홈.
 */
export default function Index() {
  return <Redirect href="/login" />;
}
