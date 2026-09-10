/**
 * 결말 축하의 Lottie 파일을 앱에 써 넣는다. `--check`는 쓰지 않고, 앱에 있는
 * 파일이 지금 생성한 내용과 같은지만 본다. 파일은 Biome이 다시 줄 바꿈하므로
 * 글자가 아니라 내용으로 비교한다.
 */

import { resolve } from "node:path";
import { file, write } from "bun";
import { buildClosingBurst, buildClosingMark } from "./lottie";

const root = resolve(import.meta.dir, "../..");
const directory = resolve(
  root,
  "apps/mobile/src/features/episode/ui/celebration"
);
const check = process.argv.includes("--check");
const documents = {
  "closing-burst-half.json": buildClosingBurst({ half: true }),
  "closing-burst.json": buildClosingBurst({ half: false }),
  "closing-mark-quiet.json": buildClosingMark({ ring: false }),
  "closing-mark.json": buildClosingMark({ ring: true }),
};

for (const [filename, document] of Object.entries(documents)) {
  const target = resolve(directory, filename);
  const expected = JSON.stringify(document);
  if (check) {
    // biome-ignore lint/performance/noAwaitInLoops: 파일 넷을 순서대로 견주고 첫 차이에서 멈춘다.
    const current = await file(target)
      .json()
      .then((parsed: unknown) => JSON.stringify(parsed))
      .catch(() => null);
    if (current !== expected) {
      throw new Error(`${filename}: bun run celebration:lottie가 필요합니다.`);
    }
  } else {
    await write(target, `${JSON.stringify(document, null, 2)}\n`);
  }
}
console.log(
  `결말 축하 Lottie 파일 ${Object.keys(documents).length}개를 ${check ? "확인" : "생성"}했습니다.`
);
