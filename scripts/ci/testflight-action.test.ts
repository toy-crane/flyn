import { expect, test } from "bun:test";
import { testFlightAction } from "./testflight-action";

const build = { expirationDate: "2099-01-01T00:00:00.000Z", id: "build-1" };
const ready = {
  ios: {
    ascAppIdentifier: "6810074671",
    testFlightBuilds: [
      {
        easBuildId: "build-1",
        expired: false,
        internalState: "IN_BETA_TESTING",
        processingState: "VALID",
      },
    ],
  },
};

test("호환 빌드가 TestFlight에 설치 가능하면 Update를 선택한다", () => {
  expect(testFlightAction(ready, build, [])).toBe("update");
});

test("호환 빌드가 만료됐거나 제출에 실패했으면 새 빌드를 선택한다", () => {
  expect(
    testFlightAction(
      {},
      { ...build, expirationDate: "2020-01-01T00:00:00.000Z" },
      [],
      new Date("2026-01-01")
    )
  ).toBe("build");
  expect(
    testFlightAction({}, build, [
      { status: "ERRORED", submittedBuild: { id: "build-1" } },
    ])
  ).toBe("build");
});

test("제출 이력이 없으면 기존 빌드를 제출하고 처리 중이면 기다린다", () => {
  expect(testFlightAction({}, build, [])).toBe("submit");
  for (const status of [
    "AWAITING_BUILD",
    "IN_QUEUE",
    "IN_PROGRESS",
    "FINISHED",
  ]) {
    expect(
      testFlightAction({}, build, [
        { status, submittedBuild: { id: "build-1" } },
      ])
    ).toBe("wait");
  }
});
