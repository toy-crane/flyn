import { createHash } from "node:crypto";
import { encode } from "blurhash";
import sharp from "sharp";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 원본 내용으로 캐시가 섞이지 않는 경로와 그 원본의 미리보기를 함께 만든다. */
export async function prepareStoryCover(slug: string, input: Uint8Array) {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("스토리 slug를 확인해 주세요.");
  }
  const bytes = await sharp(input).rotate().png().toBuffer();
  const digest = createHash("sha256").update(bytes).digest("hex");
  const { data, info } = await sharp(bytes)
    .resize(32, 32, { fit: "inside" })
    .flatten({ background: "#ffffff" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    blurhash: encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      3
    ),
    bytes,
    path: `${slug}-${digest}.png`,
  };
}
