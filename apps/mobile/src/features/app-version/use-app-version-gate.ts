import { nativeApplicationVersion } from "expo-application";
import { openURL } from "expo-linking";
import { channel } from "expo-updates";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

import { readVersionPolicy, type VersionPolicy } from "./read-version-policy";
import { compareInstalledVersion, getPolicyAudience } from "./version-policy";

const RECHECK_INTERVAL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

interface GateState {
  checkError: boolean;
  installUrl: string | null;
  isRechecking: boolean;
  openError: boolean;
  status: "allowed" | "blocked" | "checking";
}

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

function policyDecision(
  policy: VersionPolicy
):
  | { status: "allowed" }
  | { status: "blocked"; installUrl: string }
  | { status: "invalid" } {
  if (policy.minimum_version === null) {
    return { status: "allowed" };
  }
  const installed = nativeApplicationVersion;
  if (!(installed && isUsableInstallUrl(policy.install_url))) {
    return { status: "invalid" };
  }
  const comparison = compareInstalledVersion(installed, policy.minimum_version);
  if (comparison === null) {
    return { status: "invalid" };
  }
  return comparison < 0
    ? { installUrl: policy.install_url, status: "blocked" }
    : { status: "allowed" };
}

/** Reads once at launch and on meaningful foreground returns. */
export function useAppVersionGate() {
  const audience = useMemo(
    () =>
      getPolicyAudience(
        Platform.OS,
        channel,
        process.env.NODE_ENV !== "production"
      ),
    []
  );
  const [state, setState] = useState<GateState>({
    checkError: false,
    installUrl: null,
    isRechecking: false,
    openError: false,
    status: audience ? "checking" : "allowed",
  });
  const mounted = useRef(false);
  const lastCheckAt = useRef<number | null>(null);
  const pending = useRef<Promise<void> | null>(null);
  const wasInactive = useRef(false);
  const checkAfterInstall = useRef(false);

  const check = useCallback(
    (force: boolean): Promise<void> => {
      if (!audience) {
        return Promise.resolve();
      }
      // biome-ignore lint/suspicious/noUnnecessaryConditions: another event can start this ref before the current event reaches it
      if (pending.current) {
        return pending.current;
      }
      const now = Date.now();
      if (
        !force &&
        lastCheckAt.current !== null &&
        now - lastCheckAt.current < RECHECK_INTERVAL_MS
      ) {
        return Promise.resolve();
      }
      lastCheckAt.current = now;
      setState((previous) => ({
        ...previous,
        checkError: false,
        isRechecking: previous.status === "blocked",
      }));

      const controller = new AbortController();
      let timeout: ReturnType<typeof setTimeout>;
      const timedOut = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Version policy request timed out"));
        }, REQUEST_TIMEOUT_MS);
      });
      const request = Promise.race([
        readVersionPolicy(audience, controller.signal),
        timedOut,
      ])
        .then((policy) => {
          // biome-ignore lint/suspicious/noUnnecessaryConditions: the component can unmount before this request resolves
          if (!mounted.current) {
            return;
          }
          const decision = policyDecision(policy);
          if (decision.status === "invalid") {
            throw new Error("Version policy response is invalid");
          }
          setState({
            checkError: false,
            installUrl:
              decision.status === "blocked" ? decision.installUrl : null,
            isRechecking: false,
            openError: false,
            status: decision.status,
          });
        })
        .catch(() => {
          // biome-ignore lint/suspicious/noUnnecessaryConditions: the component can unmount before this request rejects
          if (!mounted.current) {
            return;
          }
          setState((previous) => ({
            ...previous,
            checkError: previous.status === "blocked",
            isRechecking: false,
            status: previous.status === "blocked" ? "blocked" : "allowed",
          }));
        })
        .finally(() => {
          clearTimeout(timeout);
          pending.current = null;
        });
      pending.current = request;
      return request;
    },
    [audience]
  );

  useEffect(() => {
    mounted.current = true;
    check(true);
    const subscription = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        wasInactive.current = true;
        return;
      }
      // biome-ignore lint/suspicious/noUnnecessaryConditions: AppState changes the ref on another event
      if (wasInactive.current) {
        wasInactive.current = false;
        const force = checkAfterInstall.current;
        checkAfterInstall.current = false;
        check(force);
      }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [check]);

  const openInstall = useCallback(async () => {
    if (!state.installUrl) {
      return;
    }
    setState((previous) => ({ ...previous, openError: false }));
    checkAfterInstall.current = true;
    try {
      await openURL(state.installUrl);
    } catch {
      checkAfterInstall.current = false;
      if (mounted.current) {
        setState((previous) => ({ ...previous, openError: true }));
      }
    }
  }, [state.installUrl]);

  return { ...state, openInstall };
}
