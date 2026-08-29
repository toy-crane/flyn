import { expect, test } from "@jest/globals";

import { fixedMarks, markedParts } from "./correction-text";

const CORRECTION = {
  entries: [
    {
      fixed: "want to change",
      original: "want change",
      pattern: "to-infinitive-after-want",
      why: "동사 두 개를 이어 쓸 때는 사이에 to를 넣어요.",
    },
    {
      fixed: "an iced americano",
      original: "iced americano",
      pattern: "article-a-count-noun",
      why: "음료 한 잔을 말할 때는 an을 붙여요.",
    },
  ],
  fixed: "I want to change to an iced americano.",
  messageId: "m1",
  original: "I want change to iced americano.",
};

test("강조할 조각을 짚고 나머지 문장은 그대로 둔다", () => {
  expect(markedParts("I want to change.", ["want to change"])).toEqual([
    { at: 0, isMarked: false, text: "I " },
    { at: 2, isMarked: true, text: "want to change" },
    { at: 16, isMarked: false, text: "." },
  ]);
});

test("표현이 여럿이면 문장 하나에서 각각의 자리를 짚는다", () => {
  const marked = markedParts(CORRECTION.fixed, fixedMarks(CORRECTION));

  expect(
    marked.filter((part) => part.isMarked).map((part) => part.text)
  ).toEqual(["want to change", "an iced americano"]);
  expect(marked.map((part) => part.text).join("")).toBe(CORRECTION.fixed);
});

// 강조 하나를 놓치는 편이 문장을 못 보여 주는 것보다 낫다.
test("문장에 없는 조각은 강조하지 않고 문장을 그대로 보여 준다", () => {
  expect(markedParts("I want to change.", ["nothing like this"])).toEqual([
    { at: 0, isMarked: false, text: "I want to change." },
  ]);
});

test("짚을 조각이 없으면 문장 하나로 돌려준다", () => {
  expect(markedParts("Thank you.", [])).toEqual([
    { at: 0, isMarked: false, text: "Thank you." },
  ]);
});

// 같은 낱말이 두 번 나와도 강조는 조각 수만큼만 생긴다.
test("같은 조각이 두 번 나오면 처음 자리만 짚는다", () => {
  const marked = markedParts("the cup and the lid", ["the"]);

  expect(marked).toEqual([
    { at: 0, isMarked: true, text: "the" },
    { at: 3, isMarked: false, text: " cup and the lid" },
  ]);
});

// 앞 조각이 이미 차지한 자리는 뒤 조각이 겹쳐 짚지 않는다.
test("겹치는 조각은 겹치지 않는 다음 자리를 찾는다", () => {
  const marked = markedParts("the wrong the coffee", ["the wrong", "the"]);

  expect(marked.filter((part) => part.isMarked)).toEqual([
    { at: 0, isMarked: true, text: "the wrong" },
    { at: 10, isMarked: true, text: "the" },
  ]);
});
