import { expect, test } from "bun:test";
import { databaseEnvironment } from "./database-verify";

test("CI는 공식 GHCR 이미지를 사용하되 DB 비밀값과 외부 registry 입력은 제거한다", () => {
  const env = databaseEnvironment({
    DATABASE_URL: "secret",
    GITHUB_ACTIONS: "true",
    PATH: "fixture",
    PGPASSWORD: "secret",
    SUPABASE_ACCESS_TOKEN: "secret",
    SUPABASE_DB_PASSWORD: "secret",
    SUPABASE_INTERNAL_IMAGE_REGISTRY: "untrusted.example",
  });
  expect(env).toEqual({
    GITHUB_ACTIONS: "true",
    PATH: "fixture",
    SUPABASE_INTERNAL_IMAGE_REGISTRY: "ghcr.io",
  });
});

test("로컬 DB 검증은 기존 기본 이미지 경로를 유지한다", () => {
  expect(
    databaseEnvironment({ PATH: "fixture", SUPABASE_ACCESS_TOKEN: "secret" })
  ).toEqual({ PATH: "fixture" });
});
