import { getMobileEnv } from "@env";
import { useCallback, useState } from "react";
import { Linking } from "react-native";

import { profileLabels } from "@/features/auth/ui/profile-labels";

/**
 * The addresses settings opens outside the app.
 *
 * `apps/web` owns the two legal pages and their paths are a public contract, so
 * the app builds them from one base address rather than storing three.
 */
export function getExternalDestinations() {
  const env = getMobileEnv();

  return {
    privacy: new URL("/privacy", env.EXPO_PUBLIC_WEB_URL).toString(),
    supportMail: `mailto:${env.EXPO_PUBLIC_SUPPORT_EMAIL}`,
    terms: new URL("/terms", env.EXPO_PUBLIC_WEB_URL).toString(),
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
  const destinations = getExternalDestinations();

  const openPrivacy = useCallback(() => {
    Linking.openURL(destinations.privacy).catch(() => undefined);
  }, [destinations.privacy]);

  const openTerms = useCallback(() => {
    Linking.openURL(destinations.terms).catch(() => undefined);
  }, [destinations.terms]);

  const openSupportMail = useCallback(() => {
    setMailFailure(undefined);
    Linking.openURL(destinations.supportMail).catch(() => {
      setMailFailure(profileLabels.mailAppUnavailable);
    });
  }, [destinations.supportMail]);

  return { mailFailure, openPrivacy, openSupportMail, openTerms };
}
