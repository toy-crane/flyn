declare const __DEV__: boolean;

import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import { getDevServer } from "expo-router/build/getDevServer";
import { getMobileEnv } from "./env-runtime";

jest.mock("expo-router/build/getDevServer", () => ({
  getDevServer: jest.fn(),
}));
const originalEnv = { ...process.env };
const originalDev = __DEV__;
afterEach(() => {
  Object.assign(process.env, originalEnv);
  delete process.env.EXPO_PUBLIC_DEV_SESSION_API_PORT;
  delete process.env.EXPO_PUBLIC_DEV_SESSION_SUPABASE_PORT;
  Object.defineProperty(globalThis, "__DEV__", {
    configurable: true,
    value: originalDev,
    writable: true,
  });
});

describe("실제 번들의 서버 주소", () => {
  test("LAN 연결과 Storage 사진 URL이 같은 Mac을 가리킨다", () => {
    Object.defineProperty(globalThis, "__DEV__", {
      configurable: true,
      value: true,
      writable: true,
    });
    Object.assign(process.env, {
      ...originalEnv,
      EXPO_OS: "android",
      EXPO_PUBLIC_API_URL: "http://127.0.0.1:3900",
      EXPO_PUBLIC_DEV_SESSION_API_PORT: "3931",
      EXPO_PUBLIC_DEV_SESSION_SUPABASE_PORT: "54331",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "123-ios.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "123-web.apps.googleusercontent.com",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key",
      EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54331",
      EXPO_PUBLIC_SUPPORT_EMAIL: "support@example.com",
      EXPO_PUBLIC_WEB_URL: "https://example.com",
    });
    jest.mocked(getDevServer).mockReturnValue({
      bundleLoadedFromServer: true,
      fullBundleUrl: "",
      url: "http://192.168.0.10:8112/",
    });
    const env = getMobileEnv();
    expect(env.EXPO_PUBLIC_API_URL).toBe("http://192.168.0.10:3931");
    const client = createClient(
      env.EXPO_PUBLIC_SUPABASE_URL,
      env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    expect(
      client.storage.from("avatars").getPublicUrl("user/photo.jpg").data
        .publicUrl
    ).toBe(
      "http://192.168.0.10:54331/storage/v1/object/public/avatars/user/photo.jpg"
    );
    jest.mocked(getDevServer).mockReturnValue({
      bundleLoadedFromServer: true,
      fullBundleUrl: "",
      url: "http://127.0.0.1:8112/",
    });
    expect(getMobileEnv().EXPO_PUBLIC_API_URL).toBe("http://127.0.0.1:3931");
  });
});
