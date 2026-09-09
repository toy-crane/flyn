import { expect, test } from "bun:test";
import type { Database } from "@repo/supabase";
import { createClient } from "@supabase/supabase-js";
import { file } from "bun";
import sharp from "sharp";
import { publishStoryCover } from "../story-covers/publish";

const statusFile = process.env.STORY_COVER_TEST_STATUS;

test.skipIf(!statusFile)(
  "표지 등록·교체·재실행이 실제 Storage와 DB에 같은 원본·해시를 남긴다",
  async () => {
    if (!statusFile) {
      throw new Error("임시 DB 상태 파일이 필요합니다.");
    }
    const output = await file(statusFile).text();
    const stack = JSON.parse(output.slice(output.indexOf("{"))) as {
      API_URL: string;
      SECRET_KEY: string;
    };
    const client = createClient<Database>(stack.API_URL, stack.SECRET_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: original, error } = await client
      .from("stories")
      .select("cover_image_path, cover_blurhash")
      .eq("slug", "mia-cafe")
      .single();
    if (error || !original) {
      throw error ?? new Error("seed 필요");
    }
    const paths: string[] = [];
    try {
      const red = await sharp({
        create: { background: "red", channels: 4, height: 8, width: 8 },
      })
        .png()
        .toBuffer();
      const blue = await sharp({
        create: { background: "blue", channels: 4, height: 8, width: 8 },
      })
        .png()
        .toBuffer();
      const first = await publishStoryCover(client, "mia-cafe", red);
      paths.push(first.path);
      const next = await publishStoryCover(client, "mia-cafe", blue);
      paths.push(next.path);
      expect(next.path).not.toBe(first.path);
      expect(next.blurhash).not.toBe(first.blurhash);
      expect(await publishStoryCover(client, "mia-cafe", blue)).toEqual(next);
      const { data: saved, error: readError } = await client
        .from("stories")
        .select("cover_image_path,cover_blurhash")
        .eq("slug", "mia-cafe")
        .single();
      expect(readError).toBeNull();
      expect(saved).toEqual({
        cover_blurhash: next.blurhash,
        cover_image_path: next.path,
      });
      const image = await fetch(
        client.storage.from("story-covers").getPublicUrl(next.path).data
          .publicUrl
      );
      expect(image.status).toBe(200);
      const { data } = await sharp(Buffer.from(await image.arrayBuffer()))
        .raw()
        .toBuffer({ resolveWithObject: true });
      expect([...data.subarray(0, 3)]).toEqual([0, 0, 255]);
      await expect(
        publishStoryCover(client, "no-such-story", blue)
      ).rejects.toBeDefined();
    } finally {
      await client.from("stories").update(original).eq("slug", "mia-cafe");
      await client.storage.from("story-covers").remove(paths);
    }
  }
);
