import type { AppType } from "@flyn/api";
import { hc } from "hono/client";
import { API_BASE_URL } from "./api";
import { supabase } from "./supabase";

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
