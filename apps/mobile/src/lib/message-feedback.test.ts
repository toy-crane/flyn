import {
  findFeedback,
  type MessageFeedback,
  messageMark,
  withArrivedFeedback,
} from "./message-feedback";

function feedback(overrides: Partial<MessageFeedback> = {}): MessageFeedback {
  return {
    delivered: "That's all, thanks!",
    improvedSentence: null,
    messageId: "user-1",
    reasons: [],
    sourceText: null,
    verdict: "clear",
    ...overrides,
  };
}

describe("말풍선 옆 표시", () => {
  it("한글로 썼으면 번역 표시다", () => {
    expect(
      messageMark(
        feedback({
          delivered: "What do you recommend today?",
          sourceText: "오늘 커피 뭐가 좋아요?",
        })
      )
    ).toBe("translated");
  });

  it("번역한 문장은 판정이 improvable이어도 번역 표시가 먼저다", () => {
    // 말풍선의 영어는 내가 쓴 문장이 아니다. 먼저 말할 것은 무엇을 썼는지다.
    expect(
      messageMark(
        feedback({
          delivered: "What do you recommend today?",
          improvedSentence: "What would you recommend today?",
          sourceText: "오늘 커피 뭐가 좋아요?",
          verdict: "improvable",
        })
      )
    ).toBe("translated");
  });

  it("더 자연스럽게 쓸 여지가 있으면 교정 표시다", () => {
    expect(
      messageMark(
        feedback({
          delivered: "Sound good. make it oat milk?",
          improvedSentence: "Sounds good. Can you make it with oat milk?",
          sourceText: null,
          verdict: "improvable",
        })
      )
    ).toBe("improvable");
  });

  it("그대로 잘 통했으면 통과 표시다", () => {
    expect(messageMark(feedback())).toBe("clear");
  });

  it("두 문장을 견주지 않고 원문의 유무로만 가른다", () => {
    // 전에는 원문과 전달문이 다른지로 짐작했다. 그래서 판정이 늦게 돌아 원문을
    // 잃은 발화가 번역 표시를 통째로 잃었다. 두 문장이 같아도 원문이 있으면
    // 한글로 쓴 것이다.
    expect(
      messageMark(
        feedback({
          delivered: "OK",
          sourceText: "OK",
        })
      )
    ).toBe("translated");
  });
});

describe("판정 찾기", () => {
  it("판정이 없는 발화는 비어 있다", () => {
    expect(findFeedback([feedback()], "user-2")).toBeNull();
    expect(findFeedback([feedback()], "user-1")).toEqual(feedback());
  });

  it("도착한 판정을 얹되 이미 있는 발화는 그대로 둔다", () => {
    const stored = feedback({ messageId: "user-1" });
    const arrived = feedback({
      messageId: "user-1",
      reasons: ["나중에 온 같은 발화"],
      verdict: "clear",
    });
    const fresh = feedback({ messageId: "user-2" });

    expect(withArrivedFeedback([stored], [arrived, fresh])).toEqual([
      stored,
      fresh,
    ]);
  });
});
