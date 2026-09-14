import { queryOptions } from "@tanstack/react-query";
import { nativeApplicationVersion } from "expo-application";

import { readVersionPolicy, type VersionPolicy } from "./read-version-policy";
import { compareInstalledVersion, type PolicyAudience } from "./version-policy";

export const RECHECK_INTERVAL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

export type PolicyDecision =
  | { status: "allowed" }
  | { status: "blocked"; installUrl: string };

function isUsableInstallUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function decide(policy: VersionPolicy): PolicyDecision {
  if (policy.minimum_version === null) {
    return { status: "allowed" };
  }
  if (!(nativeApplicationVersion && isUsableInstallUrl(policy.install_url))) {
    throw new Error("Version policy response is invalid");
  }
  const comparison = compareInstalledVersion(
    nativeApplicationVersion,
    policy.minimum_version
  );
  if (comparison === null) {
    throw new Error("Version policy response is invalid");
  }
  return comparison < 0
    ? { installUrl: policy.install_url, status: "blocked" }
    : { status: "allowed" };
}

async function readDecision(audience: PolicyAudience, signal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) {
    controller.abort();
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error("Version policy request timed out"));
    }, REQUEST_TIMEOUT_MS);
  });
  try {
    const policy = await Promise.race([
      readVersionPolicy(audience, controller.signal),
      timedOut,
    ]);
    return decide(policy);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}

/** Cache and request lifecycle for one installed binary and release audience. */
export function appVersionPolicyQueryOptions(audience: PolicyAudience | null) {
  return queryOptions({
    enabled: audience !== null,
    networkMode: "always",
    queryFn: ({ signal }) => {
      if (!audience) {
        throw new Error("Unsupported app version policy audience");
      }
      return readDecision(audience, signal);
    },
    queryKey: [
      "app-version-policy",
      audience?.platform,
      audience?.distribution,
      nativeApplicationVersion,
    ] as const,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: RECHECK_INTERVAL_MS,
  });
}
