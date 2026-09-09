import { expect, test } from "bun:test";
import { decode } from "blurhash";
import sharp from "sharp";
import { prepareStoryCover } from "./prepare";

test("표지를 교체하면 원본 경로와 미리보기도 함께 바뀐다", async () => {
  const red = await sharp({
    create: { background: "#ff0000", channels: 4, height: 8, width: 8 },
  })
    .png()
    .toBuffer();
  const blue = await sharp({
    create: { background: "#0000ff", channels: 4, height: 8, width: 8 },
  })
    .png()
    .toBuffer();
  const first = await prepareStoryCover("cafe", red);
  const same = await prepareStoryCover("cafe", red);
  const next = await prepareStoryCover("cafe", blue);
  expect(first).toEqual(same);
  expect(first.path).not.toBe(next.path);
  expect(first.blurhash).not.toBe(next.blurhash);
  const pixel = decode(first.blurhash, 1, 1);
  expect(pixel[0]).toBeGreaterThan(240);
  expect(pixel[1]).toBeLessThan(10);
  expect(pixel[2]).toBeLessThan(10);
});
