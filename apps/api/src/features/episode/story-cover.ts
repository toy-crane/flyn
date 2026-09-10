import { createHash } from "node:crypto";
import { generateImage } from "ai";
import { encode } from "blurhash";
import { decode } from "fast-png";

import type { StoryOutline } from "./story-creation";

/** 표지 그림이 사는 버킷. 공식 표지와 같은 곳이다. */
export const COVER_BUCKET = "story-covers";

/** 표지 모델. 값과 품질은 스펙이 정했고, 여기서는 자리만 둔다. */
export const COVER_MODEL_ENV = "AI_GATEWAY_IMAGE_MODEL";
const DEFAULT_COVER_MODEL = "openai/gpt-image-1-mini";

/**
 * 표지의 모양을 정하는 문구. 스토리마다 바뀌지 않는다.
 *
 * 공식 표지를 보고 적었다. 단색 배경에 상반신 하나, 글자와 로고와 풍경 없음이
 * 공식 표지의 모양이고, 목록의 작은 타일에서 스토리를 알아보게 하는 것도
 * 그 단순함이다. 장소는 옷차림과 손에 든 것으로만 나타나고 배경으로 그리지
 * 않는다.
 */
const COVER_STYLE = [
  "Anime-inspired digital illustration with soft cel shading and clean lines.",
  "One flat saturated colour fills the entire frame as the background: no gradient, no floor, no wall, no furniture, no room, no scenery.",
  "Bust portrait of one adult, centred, facing the viewer, warm and gentle expression.",
  "They may hold one small object that suits their work.",
  "No text, no letters, no logos, no name tags, no signage.",
  "The place informs only their clothing and that one object; never draw the place itself.",
].join(" ");

/** BlurHash를 만들기 전에 줄이는 한 변. 공식 표지와 같은 크기다. */
const PREVIEW_SIDE = 32;
const BLURHASH_X = 4;
const BLURHASH_Y = 3;

/** 스토리에 붙는 표지 한 장. */
export interface StoryCover {
  blurhash: string;
  path: string;
}

/** 표지를 올리는 자리. 테스트가 실제 Storage 없이 이 자리를 대신한다. */
export interface CoverBucket {
  upload: (
    path: string,
    bytes: Uint8Array,
    options?: { cacheControl?: string; contentType?: string; upsert?: boolean }
  ) => Promise<{ error: { message: string } | null }>;
}

export function resolveCoverModelId(): string {
  return process.env[COVER_MODEL_ENV]?.trim() || DEFAULT_COVER_MODEL;
}

/**
 * 이 카드로 그릴 그림을 말하는 문구.
 *
 * 스토리마다 바뀌는 것은 순서 1번 인물의 설명과 장소뿐이다. 사용자가 적은
 * 실제 사람이나 회사 이름은 들어가지 않는다. 이름과 제목과 한 줄 소개가 모두
 * 사용자의 말을 그대로 옮길 수 있는 자리라서, 여기서는 역할 설명만 쓴다.
 *
 * 그릴 인물이 없으면 문구를 만들지 않는다. 인물이 없는 카드는 저장에서도
 * 걸리지만 그림은 그보다 먼저 시작한다.
 */
export function coverPrompt(outline: StoryOutline): string | undefined {
  const lead = outline.characters.find((person) => person.position === 1);

  if (!lead?.role.trim()) {
    return;
  }

  const place = outline.setting?.trim();

  return [
    COVER_STYLE,
    "",
    `Person: ${lead.role.trim()}`,
    place ? `Place: ${place}` : "",
  ]
    .join("\n")
    .trim();
}

/** 게이트웨이에 그림 한 장을 받는다. 크기와 품질은 스펙이 정했다. */
async function drawCover(prompt: string): Promise<Uint8Array> {
  const result = await generateImage({
    model: resolveCoverModelId(),
    n: 1,
    prompt,
    providerOptions: { openai: { quality: "low" } },
    size: "1024x1024",
  });

  return result.image.uint8Array;
}

/**
 * 그림에서 BlurHash를 만든다.
 *
 * 32×32로 줄여 넘긴다. 원본 그대로 넘기면 백만 화소를 도는 계산이 되고, 결과는
 * 어차피 흐릿한 미리보기다. 줄이는 방법은 건너뛰며 고르기다. 미리보기의 큰
 * 색덩이를 잡는 데는 이것으로 충분하다.
 */
function previewHash(bytes: Uint8Array): string {
  const image = decode(bytes);
  const pixels = new Uint8ClampedArray(PREVIEW_SIDE * PREVIEW_SIDE * 4);
  // 16비트 그림은 값이 0..65535로 온다. 8비트 자리에 맞춰 줄인다.
  const scale = image.depth === 16 ? 1 / 257 : 1;
  const hasAlpha = image.channels === 2 || image.channels === 4;
  const grey = image.channels < 3;

  for (let y = 0; y < PREVIEW_SIDE; y += 1) {
    for (let x = 0; x < PREVIEW_SIDE; x += 1) {
      const from =
        (Math.floor((y * image.height) / PREVIEW_SIDE) * image.width +
          Math.floor((x * image.width) / PREVIEW_SIDE)) *
        image.channels;
      const to = (y * PREVIEW_SIDE + x) * 4;
      const first = Number(image.data[from]) * scale;

      pixels[to] = first;
      pixels[to + 1] = grey ? first : Number(image.data[from + 1]) * scale;
      pixels[to + 2] = grey ? first : Number(image.data[from + 2]) * scale;
      // 투명한 자리는 흰 바탕에 얹은 것으로 본다. 공식 표지와 같은 처리다.
      pixels[to + 3] = 255;

      if (hasAlpha) {
        const alpha = Number(image.data[from + image.channels - 1]) * scale;
        const cover = alpha / 255;

        for (let channel = 0; channel < 3; channel += 1) {
          pixels[to + channel] =
            Number(pixels[to + channel]) * cover + 255 * (1 - cover);
        }
      }
    }
  }

  return encode(pixels, PREVIEW_SIDE, PREVIEW_SIDE, BLURHASH_X, BLURHASH_Y);
}

/**
 * 만든 스토리의 표지 한 장.
 *
 * 파일 이름은 내용의 해시다. 공식 표지와 같은 규칙이라 캐시가 섞이지 않고,
 * 같은 그림을 두 사람이 만들어도 파일 하나로 모인다. 자리는 자기 폴더 안이다.
 * 그 폴더 밖에는 정책이 넣지 못하게 막는다.
 *
 * 실패하면 아무것도 돌려주지 않는다. 표지가 없는 스토리는 빈 색 상자로 보이고
 * 그것이 스펙이 정한 실패의 모습이다. 여기서 던지면 각본까지 함께 무너진다.
 */
export async function madeCover({
  bucket,
  draw = drawCover,
  outline,
  ownerId,
}: {
  bucket: CoverBucket;
  draw?: (prompt: string) => Promise<Uint8Array>;
  outline: StoryOutline;
  ownerId: string;
}): Promise<StoryCover | undefined> {
  const prompt = coverPrompt(outline);

  if (!prompt) {
    return;
  }

  try {
    const bytes = await draw(prompt);
    const digest = createHash("sha256").update(bytes).digest("hex");
    const path = `made/${ownerId}/${digest}.png`;
    const blurhash = previewHash(bytes);
    const { error } = await bucket.upload(path, bytes, {
      cacheControl: "31536000",
      contentType: "image/png",
      upsert: false,
    });

    /*
      이름이 내용의 해시이므로, 이미 있는 파일은 지금 올리려던 그림과 같은
      그림이다. 부딪힘이 아니라 이미 도착해 있는 것이다.
    */
    if (error && !error.message.includes("already exists")) {
      throw new Error(error.message);
    }

    return { blurhash, path };
  } catch {
    // 표지가 없는 스토리는 빈 색 상자로 보인다. 그것이 실패의 모습이다.
  }
}
