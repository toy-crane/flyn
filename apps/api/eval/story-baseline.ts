import { execFileSync } from "node:child_process";
import { Transpiler } from "bun";
import type { episodeSystemPrompt } from "../src/features/episode/episode";

// 기능 브랜치의 rebase/squash로 사라지지 않는 병합 전 main 커밋이다.
export const STORY_BASELINE_REVISION =
  "2bbac0382e27205092b05240b2f7dddb87a14e49";

export async function loadBaselineEpisodePrompt(): Promise<
  typeof episodeSystemPrompt
> {
  const source = execFileSync(
    "git",
    [
      "show",
      `${STORY_BASELINE_REVISION}:apps/api/src/features/episode/episode.ts`,
    ],
    { encoding: "utf8" }
  );
  // 고정된 저장소 커밋의 순수 모듈이다. 현재 함수에서 일부 줄을 지워 흉내 내지 않는다.
  const javascript = new Transpiler({ loader: "ts" }).transformSync(source);
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
  return module.episodeSystemPrompt;
}
