import { expect, test } from "bun:test";
import { planChanges } from "./changes";

const none = { affected: [], paths: [] };

test("문서만 바뀌면 검사와 배포를 모두 건너뛴다", () => {
  expect(
    planChanges({
      affected: [],
      paths: ["docs/decisions/continuous-delivery.md", "README.md"],
    })
  ).toEqual({
    api: false,
    database: false,
    edge: false,
    mobile: false,
    validate: false,
  });
});

test("영향 패키지가 있으면 공통 검사를 실행한다", () => {
  const plan = planChanges({
    affected: ["@repo/api"],
    paths: ["apps/api/src/index.ts"],
  });
  expect(plan.validate).toBe(true);
  expect(plan.api).toBe(true);
  expect(plan.mobile).toBe(false);
});

test("모바일 패키지가 영향받으면 모바일만 배포 대상이다", () => {
  const plan = planChanges({
    affected: ["@repo/mobile"],
    paths: ["apps/mobile/app/index.tsx"],
  });
  expect(plan.mobile).toBe(true);
  expect(plan.api).toBe(false);
});

test("공유 패키지가 바뀌면 그 패키지를 쓰는 앱이 모두 대상이 된다", () => {
  const plan = planChanges({
    affected: ["@repo/supabase", "@repo/api", "@repo/mobile"],
    paths: ["packages/supabase/src/index.ts"],
  });
  expect(plan.api).toBe(true);
  expect(plan.mobile).toBe(true);
});

test("Edge 함수는 Deno 의존성만 쓰므로 공유 패키지 변경으로 배포하지 않는다", () => {
  expect(
    planChanges({
      affected: ["@repo/supabase", "@repo/api"],
      paths: ["packages/supabase/src/index.ts"],
    }).edge
  ).toBe(false);
});

test("마이그레이션 변경은 DB 검사와 DB 배포를 켠다", () => {
  const plan = planChanges({
    affected: [],
    paths: ["supabase/migrations/20260910045742_story_characters.sql"],
  });
  expect(plan.database).toBe(true);
  expect(plan.validate).toBe(true);
});

test("Edge 함수 소스와 설정은 Edge 대상이다", () => {
  expect(
    planChanges({
      affected: [],
      paths: ["supabase/functions/delete-user/index.ts"],
    }).edge
  ).toBe(true);
  expect(
    planChanges({ affected: [], paths: ["supabase/config.toml"] }).edge
  ).toBe(true);
});

test("CI 코드와 루트 설정이 바뀌면 전체 검사를 실행한다", () => {
  for (const path of [
    ".github/workflows/ci.yml",
    "scripts/ci/changes.ts",
    "package.json",
    "bun.lock",
    "turbo.json",
    "biome.jsonc",
  ]) {
    expect(planChanges({ affected: [], paths: [path] }).validate).toBe(true);
  }
});

test("CI 코드 변경만으로 서비스 배포를 켜지 않는다", () => {
  const plan = planChanges({
    affected: [],
    paths: [".github/workflows/ci.yml"],
  });
  expect(plan.api).toBe(false);
  expect(plan.mobile).toBe(false);
  expect(plan.edge).toBe(false);
  expect(plan.database).toBe(false);
});

test("변경이 없으면 아무것도 켜지 않는다", () => {
  expect(planChanges(none)).toEqual({
    api: false,
    database: false,
    edge: false,
    mobile: false,
    validate: false,
  });
});

test("문서 아래의 마이그레이션 이름은 DB 변경으로 보지 않는다", () => {
  expect(
    planChanges({
      affected: [],
      paths: ["docs/specs/x/supabase/migrations/1.sql"],
    }).database
  ).toBe(false);
});
