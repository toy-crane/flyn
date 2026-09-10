import { describe, expect, test } from "bun:test";

import { answerViolations } from "./answer-checks";
import {
  CURRENT_PROMPT_ANSWERS,
  PREVIOUS_PROMPT_ANSWERS,
} from "./fixtures/sample-answers";

const CLEAN_CORRECTION_ANSWER = `여기서는 지금 받은 특정한 커피를 가리키니까 the를 붙여요. 그래서 the wrong coffee는 "그 잘못 나온 커피"라는 뜻이에요.

wrong coffee만 쓰면 어떤 커피가 잘못됐는지 가리키는 느낌이 약해서 이 상황에는 어색해요.`;

describe("answerViolations", () => {
  test("규칙을 지킨 교정 안 답에는 어긋난 자리가 없다", () => {
    expect(answerViolations(CLEAN_CORRECTION_ANSWER, "correction")).toEqual([]);
  });

  test("해요체 사이에 섞인 합쇼체를 잡는다", () => {
    expect(
      answerViolations(
        "지금 받은 그 커피를 가리키니까 the를 붙여요.\n\nthe는 서로 어떤 커피인지 알 수 있을 때 붙입니다.",
        "correction"
      )
    ).toContain("합쇼체");
  });

  test.each([
    ["굵은 글씨", "그래서 **the wrong coffee**라고 해요."],
    ["백틱", "그래서 `the wrong coffee`라고 해요."],
    ["제목", "## the를 붙이는 이유\n\n그 커피를 가리키기 때문이에요."],
    ["이모지", "그 커피를 가리키기 때문이에요. ☕"],
  ])("답을 덮는 %s를 잡는다", (_name, answer) => {
    expect(answerViolations(answer, "correction")).toContain("마크다운 기호");
  });

  test("세 문장이 한 덩어리로 붙어 있으면 잡는다", () => {
    expect(
      answerViolations(
        "지금 받은 그 커피를 가리키니까 the를 붙여요. the wrong coffee는 잘못 나온 그 커피라는 뜻이에요. wrong coffee만 쓰면 어떤 커피인지 정해지지 않아요.",
        "correction"
      )
    ).toContain("문단 없음");
  });

  test.each([
    [
      "되묻기",
      "그 커피를 가리키기 때문이에요. 더 궁금한 게 있으면 말해 주세요.",
    ],
    ["미루기", "그건 나중에 다시 보면 좋겠어요."],
    ["거절", "여기서는 다룰 수 없는 이야기예요."],
    [
      "설명 접기",
      "가정법 과거는 다른 문법이라 여기서는 설명을 펼치지 않을게요.",
    ],
    ["떠넘기기", "자세한 건 선생님께 물어보세요."],
    ["미루기 다른 꼴", "그건 나중에 알려 드릴게요."],
  ])("답을 열어 두는 %s를 잡는다", (_name, answer) => {
    expect(answerViolations(answer, "correction")).toContain("열린 맺음");
  });

  test("설명 안에 쓴 나중을 미루기로 보지 않는다", () => {
    expect(
      answerViolations(
        "나중에 일어날 일을 말할 때는 will을 써요.\n\n이미 하기로 한 일이라면 be going to가 더 자연스러워요.",
        "correction"
      )
    ).toEqual([]);
  });

  test("교정 안 답이 물음표로 끝나면 잡는다", () => {
    expect(
      answerViolations(
        "그 커피를 가리키기 때문이에요.\n\nwrong coffee만 쓰면 어떤 커피인지 정해지지 않겠죠?",
        "correction"
      )
    ).toContain("질문으로 끝남");
  });

  test("교정 밖 답은 영어 예문이 물음표로 끝나도 잡지 않는다", () => {
    expect(
      answerViolations(
        "지금은 주문이 잘못 나온 장면이에요.\n\nCould you check my order, please?",
        "offTopic"
      )
    ).toEqual([]);
  });

  test("예문 줄이 설명에 바로 붙어 있으면 잡는다", () => {
    expect(
      answerViolations(
        "이미 주문한 일이라 I ordered가 맞아요.\nI ordered an iced americano.\n\n지금 주문하는 중이라면 다르게 말해요.",
        "correction"
      )
    ).toContain("붙어 있는 예문 줄");
  });

  test("같은 예문 줄이 두 번 나오면 뒤엣것도 본다", () => {
    expect(
      answerViolations(
        "이렇게 말해요.\n\nI ordered it.\n\n다시 말하면 이래요.\nI ordered it.",
        "correction"
      )
    ).toContain("붙어 있는 예문 줄");
  });

  test("한국어 문장 안에 이어진 영어는 잡지 않는다", () => {
    expect(
      answerViolations(
        "여기서는 I think this is the wrong coffee가 맞아요.\n\n지금 받은 그 커피를 가리키기 때문이에요.",
        "correction"
      )
    ).toEqual([]);
  });

  test("두 문장이면 한 덩어리라도 잡지 않는다", () => {
    expect(
      answerViolations(
        "지금 받은 그 커피를 가리키니까 the를 붙여요. wrong coffee만 쓰면 어떤 커피인지 정해지지 않아요.",
        "correction"
      )
    ).toEqual([]);
  });

  test.each(["offTopic", "nextLine"] as const)(
    "%s 답에 돌아가서 쓸 예문이 없으면 잡는다",
    (scope) => {
      expect(
        answerViolations(
          "지금은 저녁 메뉴보다 주문이 잘못 나와서 확인해 달라고 말하는 장면이에요.",
          scope
        )
      ).toContain("돌아갈 예문 없음");
    }
  );

  test("교정 안 답에는 예문이 없어도 잡지 않는다", () => {
    expect(
      answerViolations(
        "지금 받은 그 커피를 가리키니까 the를 붙여요.",
        "correction"
      )
    ).toEqual([]);
  });

  test("교정 안 답은 320자를 넘으면 잡는다", () => {
    expect(
      answerViolations(`${"그 커피를 가리켜요. ".repeat(32)}`, "correction")
    ).toContain("길이 넘침");
  });

  test("교정 밖 답은 200자를 넘으면 잡는다", () => {
    const long = `${"지금은 주문이 잘못 나온 장면이에요. ".repeat(11)}\n\nCould you check my order, please?`;

    expect(answerViolations(long, "offTopic")).toContain("길이 넘침");
  });
});

/**
 * 검사가 실제로 가르는지 확인하는 자리.
 *
 * 통과하는 답만 보면 아무것도 재지 않는 검사와 구분할 수 없다. 고치기 전
 * 프롬프트의 답이 하나도 통과하지 못해야 이 검사에 뜻이 있다.
 */
describe("실제로 받은 답", () => {
  test.each(PREVIOUS_PROMPT_ANSWERS)(
    "고치기 전 프롬프트의 답은 통과하지 못한다: $question",
    ({ answer, scope }) => {
      expect(answerViolations(answer, scope).length).toBeGreaterThan(0);
    }
  );

  test.each(CURRENT_PROMPT_ANSWERS)(
    "확정한 프롬프트의 답은 통과한다: $question",
    ({ answer, scope }) => {
      expect(answerViolations(answer, scope)).toEqual([]);
    }
  );
});
