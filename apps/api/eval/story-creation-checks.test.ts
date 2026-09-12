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

test("교환이나 아기 달래기의 성공을 가정한 추가 제안도 잡는다", () => {
  for (const answer of [
    "커피 머신을 교환한 뒤 겪을 수 있는 다른 상황도 넣어 볼게요.",
    "아기가 잠든 뒤 승무원이 말을 거는 순간은 어때요?",
  ]) {
    expect(creationViolations(answer, [], { unresolved: true })).toContain(
      "이전 결과 선확정"
    );
  }
});

test("대화의 길이와 서식을 합격 기준으로 삼지 않는다", () => {
  expect(
    creationViolations(
      "어제 다툰 뒤 다시 이야기를 꺼내려는 상황이군요.\n\n**육아 분담을 다시 이야기하는 장면**을 생각해 볼 수 있어요. 서로 부담스러웠던 일을 설명하는 자리예요. 누가 옳은지나 화해 여부는 정하지 않아요.\n\n원하는 장면과 가까운가요? 다르게 생각한 부분이 있으면 말해 주세요.",
      [],
      { asks: true }
    )
  ).toEqual([]);
});

test("필요한 대화나 카드가 없으면 떨어뜨린다", () => {
  expect(creationViolations(" \n", [], { asks: true })).toContain("대화 없음");
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
