/**
 * 결말 축하의 Lottie 파일을 앱에 써 넣는다. 파일 이름의 `.gen.`은 Biome이 손대지
 * 않는 생성 파일 표시다. 키를 정렬하면 도형의 `ty`가 뒤로 밀려 Android가 도형을
 * 비운다. `--check`는 쓰지 않고, 앱에 있는 파일이 지금 생성한 내용과 같은지만
 * 본다.
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
  "closing-burst-half.gen.json": buildClosingBurst({ half: true }),
  "closing-burst.gen.json": buildClosingBurst({ half: false }),
  "closing-mark.gen.json": buildClosingMark(),
};

const results = await Promise.all(
  Object.entries(documents).map(async ([filename, document]) => {
    const target = resolve(directory, filename);
    const expected = `${JSON.stringify(document, null, 2)}\n`;
    if (!check) {
      await write(target, expected);
      return null;
    }
    const current = await file(target)
      .text()
      .catch(() => null);
    return current === expected ? null : filename;
  })
);
const stale = results.filter((filename) => filename !== null);
if (stale.length > 0) {
  throw new Error(
    `${stale.join(", ")}: bun run celebration:lottie가 필요합니다.`
  );
}
console.log(
  `결말 축하 Lottie 파일 ${Object.keys(documents).length}개를 ${check ? "확인" : "생성"}했습니다.`
);
