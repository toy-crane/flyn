import { expect, test } from "bun:test";
import { CREATION_CASES } from "./story-creation-cases";
import { creationViolations } from "./story-creation-checks";

test("제안 끝의 다른 문자권 조각도 놓치지 않는다", () => {
  expect(
    creationViolations("승무원에게 따뜻한 물을 부탁해 볼까요? ઉમ?", [], {})
  ).toContain("관계없는 외국어 조각");
  expect(creationViolations("Emma에게 말해 볼까요? 🙂", [], {})).toEqual([]);
});

test("인물 설명의 관계없는 외국어 조각과 표지의 휴대전화를 잡는다", () => {
  const seed = CREATION_CASES.find((item) => item.seed)?.seed;
  if (!seed) {
    throw new Error("평가 카드가 없습니다.");
  }
  const card = {
    ...seed,
    characters: seed.characters.map((character) => ({
      ...character,
      role: "30대 팀 리더. 설명이 अस्पष्ट하면 다시 묻는다.",
    })),
    cover: `${seed.cover}, holding a phone`,
  };
  const violations = creationViolations("", [card], { episodes: 1 });
  expect(violations).toContain("관계없는 외국어 조각");
  expect(violations).toContain("표지에 손에 든 소품");
  expect(creationViolations("", [seed], { episodes: 1 })).toEqual([]);
});

test("실제 대화에서도 결과를 정하지 말라는 의미 반전을 잡는다", () => {
  const seed = CREATION_CASES.find((item) => item.seed)?.seed;
  if (!seed) {
    throw new Error("평가 카드가 없습니다.");
  }
  const card = {
    ...seed,
    episodes: seed.episodes.map((episode) => ({
      ...episode,
      details:
        "교환이 가능한지, 어떤 절차가 진행되는지는 실제 대화에서 정하지 않는다.",
    })),
  };
  expect(creationViolations("", [card], { episodes: 1 })).toContain(
    "실제 플레이의 결과 결정 금지"
  );
  expect(
    creationViolations("실제 대화에서 정하지 않겠습니다.", [], {})
  ).toContain("실제 플레이의 결과 결정 금지");
  expect(
    creationViolations(
      "여기서 미리 정하지 않고, 실제 대화에서 결과를 정해요.",
      [],
      {}
    )
  ).toEqual([]);
});

test("한 에피소드로 만들어도 된다는 자연스러운 안내를 인정한다", () => {
  expect(
    creationViolations(
      "다음에는 여행 이야기를 꺼내 볼까요? 지금 정한 상황만 한 에피소드로 만들어도 괜찮아요.",
      [],
      { proposes: true }
    )
  ).toEqual([]);
});

test("기존 대화만 연습해도 된다는 안내를 인정한다", () => {
  expect(
    creationViolations(
      "승무원에게 따뜻한 물을 요청해 볼까요? 지금 정한 옆자리 승객과의 대화만 연습해도 좋아요.",
      [],
      { proposes: true }
    )
  ).toEqual([]);
});

test("현재 상황만 에피소드로 만든다는 안내를 인정한다", () => {
  expect(
    creationViolations(
      "공항 직원에게 길을 물어볼까요? 지금 정한 비행기 안 상황만 에피소드로 만들어도 좋아요.",
      [],
      { proposes: true }
    )
  ).toEqual([]);
});

test("첫 사건 뒤 제안은 추가하지 않아도 된다는 안내를 포함한다", () => {
  expect(
    creationViolations("다음에는 동료와 점심을 먹으며 취미를 물어볼까요?", [], {
      proposes: true,
    })
  ).toContain("한 에피소드로 끝내는 안내 없음");
  expect(
    creationViolations(
      "동료와 점심을 먹으며 취미를 물어볼까요? 지금 에피소드만 만들어도 좋아요.",
      [],
      { proposes: true }
    )
  ).toEqual([]);
});

test("사용자 역할을 별도 인물로 추가한 카드는 상대 인원 검사에서 실패한다", () => {
  const outline = CREATION_CASES.find((item) => item.seed)?.seed;
  if (!outline) {
    throw new Error("평가 카드가 없습니다.");
  }
  const duplicatedPlayer = {
    ...outline,
    characters: [
      ...outline.characters,
      {
        name: "Mia",
        position: 2,
        role: "고장 난 기계를 들고 직원에게 교환을 요청하는 고객.",
      },
    ],
    episodes: outline.episodes.map((episode) => ({
      ...episode,
      cast: [...episode.cast, "Mia"],
    })),
  };
  expect(
    creationViolations("", [duplicatedPlayer], { characters: 1, episodes: 1 })
  ).toContain("요청한 상대 인원과 다름");
  expect(
    creationViolations("", [outline], { characters: 1, episodes: 1 })
  ).toEqual([]);
});

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
