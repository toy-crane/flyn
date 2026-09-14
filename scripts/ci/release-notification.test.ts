import { expect, test } from "bun:test";
import { renderReleaseNotification } from "./release-notification";

const sha = "a".repeat(40);
const base = {
  account: "odd-corp",
  app: "flyn",
  sha,
  workflowUrl:
    "https://expo.dev/accounts/odd-corp/projects/flyn/workflows/run-1",
};

test("OTA만 게시한 배포는 업데이트 링크를 한 번 알린다", () => {
  const message = renderReleaseNotification({
    ...base,
    jobs: {
      check_existing: { outputs: { action: "update" }, status: "success" },
      get_build: { outputs: { build_id: "build-1" }, status: "success" },
      update_ios: {
        outputs: { first_update_group_id: "group-1" },
        status: "success",
      },
    },
  });
  expect(message).toContain("OTA 게시 완료");
  expect(message).toContain("updates/group-1");
  expect(message).toContain(sha);
  expect(message).not.toContain("TestFlight 설치 가능");
});

test("새 빌드는 제출과 설치 가능 확인까지 성공해야 설치 가능을 알린다", () => {
  const jobs = {
    build_ios: {
      outputs: {
        app_build_version: "42",
        app_version: "1.2.3",
        build_id: "build-2",
      },
      status: "success",
    },
    submit_ios: { status: "success" },
    verify_new: { status: "success" },
  };
  const success = renderReleaseNotification({ ...base, jobs });
  expect(success).toContain("TestFlight 설치 가능");
  expect(success).toContain("1.2.3 (42)");
  expect(success).toContain("builds/build-2");
  const failed = renderReleaseNotification({
    ...base,
    jobs: { ...jobs, verify_new: { status: "failure" } },
  });
  expect(failed).toContain("설치 가능 확인 실패");
  expect(failed).not.toContain("TestFlight 설치 가능");
});

test("기존 빌드 제출 뒤 OTA 성공은 하나의 결과로 알린다", () => {
  const message = renderReleaseNotification({
    ...base,
    jobs: {
      check_existing: { outputs: { action: "submit" }, status: "success" },
      get_build: {
        outputs: {
          app_build_version: "41",
          app_version: "1.2.0",
          build_id: "build-3",
        },
        status: "success",
      },
      submit_existing: { status: "success" },
      update_submitted: {
        outputs: { first_update_group_id: "group-3" },
        status: "success",
      },
      verify_submitted: { status: "success" },
    },
  });
  expect(message).toContain("OTA 게시 완료");
  expect(message).toContain("기존 빌드 제출");
  expect(message).toContain("1.2.0 (41)");
  expect(message).toContain("updates/group-3");
});

test("준비와 배포 단계의 실패는 해당 단계를 가리킨다", () => {
  for (const [key, label] of [
    ["identity", "배포 요청 확인 실패"],
    ["fingerprint", "빌드 호환성 확인 실패"],
    ["get_build", "기존 빌드 조회 실패"],
    ["build_ios", "빌드 실패"],
    ["submit_ios", "제출 실패"],
    ["update_ios", "OTA 게시 실패"],
  ] as const) {
    const message = renderReleaseNotification({
      ...base,
      jobs: { [key]: { status: "failure" } },
    });
    expect(message).toContain(label);
    expect(message).toContain(base.workflowUrl);
    expect(message).not.toContain("TestFlight 설치 가능");
  }
});
