import {
  DISPLAY_NAME_MAX,
  displayNameLength,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "./display-name";

describe("normalizeDisplayName", () => {
  it("앞뒤 공백을 제거한다", () => {
    expect(normalizeDisplayName("  훈  ")).toBe("훈");
  });

  it("가운데 공백은 건드리지 않는다", () => {
    expect(normalizeDisplayName(" 김 한울 ")).toBe("김 한울");
  });
});

describe("isDisplayNameSubmittable", () => {
  it("빈 문자열을 거부한다", () => {
    expect(isDisplayNameSubmittable("")).toBe(false);
  });

  it("공백뿐인 이름을 거부한다", () => {
    expect(isDisplayNameSubmittable("   ")).toBe(false);
  });

  it("한 글자를 받아들인다", () => {
    expect(isDisplayNameSubmittable("훈")).toBe(true);
  });

  it(`${DISPLAY_NAME_MAX}자를 받아들이고 한 자 더는 거부한다`, () => {
    expect(isDisplayNameSubmittable("a".repeat(DISPLAY_NAME_MAX))).toBe(true);
    expect(isDisplayNameSubmittable("a".repeat(DISPLAY_NAME_MAX + 1))).toBe(
      false
    );
  });

  it("공백을 제거한 뒤의 길이로 판단한다", () => {
    expect(isDisplayNameSubmittable(` ${"a".repeat(DISPLAY_NAME_MAX)} `)).toBe(
      true
    );
  });

  /**
   * DB의 char_length와 어긋나면 앱이 DB보다 먼저 막는다. `.length`로 세면 이
   * 이름은 100이 되어 거부되지만, DB는 50으로 세어 받아들인다.
   */
  it("이모지를 DB와 같은 단위(문자 수)로 센다", () => {
    const fifty = "👍".repeat(DISPLAY_NAME_MAX);

    expect(displayNameLength(fifty)).toBe(DISPLAY_NAME_MAX);
    expect(isDisplayNameSubmittable(fifty)).toBe(true);
    expect(isDisplayNameSubmittable(`${fifty}👍`)).toBe(false);
  });
});
