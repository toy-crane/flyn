import { expect, test } from "@jest/globals";

import { correctionOfData } from "./episode-correction";

const ENTRY = {
  fixed: "the wrong coffee",
  original: "wrong coffee",
  pattern: "article-the-specific",
  why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
};

const CORRECTION = {
  entries: [ENTRY],
  fixed: "I think you gave me the wrong coffee.",
  messageId: "m1",
  original: "I think this is wrong coffee.",
};

test("서버가 보낸 교정을 그대로 읽는다", () => {
  expect(correctionOfData(CORRECTION)).toEqual(CORRECTION);
});

// 교정은 장면과 나란히 오는 곁다리다. 읽지 못한 값 하나가 진행 중인 이야기를
// 멈추게 두지 않는다.
test("모양이 맞지 않으면 아무것도 돌려주지 않는다", () => {
  expect(correctionOfData(null)).toBeUndefined();
  expect(correctionOfData({ ...CORRECTION, fixed: 3 })).toBeUndefined();
  expect(correctionOfData({ ...CORRECTION, messageId: null })).toBeUndefined();
  expect(correctionOfData({ ...CORRECTION, entries: "없음" })).toBeUndefined();
  expect(
    correctionOfData({ ...CORRECTION, entries: [{ fixed: "x" }] })
  ).toBeUndefined();
});

test("표현이 하나도 없으면 붙일 것이 없다", () => {
  expect(correctionOfData({ ...CORRECTION, entries: [] })).toBeUndefined();
});
