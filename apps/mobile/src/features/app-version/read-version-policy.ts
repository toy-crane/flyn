import { getSupabaseClient } from "@/shared/supabase/client";

import type { PolicyAudience } from "./version-policy";

export interface VersionPolicy {
  install_url: string | null;
  minimum_version: string | null;
}

/** The public Data API policy is readable before and after sign-in. */
export async function readVersionPolicy(
  audience: PolicyAudience,
  signal: AbortSignal
): Promise<VersionPolicy> {
  const { data, error } = await getSupabaseClient()
    .from("app_version_policies")
    .select("minimum_version,install_url")
    .eq("platform", audience.platform)
    .eq("distribution", audience.distribution)
    .abortSignal(signal)
    .single();

  if (error || !data) {
    throw error ?? new Error("Version policy is missing");
  }
  return data;
}
