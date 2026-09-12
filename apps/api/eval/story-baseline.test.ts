import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import {
  loadBaselineEpisodePrompt,
  STORY_BASELINE_REVISION,
} from "./story-baseline";

test("평가 기준은 main 이력에 있고 기억 규칙은 그 버전 그대로 읽는다", async () => {
  expect(
    execFileSync("git", [
      "merge-base",
      "--is-ancestor",
      STORY_BASELINE_REVISION,
      "HEAD",
    ]).length
  ).toBe(0);
  const prompt = await loadBaselineEpisodePrompt();
  const result = prompt(
    {
      cast: [{ name: "Noah", persona: "직원", position: 1 }],
      endings: { compromise: "타협", failure: "실패", success: "성공" },
      id: "second",
      number: 2,
      opening: "Noah: Hello.",
      preview: "매장 방문",
      situation: "물어보세요",
      situationEmoji: "☕",
      stage: "상황:\n- 매장이다.",
      storyId: "store",
      title: "재방문",
    },
    [
      {
        choice: null,
        episode: 1,
        kind: "성공",
        outcome: "새 기계로 교환했다.",
        question: null,
        relationship: null,
        title: "교환",
      },
    ]
  );
  expect(result).toContain("새 기계로 교환했다.");
  expect(result).toContain(
    "이미 있었던 일이다. 없던 일로 만들거나 다르게 기억하지 않는다.\n"
  );
  expect(result).not.toContain("교환과 수리처럼");
  expect(result).not.toContain("인사나 지난 일의 언급만");
});
