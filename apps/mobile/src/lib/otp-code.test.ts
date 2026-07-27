import {
  CODE_LENGTH,
  isCodeComplete,
  isEmailSubmittable,
  normalizeCode,
} from "./otp-code";

describe("normalizeCode", () => {
  it("붙여넣은 문자열에서 숫자만 남긴다", () => {
    // 앞에서 자르면 "코드: 4"가 되어 6자로 보여도 검증은 실패한다.
    expect(normalizeCode("코드: 448183")).toBe("448183");
  });

  it("숫자가 6자를 넘으면 뒤를 버린다", () => {
    expect(normalizeCode("4481839999")).toBe("448183");
  });

  it("숫자를 남긴 뒤에 자른다 — 자르고 나서 남기지 않는다", () => {
    // 구분자가 섞인 코드. 먼저 6자로 자르면 "448-18"에서 숫자가 5개뿐이다.
    expect(normalizeCode("448-183")).toBe("448183");
  });

  it("숫자가 없으면 빈 문자열이다", () => {
    expect(normalizeCode("코드를 입력하세요")).toBe("");
  });
});

describe("isCodeComplete", () => {
  it(`${CODE_LENGTH}자리를 채워야 완성이다`, () => {
    expect(isCodeComplete("12345")).toBe(false);
    expect(isCodeComplete("123456")).toBe(true);
  });
});

describe("isEmailSubmittable", () => {
  it("@가 있으면 제출을 연다", () => {
    expect(isEmailSubmittable("me@example.test")).toBe(true);
  });

  it("앞뒤 공백은 무시한다", () => {
    expect(isEmailSubmittable("  me@example.test  ")).toBe(true);
  });

  it("@가 없으면 막는다", () => {
    expect(isEmailSubmittable("me")).toBe(false);
    expect(isEmailSubmittable("   ")).toBe(false);
  });
});
