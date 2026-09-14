import { useQuery } from "@tanstack/react-query";
import { openURL } from "expo-linking";
import { channel } from "expo-updates";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

import {
  appVersionPolicyQueryOptions,
  RECHECK_INTERVAL_MS,
} from "./app-version-policy-query";
import { getPolicyAudience } from "./version-policy";

/** Reads the installed binary's policy at launch and after meaningful returns. */
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
  const policy = useQuery(appVersionPolicyQueryOptions(audience));
  const [openError, setOpenError] = useState(false);
  const wasInactive = useRef(false);
  const checkAfterInstall = useRef(false);
  const decision = policy.data;
  let status: "allowed" | "blocked" | "checking" = "allowed";
  if (audience && policy.isPending) {
    status = "checking";
  } else if (decision?.status === "blocked") {
    status = "blocked";
  }
  const installUrl =
    decision?.status === "blocked" ? decision.installUrl : null;
  const checkedAt = Math.max(policy.dataUpdatedAt, policy.errorUpdatedAt);

  const check = useCallback(
    (force: boolean) => {
      if (!audience || policy.isFetching) {
        return;
      }
      if (
        !force &&
        checkedAt > 0 &&
        Date.now() - checkedAt < RECHECK_INTERVAL_MS
      ) {
        return;
      }
      setOpenError(false);
      policy.refetch({ cancelRefetch: false });
    },
    [audience, checkedAt, policy.isFetching, policy.refetch]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        wasInactive.current = true;
        return;
      }
      // biome-ignore lint/suspicious/noUnnecessaryConditions: AppState changes this ref on another event
      if (wasInactive.current) {
        wasInactive.current = false;
        const force = checkAfterInstall.current;
        checkAfterInstall.current = false;
        check(force);
      }
    });
    return () => subscription.remove();
  }, [check]);

  const openInstall = useCallback(async () => {
    if (!installUrl) {
      return;
    }
    setOpenError(false);
    checkAfterInstall.current = true;
    try {
      await openURL(installUrl);
    } catch {
      checkAfterInstall.current = false;
      setOpenError(true);
    }
  }, [installUrl]);

  return {
    checkError: status === "blocked" && policy.isError,
    installUrl,
    isRechecking: status === "blocked" && policy.isFetching,
    openError,
    openInstall,
    status,
  };
}
