import "react-native-url-polyfill/auto";

import type { Database } from "@flyn/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 미설정이어도 import 시점에 throw하지 않는다 — 앱 전체(예: HealthStatus 카드)가 죽지
// 않도록. 세션 부트스트랩(use-session)이 supabaseConfigured로 명확한 실패 상태를 표시한다.
export const supabaseConfigured = Boolean(url && publishableKey);

// 익명 세션을 AsyncStorage에 저장한다. 신형 publishable 키만 쓴다(legacy anon 금지).
// 생성 타입(Database)을 붙여 from(...) 쿼리가 컴파일 타임에 검증된다.
export const supabase = createClient<Database>(
  url ?? "http://127.0.0.1:54321",
  publishableKey ?? "publishable-key-missing",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: AsyncStorage,
    },
  }
);

// RN에서는 auto-refresh를 앱 포그라운드에 묶어야 한다(Supabase RN 가이드). 없으면
// 백그라운드 후 토큰이 만료돼 RLS·RPC 호출이 401을 낸다.
if (supabaseConfigured) {
  AppState.addEventListener("change", async (next) => {
    if (next === "active") {
      await supabase.auth.startAutoRefresh();
    } else {
      await supabase.auth.stopAutoRefresh();
    }
  });
}
