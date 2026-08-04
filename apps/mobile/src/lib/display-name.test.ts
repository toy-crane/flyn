import {
  DISPLAY_NAME_MAX,
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

  // btrim(x)가 ASCII 스페이스만 지우던 시절 DB가 이것들을 통과시켰다.
  it("탭·개행·NBSP·전각 공백도 제거한다", () => {
    expect(normalizeDisplayName("\t\n한울 　")).toBe("한울");
  });

  // JS .trim()은 zero-width를 공백으로 치지 않는다. 제로폭 공백 하나를
  // 붙여넣으면 앱과 DB를 모두 통과해 보이지 않는 이름이 저장됐다.
  it("제로폭 문자와 BOM도 제거한다", () => {
    expect(normalizeDisplayName("​﻿한울​")).toBe("한울");
  });

  it("제어 문자도 제거한다", () => {
    expect(normalizeDisplayName("한울")).toBe("한울");
  });

  // 양 끝만 잘라낸다. U+200D는 이모지를 잇는 문자라 가운데에서 걷어내면
  // 가족 이모지가 쪼개진다.
  it("ZWJ로 이어진 이모지를 쪼개지 않는다", () => {
    expect(normalizeDisplayName("👨‍👩‍👧")).toBe("👨‍👩‍👧");
  });
});

describe("isDisplayNameSubmittable", () => {
  it("빈 문자열을 거부한다", () => {
    expect(isDisplayNameSubmittable("")).toBe(false);
  });

  it("공백뿐인 이름을 거부한다", () => {
    expect(isDisplayNameSubmittable("   ")).toBe(false);
  });

  it("보이지 않는 문자뿐인 이름을 거부한다", () => {
    expect(isDisplayNameSubmittable("​　\t")).toBe(false);
  });

  it("한 글자를 받아들인다", () => {
    expect(isDisplayNameSubmittable("훈")).toBe(true);
  });

  it("32 grapheme까지 받아들이고 33 grapheme은 거부한다", () => {
    expect(isDisplayNameSubmittable("a".repeat(DISPLAY_NAME_MAX))).toBe(true);
    expect(isDisplayNameSubmittable("a".repeat(DISPLAY_NAME_MAX + 1))).toBe(
      false
    );
  });

  it("NFD로 조합한 한글도 한 글자로 센다", () => {
    expect(isDisplayNameSubmittable("훈".repeat(DISPLAY_NAME_MAX))).toBe(true);
  });

  it("여러 언어의 글자·숫자와 실제 이름에 쓰는 구두점을 받는다", () => {
    expect(isDisplayNameSubmittable("Anne-Marie O'Brien. 7 김한울")).toBe(true);
    expect(isDisplayNameSubmittable("أحمد 7")).toBe(true);
  });

  it("이모지와 장식용 기호를 거부한다", () => {
    expect(isDisplayNameSubmittable("훈👍")).toBe(false);
    expect(isDisplayNameSubmittable("훈★")).toBe(false);
  });

  it("허용하지 않은 구두점을 거부한다", () => {
    expect(isDisplayNameSubmittable("김_한울")).toBe(false);
    expect(isDisplayNameSubmittable("김/한울")).toBe(false);
  });
});
