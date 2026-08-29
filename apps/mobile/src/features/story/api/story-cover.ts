import type { Database } from "@repo/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/** 스토리 표지 그림이 사는 공개 버킷. */
export const STORY_COVER_BUCKET = "story-covers";

/**
 * 표지 그림이 실제로 서비스되는 주소.
 *
 * 서버는 URL이 아니라 버킷 안의 경로를 준다. 같은 행을 시뮬레이터, 기기,
 * 배포본이 함께 읽는데 저장소에 닿는 주소가 저마다 달라서, 주소를 만드는 일은
 * 그 환경의 Supabase 클라이언트를 쥔 앱이 한다. `avatar_path`와 같은 이유다.
 */
export function readStoryCoverUrl(
  client: SupabaseClient<Database>,
  path: string
): string {
  return client.storage.from(STORY_COVER_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
