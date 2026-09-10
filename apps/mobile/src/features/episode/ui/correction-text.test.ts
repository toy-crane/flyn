import { expect, test } from "@jest/globals";

import { fixedMarks } from "./correction-text";

test("표현이 여럿이어도 고친 문장 하나에서 짚을 조각만 모은다", () => {
  expect(
    fixedMarks({
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
      review: {
        example: "This is the wrong bag.",
        exampleMeaning: "이건 다른 가방이에요.",
        meaning: "다른 커피인 것 같아요.",
        situation: "주문을 확인할 때",
      },
    })
  ).toEqual(["want to change", "an iced americano"]);
});
