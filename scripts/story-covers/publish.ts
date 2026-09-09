import type { Database } from "@repo/supabase";
import { createClient } from "@supabase/supabase-js";
import { file } from "bun";
import { prepareStoryCover } from "./prepare";

/** 업로드가 끝난 뒤 한 UPDATE로 경로와 해시를 바꾼다. 이전 파일은 덮어쓰지 않는다. */
export async function publishStoryCover(
  client: ReturnType<typeof createClient<Database>>,
  slug: string,
  input: Uint8Array
) {
  const cover = await prepareStoryCover(slug, input);
  const { data: story, error: readError } = await client
    .from("stories")
    .select("id")
    .eq("slug", slug)
    .single();
  if (readError || !story) {
    throw readError ?? new Error("스토리를 찾지 못했습니다.");
  }
  const bucket = client.storage.from("story-covers");
  const { error: uploadError } = await bucket.upload(cover.path, cover.bytes, {
    cacheControl: "31536000",
    contentType: "image/png",
    upsert: false,
  });
  if (uploadError && uploadError.message !== "The resource already exists") {
    throw uploadError;
  }
  const { error: updateError } = await client
    .from("stories")
    .update({ cover_blurhash: cover.blurhash, cover_image_path: cover.path })
    .eq("id", story.id);
  if (updateError) {
    throw updateError;
  }
  return { blurhash: cover.blurhash, path: cover.path };
}

if (import.meta.main) {
  const [slug, filename] = process.argv.slice(2);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!(slug && filename && url && key)) {
    throw new Error(
      "SUPABASE_URL과 SUPABASE_SECRET_KEY를 설정하고 bun run covers:publish <slug> <이미지 파일>로 실행하세요."
    );
  }
  const client = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const result = await publishStoryCover(
    client,
    slug,
    new Uint8Array(await file(filename).arrayBuffer())
  );
  console.log(`${slug}: ${result.path}`);
}
