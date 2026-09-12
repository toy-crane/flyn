import { expect, test } from "@jest/globals";

import { prepareEpisodeMessage } from "./episode-notation";

test("URL과 이메일 주소의 대소문자는 바꾸지 않는다", () => {
  expect(
    prepareEpisodeMessage("visit https://example.com/i?name=i#i and i agree")
  ).toBe("Visit https://example.com/i?name=i#i and I agree");
  expect(prepareEpisodeMessage("i@example.com is my email. i will write")).toBe(
    "i@example.com is my email. I will write"
  );
});

test.each([
  ["iphone is great", "Iphone is great"],
  ["it is fine", "It is fine"],
  ["i dont like it here", "I dont like it here"],
  ["thanks sarah", "Thanks sarah"],
  ["im gonna go lol", "Im gonna go lol"],
  ["한국어는 그대로예요", "한국어는 그대로예요"],
  ["한국어와 i agree", "한국어와 I agree"],
  ['"hello" she said', '"hello" she said'],
  ["(hello) there", "(hello) there"],
  ["hello! how are you? fine\nthanks", "Hello! How are you? Fine\nThanks"],
  ["élan is french", "Élan is french"],
  ["i’ll go", "I’ll go"],
  ["", ""],
])("표기 규칙: %s", (original, expected) => {
  expect(prepareEpisodeMessage(original)).toBe(expected);
});

test("보내는 문장의 첫 글자와 낱말 i만 대문자로 올린다", () => {
  expect(prepareEpisodeMessage("hello. what is your name")).toBe(
    "Hello. What is your name"
  );
});

test("대문자나 숫자가 섞인 낱말과 한국어 안의 글자는 그대로 둔다", () => {
  expect(
    prepareEpisodeMessage(
      "iPhone eBay macOS\neBay is great. macOS works! abc123 works\n한국i말"
    )
  ).toBe(
    "iPhone eBay macOS\neBay is great. macOS works! abc123 works\n한국i말"
  );
});

test("문장 중간의 i와 아포스트로피가 이어진 i도 올린다", () => {
  expect(
    prepareEpisodeMessage("yesterday i went home. i'm fine and i'll stay")
  ).toBe("Yesterday I went home. I'm fine and I'll stay");
});
