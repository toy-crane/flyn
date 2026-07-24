import "react-native-url-polyfill/auto";

import type { Database } from "@flyn/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!(url && publishableKey)) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 필요하다. apps/mobile/.env.local 참고."
  );
}

// 익명 세션을 AsyncStorage에 저장한다. 신형 publishable 키만 쓴다(legacy anon 금지).
// 생성 타입(Database)을 붙여 from(...) 쿼리가 컴파일 타임에 검증된다.
export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: AsyncStorage,
  },
});
