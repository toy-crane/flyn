import { expect, test } from "bun:test";
import { sceneProblems } from "./scene-checks";

test("실제 위반과 같은 이름 없는 영어 줄을 떨어뜨린다", () => {
  expect(
    sceneProblems(
      {
        dialogue: [{ speaker: "", text: "Could you show me your passport?" }],
        ending: null,
      },
      ["Mia"],
      false
    )
  ).toContain("화자 누락 또는 목록 밖 화자");
});
test.each([
  "여권을 보여 주세요.",
  "*smiles* Your passport, please.",
  "I hand you the passport.",
])("대사 밖의 언어와 행동을 찾는다: %s", (text) => {
  expect(
    sceneProblems(
      { dialogue: [{ speaker: "Mia", text }], ending: null },
      ["Mia"],
      false
    ).length
  ).toBeGreaterThan(0);
});
test("이름 붙은 영어 대사와 진행 중 상태를 허용한다", () => {
  expect(
    sceneProblems(
      {
        dialogue: [{ speaker: "Mia", text: "Your passport, please." }],
        ending: null,
      },
      ["Mia"],
      false
    )
  ).toEqual([]);
});
