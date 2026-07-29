import { describe, expect, test } from "bun:test";
import {
  assertDevelopmentEnvironment,
  assertSupabaseRunning,
  mergeEnvironment,
} from "./dev-worktree/preflight";

const apiEnvironment = {
  AI_GATEWAY_API_KEY: "gateway-secret",
  SUPABASE_JWKS_URL: "http://127.0.0.1:54321/auth/v1/.well-known/jwks.json",
  SUPABASE_PUBLISHABLE_KEY: "publishable-secret",
  SUPABASE_SECRET_KEY: "server-secret",
  SUPABASE_URL: "http://127.0.0.1:54321",
};

const mobileEnvironment = {
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "mobile-publishable-secret",
  EXPO_PUBLIC_SUPABASE_URL: "http://localhost:54321",
};

describe("dev:worktree environment preflight", () => {
  test("inherited environment가 앱 .env.local보다 우선한다", () => {
    expect(
      mergeEnvironment(
        {
          SUPABASE_URL: "http://127.0.0.1:54322",
        },
        {
          SUPABASE_URL: "http://127.0.0.1:54321",
        }
      ).SUPABASE_URL
    ).toBe("http://127.0.0.1:54322");
  });

  test("필수 변수와 동일한 로컬 Supabase stack을 승인한다", () => {
    expect(() =>
      assertDevelopmentEnvironment({
        apiEnvironment,
        mobileEnvironment,
      })
    ).not.toThrow();
  });

  test("누락된 변수 이름만 출력하고 기존 값은 노출하지 않는다", () => {
    let error: Error | undefined;

    try {
      assertDevelopmentEnvironment({
        apiEnvironment: {
          ...apiEnvironment,
          AI_GATEWAY_API_KEY: undefined,
          SUPABASE_SECRET_KEY: undefined,
        },
        mobileEnvironment: {
          ...mobileEnvironment,
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
        },
      });
    } catch (caught) {
      error = caught as Error;
    }

    expect(error?.message).toContain("AI_GATEWAY_API_KEY");
    expect(error?.message).toContain("SUPABASE_SECRET_KEY");
    expect(error?.message).toContain("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(error?.message).not.toContain("gateway-secret");
    expect(error?.message).not.toContain("server-secret");
    expect(error?.message).not.toContain("mobile-publishable-secret");
  });

  test("API와 Mobile이 다른 stack 또는 원격 URL을 가리키면 거부한다", () => {
    expect(() =>
      assertDevelopmentEnvironment({
        apiEnvironment,
        mobileEnvironment: {
          ...mobileEnvironment,
          EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54322",
        },
      })
    ).toThrow("같은 로컬 Supabase stack");

    expect(() =>
      assertDevelopmentEnvironment({
        apiEnvironment: {
          ...apiEnvironment,
          SUPABASE_URL: "https://project.supabase.co",
        },
        mobileEnvironment: {
          ...mobileEnvironment,
          EXPO_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        },
      })
    ).toThrow("같은 로컬 Supabase stack");
  });

  test("Supabase가 꺼져 있으면 수동 시작 명령만 안내한다", async () => {
    await expect(assertSupabaseRunning(async () => false)).rejects.toThrow(
      "bun run db:start"
    );
    await expect(assertSupabaseRunning(async () => true)).resolves.toBe(
      undefined
    );
  });
});
