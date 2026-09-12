import { expect, test } from "bun:test";
import { CREATION_CASES } from "./story-creation-cases";
import { creationViolations } from "./story-creation-checks";

test("상한을 알리지 않은 제안과 이전 결과를 확정한 추가 제안을 잡는다", () => {
  expect(
    creationViolations("관리 방법을 묻는 장면은 어때요?", [], { atLimit: true })
  ).toContain("상한 안내 없음");
  expect(
    creationViolations(
      "커피 머신 문제를 해결한 뒤 다른 장면도 넣어 볼게요. 사용법을 묻는 상황은 어때요?",
      [],
      { asks: true, unresolved: true }
    )
  ).toContain("이전 결과 선확정");
  expect(
    creationViolations(
      "이미 5화여서 더 넣을 수 없어요. 어느 화를 뺄지 말해 주세요.",
      [],
      { atLimit: true }
    )
  ).toEqual([]);
});

test("서식과 말투가 다른 질문 및 카드 없이 끝나는 답을 떨어뜨린다", () => {
  expect(
    creationViolations("**알겠습니다.**\n어떤 상황입니까?", [], { asks: true })
  ).not.toEqual([]);
  expect(
    creationViolations("카드를 만들었어요.", [], { episodes: 1 })
  ).toContain("카드 하나 필요");
  expect(
    creationViolations(
      "고장 난 기계를 설명하려는 거네요. 직원에게 교환을 요청하는 상황은 어때요?",
      [],
      { asks: true }
    )
  ).toEqual([]);
});

test("카드의 JSON 속성 순서만 달라진 것은 내용 변경이 아니다", () => {
  const seed = CREATION_CASES.find((item) => item.seed)?.seed;
  if (!seed) {
    throw new Error("평가 카드가 없습니다.");
  }
  const card = {
    ...seed,
    episodes: seed.episodes.map((episode) => ({
      cast: episode.cast,
      details: episode.details,
      number: episode.number,
      preview: episode.preview,
      title: episode.title,
    })),
  };
  expect(
    creationViolations("", [card], { episodes: 1, preserve: [1] }, seed)
  ).toEqual([]);
});
