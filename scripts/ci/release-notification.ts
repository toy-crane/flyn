interface JobResult {
  outputs?: Record<string, string>;
  status: string;
}

export interface ReleaseNotificationInput {
  account: string;
  app: string;
  jobs: Record<string, JobResult>;
  sha: string;
  workflowUrl: string;
}

const failureLabels: Record<string, string> = {
  build_ios: "빌드 실패",
  check_existing: "기존 빌드 상태 확인 실패",
  fingerprint: "빌드 호환성 확인 실패",
  get_build: "기존 빌드 조회 실패",
  identity: "배포 요청 확인 실패",
  submit_existing: "기존 빌드 제출 실패",
  submit_ios: "제출 실패",
  update_ios: "OTA 게시 실패",
  update_submitted: "OTA 게시 실패",
  verify_new: "설치 가능 확인 실패",
  verify_submitted: "설치 가능 확인 실패",
};

const failureOrder = [
  "identity",
  "fingerprint",
  "get_build",
  "check_existing",
  "build_ios",
  "submit_ios",
  "verify_new",
  "submit_existing",
  "verify_submitted",
  "update_ios",
  "update_submitted",
];
const EXPO_URL = /^https:\/\/expo\.dev\//;

function job(input: ReleaseNotificationInput, key: string) {
  return input.jobs[key] ?? { outputs: {}, status: "skipped" };
}

function output(input: ReleaseNotificationInput, key: string, name: string) {
  return job(input, key).outputs?.[name] ?? "";
}

function urlLink(url: string, label: string) {
  return EXPO_URL.test(url) ? `<${url}|${label}>` : label;
}

export function renderReleaseNotification(input: ReleaseNotificationInput) {
  const project = `${input.account}/${input.app}`;
  const prefix = `플린 iOS internal · ${project} · ${input.sha}`;
  const runLink = urlLink(input.workflowUrl, "EAS 실행·로그");
  const failedKey = failureOrder.find(
    (key) => job(input, key).status === "failure"
  );
  if (failedKey) {
    const built = job(input, "build_ios").status === "success";
    return `${prefix} · ${failureLabels[failedKey]}${built ? " (빌드 성공)" : ""} · ${runLink}`;
  }

  const existingAction = output(input, "check_existing", "action");
  const isNewBuild =
    job(input, "build_ios").status === "success" &&
    job(input, "submit_ios").status === "success" &&
    job(input, "verify_new").status === "success";
  if (isNewBuild) {
    const buildId = output(input, "build_ios", "build_id");
    const version = output(input, "build_ios", "app_version");
    const number = output(input, "build_ios", "app_build_version");
    const buildLink = buildId
      ? urlLink(
          `https://expo.dev/accounts/${input.account}/projects/${input.app}/builds/${buildId}`,
          "빌드 보기"
        )
      : "";
    return [
      prefix,
      "TestFlight 설치 가능",
      version && number ? `${version} (${number})` : "",
      buildLink,
      runLink,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const updateKey =
    existingAction === "submit" ? "update_submitted" : "update_ios";
  const updateId = output(input, updateKey, "first_update_group_id");
  const updateSucceeded =
    job(input, updateKey).status === "success" &&
    Boolean(updateId) &&
    (existingAction === "update" ||
      (existingAction === "submit" &&
        job(input, "submit_existing").status === "success" &&
        job(input, "verify_submitted").status === "success"));
  if (updateSucceeded) {
    const updateLink = urlLink(
      `https://expo.dev/accounts/${input.account}/projects/${input.app}/updates/${updateId}`,
      "업데이트 보기"
    );
    return [
      prefix,
      "OTA 게시 완료",
      existingAction === "submit" ? "기존 빌드 제출" : "",
      "채널 internal",
      output(input, "get_build", "app_version") &&
      output(input, "get_build", "app_build_version")
        ? `${output(input, "get_build", "app_version")} (${output(input, "get_build", "app_build_version")})`
        : "",
      updateLink,
      runLink,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return `${prefix} · 배포 결과 확인 실패 · ${runLink}`;
}

if (import.meta.main) {
  const keys = failureOrder;
  const jobs = Object.fromEntries(
    keys.map((key) => [
      key,
      {
        outputs: {
          action: process.env.FLYN_ACTION ?? "",
          app_build_version:
            key === "get_build"
              ? (process.env.FLYN_EXISTING_APP_BUILD_VERSION ?? "")
              : (process.env.FLYN_APP_BUILD_VERSION ?? ""),
          app_version:
            key === "get_build"
              ? (process.env.FLYN_EXISTING_APP_VERSION ?? "")
              : (process.env.FLYN_APP_VERSION ?? ""),
          build_id:
            key === "build_ios"
              ? (process.env.FLYN_NEW_BUILD_ID ?? "")
              : (process.env.FLYN_EXISTING_BUILD_ID ?? ""),
          first_update_group_id:
            key === "update_submitted"
              ? (process.env.FLYN_SUBMITTED_UPDATE_ID ?? "")
              : (process.env.FLYN_UPDATE_ID ?? ""),
        },
        status: process.env[`FLYN_${key.toUpperCase()}_STATUS`] ?? "skipped",
      },
    ])
  );
  console.log(
    renderReleaseNotification({
      account: process.env.FLYN_EAS_ACCOUNT ?? "",
      app: process.env.FLYN_EAS_APP ?? "",
      jobs,
      sha: process.env.FLYN_RELEASE_SHA ?? "",
      workflowUrl: process.env.FLYN_WORKFLOW_URL ?? "",
    })
  );
}
