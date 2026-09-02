import { expect, test } from "@jest/globals";

import { getExternalDestinations } from "./external-destinations";

test("법적 고지는 웹의 공개 경로를 그대로 연다", () => {
  const destinations = getExternalDestinations();

  // `/terms` and `/privacy` are a public contract the store listing and the app
  // both point at, so the app builds them from the base address rather than
  // storing three that could drift apart.
  expect(destinations.terms).toBe("https://example.com/terms");
  expect(destinations.privacy).toBe("https://example.com/privacy");
});

test("문의하기는 지원 주소를 받는 사람으로 채운다", () => {
  expect(getExternalDestinations().supportMail).toBe(
    "mailto:support@example.com"
  );
});
