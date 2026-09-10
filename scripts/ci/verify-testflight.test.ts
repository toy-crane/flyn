import { expect, test } from "bun:test";
import { testFlightReady } from "./verify-testflight";

test("TestFlight는 같은 앱의 의도한 빌드가 내부 테스트에 설치 가능해야 준비된다", () => {
  const build = {
    easBuildId: "build-1",
    expired: false,
    internalState: "IN_BETA_TESTING",
    processingState: "VALID",
  };
  const status = {
    ios: { ascAppIdentifier: "6810074671", testFlightBuilds: [build] },
  };
  expect(testFlightReady(status, "build-1")).toBe(true);
  expect(testFlightReady(status, "other")).toBe(false);
  expect(
    testFlightReady(
      { ios: { ...status.ios, ascAppIdentifier: "other" } },
      "build-1"
    )
  ).toBe(false);
  for (const change of [
    { expired: true },
    { processingState: "PROCESSING" },
    { internalState: "READY_FOR_BETA_TESTING" },
  ]) {
    expect(
      testFlightReady(
        { ios: { ...status.ios, testFlightBuilds: [{ ...build, ...change }] } },
        "build-1"
      )
    ).toBe(false);
  }
});
