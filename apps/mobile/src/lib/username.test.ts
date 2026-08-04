import {
  createUsernameSuggestions,
  deriveUsernameBase,
  findAvailableUsername,
  isUsernameValid,
  normalizeUsername,
  USERNAME_MAX,
  USERNAME_MIN,
} from "./username";

describe("아이디 규칙", () => {
  it("입력은 소문자로 정규화한다", () => {
    expect(normalizeUsername("Toy.Crane_7")).toBe("toy.crane_7");
  });

  it("4–20자의 영문 소문자·숫자·마침표·밑줄을 받는다", () => {
    expect(isUsernameValid("a1_b.c")).toBe(true);
    expect(isUsernameValid("a".repeat(USERNAME_MIN - 1))).toBe(false);
    expect(isUsernameValid("a".repeat(USERNAME_MAX + 1))).toBe(false);
  });

  it("첫 글자와 끝 글자는 영문 소문자나 숫자여야 한다", () => {
    expect(isUsernameValid(".alice")).toBe(false);
    expect(isUsernameValid("alice_")).toBe(false);
  });

  it("연속 마침표와 허용 밖 문자를 막는다", () => {
    expect(isUsernameValid("alice..id")).toBe(false);
    expect(isUsernameValid("alice-id")).toBe(false);
  });

  it.each([
    "admin",
    "administrator",
    "flyn",
    "official",
    "root",
    "staff",
    "support",
    "system",
  ])("예약어 %s를 막는다", (reserved) => {
    expect(isUsernameValid(reserved)).toBe(false);
  });
});

describe("deriveUsernameBase", () => {
  it("이메일의 로컬 파트에서 + 태그를 버리고 소문자로 만든다", () => {
    expect(deriveUsernameBase("ToyCrane+news@example.com")).toBe("toycrane");
  });

  it("허용 밖 문자를 지우고 연속 마침표와 양끝 기호를 정리한다", () => {
    expect(deriveUsernameBase("._toy..crane-_@example.com")).toBe("toy.crane");
  });

  it("20자로 자르고 빈 결과에는 user를 쓴다", () => {
    expect(deriveUsernameBase(`${"a".repeat(30)}@example.com`)).toHaveLength(
      USERNAME_MAX
    );
    expect(deriveUsernameBase("😀@example.com")).toBe("user");
  });
});

describe("사용 가능한 후보", () => {
  it("파생값이 유효하고 비어 있으면 그대로 쓴다", async () => {
    const available = jest.fn().mockResolvedValue(true);

    await expect(
      findAvailableUsername("hello@example.com", available, () => "1234")
    ).resolves.toBe("hello");
    expect(available).toHaveBeenCalledWith("hello");
  });

  it("파생값이 짧거나 이미 쓰였으면 4자리 숫자를 붙인다", async () => {
    const available = jest.fn(async (candidate: string) =>
      candidate.endsWith("5678")
    );
    const suffixes = ["1234", "5678"];

    await expect(
      findAvailableUsername(
        "ab@example.com",
        available,
        () => suffixes.shift() ?? "9999"
      )
    ).resolves.toBe("ab5678");
  });

  it("긴 파생값에는 숫자를 붙일 자리를 먼저 만든다", async () => {
    const available = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(
      findAvailableUsername(
        `${"a".repeat(20)}@example.com`,
        available,
        () => "1234"
      )
    ).resolves.toBe(`${"a".repeat(16)}1234`);
  });

  it("중복 아이디를 바탕으로 서로 다른 추천 3개를 만든다", async () => {
    const suffixes = ["1111", "1111", "2222", "3333"];
    const available = jest.fn().mockResolvedValue(true);

    await expect(
      createUsernameSuggestions(
        "toycrane",
        available,
        () => suffixes.shift() ?? "4444"
      )
    ).resolves.toEqual(["toycrane1111", "toycrane2222", "toycrane3333"]);
  });
});
