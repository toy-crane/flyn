import { expect, test } from "@jest/globals";

import { compareInstalledVersion, getPolicyAudience } from "./version-policy";

test("설치 버전을 숫자 자리별로 비교한다", () => {
  expect(compareInstalledVersion("1.1.9", "1.2.0")).toBe(-1);
  expect(compareInstalledVersion("1.2.0", "1.2.0")).toBe(0);
  expect(compareInstalledVersion("1.10.0", "1.2.0")).toBe(1);
  expect(compareInstalledVersion("2.0.0", "1.99.99")).toBe(1);
});

test("잘못된 버전은 차단 근거로 사용하지 않는다", () => {
  expect(compareInstalledVersion("1.0", "1.2.0")).toBeNull();
  expect(compareInstalledVersion("1.0.0", "latest")).toBeNull();
});

test("빌드 채널과 플랫폼으로 내부·공개 정책을 나눈다", () => {
  expect(getPolicyAudience("ios", "internal", false)).toEqual({
    distribution: "internal",
    platform: "ios",
  });
  expect(getPolicyAudience("android", "production", false)).toEqual({
    distribution: "public",
    platform: "android",
  });
  expect(getPolicyAudience("ios", null, true)).toEqual({
    distribution: "internal",
    platform: "ios",
  });
  expect(getPolicyAudience("ios", "", true)).toEqual({
    distribution: "internal",
    platform: "ios",
  });
  expect(getPolicyAudience("ios", "unknown", false)).toBeNull();
  expect(getPolicyAudience("web", "production", false)).toBeNull();
});
