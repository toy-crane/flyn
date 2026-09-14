import { getMobileEnv } from "@env";
import { openURL } from "expo-linking";
import { useCallback, useMemo, useState } from "react";

import { profileLabels } from "@/features/auth/ui/profile-labels";
import { getLegalDestinations } from "@/shared/navigation/legal-destinations";

/**
 * The addresses settings opens outside the app.
 *
 * `apps/web` owns the two legal pages and their paths are a public contract, so
 * the app builds them from one base address rather than storing three.
 */
export function getExternalDestinations() {
  const env = getMobileEnv();

  return {
    ...getLegalDestinations(),
    supportMail: `mailto:${env.EXPO_PUBLIC_SUPPORT_EMAIL}`,
  };
}

/**
 * Handing an address to the system, as the settings screen needs it.
 *
 * Only the mail row can report a failure, and only it needs to: every phone
 * has a browser, while a device with no mail app rejects `mailto:` and would
 * otherwise look like a row that does nothing when pressed.
 */
export function useExternalDestinations() {
  const [mailFailure, setMailFailure] = useState<string | undefined>();
  // Read once for the life of the screen: the addresses come from the build's
  // environment, and reading them again validates every public variable.
  const destinations = useMemo(getExternalDestinations, []);

  const openPrivacy = useCallback(() => {
    openURL(destinations.privacy).catch(() => undefined);
  }, [destinations.privacy]);

  const openTerms = useCallback(() => {
    openURL(destinations.terms).catch(() => undefined);
  }, [destinations.terms]);

  const openSupportMail = useCallback(() => {
    setMailFailure(undefined);
    openURL(destinations.supportMail).catch(() => {
      setMailFailure(profileLabels.mailAppUnavailable);
    });
  }, [destinations.supportMail]);

  return { mailFailure, openPrivacy, openSupportMail, openTerms };
}
