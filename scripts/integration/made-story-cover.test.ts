import { beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import sharp from "sharp";

import {
  type LocalStack,
  readLocalStack,
  type SignedInUser,
  signInWithEmailCode,
  uniqueTestEmail,
} from "./local-supabase";

/**
 * 로컬 스택에서 도는 검사다. 진짜 Auth, 진짜 Storage, 진짜 RLS를 지난다.
 *
 * pgTAP은 `storage.objects`에 직접 넣어 정책만 본다. 여기서는 앱이 실제로 쓰는
 * Storage API를 지나므로, 정책과 API가 함께 막고 함께 허락하는지가 보인다.
 *
 * `bun run test`에는 들어가지 않는다. `bun run db:start` 뒤
 * `bun run test:integration`으로 돌린다.
 */

const SIGN_IN_TIMEOUT_MS = 60_000;

let stack: LocalStack;
let maker: SignedInUser;
let stranger: SignedInUser;

async function png(colour: string): Promise<Uint8Array> {
  return new Uint8Array(
    await sharp({
      create: { background: colour, channels: 4, height: 8, width: 8 },
    })
      .png()
      .toBuffer()
  );
}

/** 앱이 저장할 카드 하나. 표지를 붙일 스토리가 있어야 한다. */
function outline(title: string) {
  return {
    characters: [
      { name: "Lena", persona: "30대 호텔 프런트 직원이다.", position: 1 },
    ],
    completionCopy: "지나왔어요.",
    completionTitle: "끝냈어요",
    coverEmoji: "📘",
    episodes: [
      {
        castNames: ["Lena"],
        endingCompromise: "다른 방을 받았을 때",
        endingFailure: "방을 받지 못했을 때",
        endingSuccess: "방을 받았을 때",
        number: 1,
        opening: "밤늦은 프런트 앞이다.\nLena: I cannot find your booking.",
        preview: "예약이 없대요.",
        situation: "예약을 찾아 보세요",
        situationEmoji: "🏨",
        stage: "상황:\n- 사용자가 말을 해야 풀린다.",
        title: "예약이 없는 호텔",
      },
    ],
    hook: "예약이 없대요",
    intro: "첫 출장의 첫 밤.",
    title,
  };
}

async function makeStory(user: SignedInUser, title: string): Promise<string> {
  const { data, error } = await user.client.rpc("create_story", {
    story: outline(title),
  });

  if (error || !data?.[0]) {
    throw error ?? new Error("스토리를 만들지 못했습니다.");
  }

  return data[0].story_id;
}

beforeAll(async () => {
  stack = await readLocalStack();
  maker = await signInWithEmailCode(stack, uniqueTestEmail("cover-maker"));
  stranger = await signInWithEmailCode(stack, uniqueTestEmail("cover-other"));
}, SIGN_IN_TIMEOUT_MS * 2);

describe("만든 스토리의 표지", () => {
  test("올린 파일이 스토리 행이 가리키는 그 파일이다", async () => {
    const storyId = await makeStory(maker, "표지가 붙는 스토리");
    const bytes = await png("blue");
    const digest = createHash("sha256").update(bytes).digest("hex");
    const path = `made/${maker.userId}/${digest}.png`;
    const { error: uploadError } = await maker.client.storage
      .from("story-covers")
      .upload(path, bytes, { contentType: "image/png", upsert: false });

    expect(uploadError).toBeNull();

    const { error: attachError } = await maker.client.rpc("set_story_cover", {
      cover_blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
      cover_path: path,
      story_id: storyId,
    });

    expect(attachError).toBeNull();

    const { data: story } = await maker.client
      .from("stories")
      .select("cover_blurhash, cover_image_path")
      .eq("id", storyId)
      .single();

    expect(story).toEqual({
      cover_blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
      cover_image_path: path,
    });

    // 앱은 공개 주소로 그림을 읽는다. 그 주소가 올린 바이트를 그대로 돌려준다.
    const url = maker.client.storage.from("story-covers").getPublicUrl(path)
      .data.publicUrl;
    const served = await fetch(url);

    expect(served.status).toBe(200);
    expect(
      createHash("sha256")
        .update(new Uint8Array(await served.arrayBuffer()))
        .digest("hex")
    ).toBe(digest);
  });

  test("남의 폴더에는 올리지 못한다", async () => {
    const bytes = await png("red");
    const digest = createHash("sha256").update(bytes).digest("hex");
    const { error } = await stranger.client.storage
      .from("story-covers")
      .upload(`made/${maker.userId}/${digest}.png`, bytes, {
        contentType: "image/png",
        upsert: false,
      });

    expect(error).not.toBeNull();
  });

  test("공식 표지 자리에는 올리지 못한다", async () => {
    const bytes = await png("green");
    const { error } = await maker.client.storage
      .from("story-covers")
      .upload("mia-cafe-forged.png", bytes, {
        contentType: "image/png",
        upsert: false,
      });

    expect(error).not.toBeNull();
  });

  // 스토리당 한 장이다. 두 번째 표지는 첫 표지를 덮지 않는다.
  test("표지가 이미 있으면 다시 붙지 않는다", async () => {
    const storyId = await makeStory(maker, "표지를 한 번만 받는 스토리");
    const first = await png("blue");
    const firstPath = `made/${maker.userId}/${createHash("sha256")
      .update(first)
      .digest("hex")}.png`;

    await maker.client.storage
      .from("story-covers")
      .upload(firstPath, first, { contentType: "image/png", upsert: false });
    await maker.client.rpc("set_story_cover", {
      cover_blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
      cover_path: firstPath,
      story_id: storyId,
    });

    const second = await png("yellow");
    const secondPath = `made/${maker.userId}/${createHash("sha256")
      .update(second)
      .digest("hex")}.png`;

    await maker.client.storage
      .from("story-covers")
      .upload(secondPath, second, { contentType: "image/png", upsert: false });

    const { error } = await maker.client.rpc("set_story_cover", {
      cover_blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
      cover_path: secondPath,
      story_id: storyId,
    });

    expect(error).toBeNull();

    const { data: story } = await maker.client
      .from("stories")
      .select("cover_image_path")
      .eq("id", storyId)
      .single();

    expect(story?.cover_image_path).toBe(firstPath);
  });

  test("남의 스토리에는 표지를 붙이지 못한다", async () => {
    const storyId = await makeStory(maker, "남이 건드리지 못하는 스토리");
    const bytes = await png("purple");
    const path = `made/${stranger.userId}/${createHash("sha256")
      .update(bytes)
      .digest("hex")}.png`;

    await stranger.client.storage
      .from("story-covers")
      .upload(path, bytes, { contentType: "image/png", upsert: false });

    const { error } = await stranger.client.rpc("set_story_cover", {
      cover_blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
      cover_path: path,
      story_id: storyId,
    });

    expect(error).toBeNull();

    const { data: story } = await maker.client
      .from("stories")
      .select("cover_image_path")
      .eq("id", storyId)
      .single();

    expect(story?.cover_image_path).toBeNull();
  });
});
