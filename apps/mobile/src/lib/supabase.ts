import "react-native-url-polyfill/auto";

import type { Database } from "@flyn/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// import 시 throw하지 않는다 — 미설정이어도 앱 전체가 죽지 않고 세션 훅이 실패를 표시한다.
export const supabaseConfigured = Boolean(url && publishableKey);

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

// RN은 auto-refresh를 포그라운드에 묶어야 한다 — 없으면 백그라운드 후 토큰 만료로 401.
if (supabaseConfigured) {
  AppState.addEventListener("change", async (next) => {
    if (next === "active") {
      await supabase.auth.startAutoRefresh();
    } else {
      await supabase.auth.stopAutoRefresh();
    }
  });
}
