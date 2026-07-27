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

  /**
   * **상한은 여기서 보지 않는다.** 입력칸의 maxLength가 사람이 세는
   * 단위(grapheme)로 이미 막고 있어서, 여기서 다시 세면 단위가 어긋나 입력은
   * 되는데 버튼만 죽는다 — NFD 한글과 ZWJ 이모지에서 실제로 그랬다.
   */
  it("긴 이름을 여기서 막지 않는다 — 길이는 입력칸이 정한다", () => {
    expect(isDisplayNameSubmittable("a".repeat(DISPLAY_NAME_MAX * 4))).toBe(
      true
    );
  });

  it("이모지 이름을 받아들인다", () => {
    expect(isDisplayNameSubmittable("👍".repeat(DISPLAY_NAME_MAX))).toBe(true);
  });
});
