import { readdir, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { file } from "bun";
import { prepareStoryCover } from "./prepare";

const root = resolve(import.meta.dir, "../..");
const directory = resolve(root, "supabase/story-covers");
const check = process.argv.includes("--check");
const sql = [
  "-- bun run covers:prepare로 생성한다. 원본 경로와 해시는 함께 갱신한다.",
];
const slugs = new Set<string>();
const filenames = (await readdir(directory)).sort();
for (const filename of filenames) {
  if (!filename.endsWith(".png")) {
    continue;
  }
  const slug = filename.replace(/(?:-[a-f0-9]{64})?\.png$/, "");
  if (slugs.has(slug)) {
    throw new Error(`${slug}의 표지 파일이 둘 이상입니다.`);
  }
  slugs.add(slug);
  const input = new Uint8Array(
    // biome-ignore lint/performance/noAwaitInLoops: 같은 폴더의 파일 이름을 순서대로 바꾸고 SQL 순서를 고정한다.
    await file(resolve(directory, filename)).arrayBuffer()
  );
  const cover = await prepareStoryCover(slug, input);
  if (check) {
    if (filename !== cover.path) {
      throw new Error(`${filename}: bun run covers:prepare가 필요합니다.`);
    }
  } else {
    await writeFile(resolve(directory, filename), cover.bytes);
    if (filename !== cover.path) {
      await rename(
        resolve(directory, filename),
        resolve(directory, cover.path)
      );
    }
  }
  sql.push(
    `update public.stories set cover_image_path = '${cover.path}', cover_blurhash = '${cover.blurhash}' where slug = '${slug}';`
  );
}
const output = `${sql.join("\n")}\n`;
const target = resolve(root, "supabase/seed-story-covers.sql");
if (check) {
  if ((await file(target).text()) !== output) {
    throw new Error(
      "표지 해시가 원본과 다릅니다. bun run covers:prepare가 필요합니다."
    );
  }
} else {
  await writeFile(target, output);
}
console.log(`표지 ${slugs.size}개의 원본 경로와 BlurHash를 확인했습니다.`);
