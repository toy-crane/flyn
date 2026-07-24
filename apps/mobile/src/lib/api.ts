/**
 * iOS 시뮬레이터는 호스트의 localhost에 그대로 접근할 수 있어 로컬 루프에는
 * 기본값으로 충분하다. 실기기·EAS 빌드는 EXPO_PUBLIC_API_BASE_URL이 필요하다.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
