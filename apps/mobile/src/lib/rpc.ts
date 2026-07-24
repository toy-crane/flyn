import type { AppType } from "@flyn/api";
import { hc } from "hono/client";
import { API_BASE_URL } from "./api";
import { supabase } from "./supabase";

// 타입 안전 RPC 클라이언트: apps/api의 AppType으로 라우트·응답이 컴파일 타임에 검증된다.
// 요청마다 현재 세션의 access token을 Bearer로 실어 Hono 인증 게이트를 통과한다.
export const rpc = hc<AppType>(API_BASE_URL, {
  headers: async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
});
