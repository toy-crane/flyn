import { improvedSegments } from "./sentence-diff";

function underlined(delivered: string, improved: string) {
  return improvedSegments(delivered, improved)
    .filter((segment) => segment.changed)
    .map((segment) => segment.text);
}

function joined(delivered: string, improved: string) {
  return improvedSegments(delivered, improved)
    .map((segment) => segment.text)
    .join("");
}

describe("개선 문장의 밑줄", () => {
  it("낱말 안에서 바뀐 자리만 짚는다", () => {
    expect(
      underlined(
        "Sound good. Can you make it oat milk?",
        "Sounds good. Can you make it with oat milk?"
      )
    ).toEqual(["s", "with"]);
  });

  it("도막을 이어 붙이면 개선 문장 그대로다", () => {
    expect(
      joined(
        "Sound good. Can you make it oat milk?",
        "Sounds good. Can you make it with oat milk?"
      )
    ).toBe("Sounds good. Can you make it with oat milk?");
  });

  it("고친 데가 없으면 밑줄도 없다", () => {
    const segments = improvedSegments(
      "That's all, thanks!",
      "That's all, thanks!"
    );

    expect(segments).toEqual([{ changed: false, text: "That's all, thanks!" }]);
  });

  it("낱말을 통째로 바꾸면 그 낱말을 짚는다", () => {
    expect(underlined("I want a coffee", "I'd like a coffee")).toEqual([
      "'d",
      "like",
    ]);
  });

  // 덜어 내기만 한 변경은 밑줄을 그을 자리가 없다. 무엇을 뺐는지는 이유가 말한다.
  it("낱말을 빼기만 했으면 밑줄이 없다", () => {
    expect(underlined("I am very running late", "I am running late")).toEqual(
      []
    );
    expect(joined("I am very running late", "I am running late")).toBe(
      "I am running late"
    );
  });

  it("밑줄이 낱말 밖 공백으로 새지 않는다", () => {
    for (const segment of improvedSegments(
      "Can I get oat milk",
      "Can I get it with oat milk"
    )) {
      expect(segment.changed && segment.text.trim() !== segment.text).toBe(
        false
      );
    }
  });
});
