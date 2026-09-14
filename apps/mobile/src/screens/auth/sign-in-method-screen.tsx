import Constants from "expo-constants";
import { openURL } from "expo-linking";
import { useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useProviderSignIn } from "@/features/auth/state/use-provider-sign-in";
import {
  AuthDivider,
  AuthError,
  AuthLayout,
} from "@/features/auth/ui/auth-layout";
import { profileLabels } from "@/features/auth/ui/profile-labels";
import { SignInButton } from "@/features/auth/ui/sign-in-button";
import { signInLabels } from "@/features/auth/ui/sign-in-labels";
import { getLegalDestinations } from "@/shared/navigation/legal-destinations";

/**
 * The first screen of the auth stack: which way in.
 *
 * It holds no input and no explaining. Email gets its own screen so this one
 * stays a choice, the buttons sit where the thumb is, and the app name is the
 * only thing above them.
 */
export function SignInMethodScreen({
  onChooseEmail,
}: {
  onChooseEmail: () => void;
}) {
  const provider = useProviderSignIn();
  const { fontScale } = useWindowDimensions();
  const isLargeText = fontScale >= 2;
  const appName = Constants.expoConfig?.name ?? "앱";
  const legalPages = useMemo(getLegalDestinations, []);
  const openTerms = useCallback(() => {
    openURL(legalPages.terms).catch(() => undefined);
  }, [legalPages.terms]);
  const openPrivacy = useCallback(() => {
    openURL(legalPages.privacy).catch(() => undefined);
  }, [legalPages.privacy]);

  return (
    <AuthLayout
      footer={
        <>
          <SignInButton
            isBusy={provider.pending === "google"}
            isDisabled={provider.isBusy}
            label={signInLabels.google}
            method="google"
            onPress={provider.startGoogle}
            testID="sign-in-google"
          />

          {Platform.OS === "ios" ? (
            <SignInButton
              isBusy={provider.pending === "apple"}
              isDisabled={provider.isBusy}
              label={signInLabels.apple}
              method="apple"
              onPress={provider.startApple}
              testID="sign-in-apple"
            />
          ) : null}

          <AuthDivider />

          <SignInButton
            isDisabled={provider.isBusy}
            label={signInLabels.emailMethod}
            method="email"
            onPress={onChooseEmail}
            testID="sign-in-email-method"
          />

          {provider.failure ? (
            <AuthError testID="sign-in-error-provider">
              {provider.failure.message}
            </AuthError>
          ) : null}

          <View
            className={
              isLargeText
                ? "items-center justify-center pt-1"
                : "flex-row flex-wrap items-center justify-center pt-1"
            }
          >
            <Pressable
              accessibilityLabel={profileLabels.terms}
              accessibilityRole="link"
              className="min-h-11 max-w-full justify-center px-2"
              onPress={openTerms}
            >
              <Text
                className={
                  isLargeText
                    ? "text-center text-muted text-xs underline"
                    : "text-center text-muted text-sm underline"
                }
              >
                {profileLabels.terms}
              </Text>
            </Pressable>
            {isLargeText ? null : (
              <Text accessible={false} className="text-muted text-sm">
                ·
              </Text>
            )}
            <Pressable
              accessibilityLabel={profileLabels.privacyPolicy}
              accessibilityRole="link"
              className="min-h-11 max-w-full justify-center px-2"
              onPress={openPrivacy}
            >
              <Text
                className={
                  isLargeText
                    ? "text-center text-muted text-xs underline"
                    : "text-center text-muted text-sm underline"
                }
              >
                {profileLabels.privacyPolicy}
              </Text>
            </Pressable>
          </View>
        </>
      }
      isRoot
      title={appName}
    />
  );
}
