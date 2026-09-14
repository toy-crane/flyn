import Constants from "expo-constants";
import { openURL } from "expo-linking";
import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import { useCallback, useMemo } from "react";
import { Platform, useWindowDimensions, View } from "react-native";

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

// This footer has room for both labels at 250% while keeping the long title whole.
const LEGAL_LABEL_MAX_FONT_SIZE_MULTIPLIER = 2.5;

/**
 * The first screen of the auth stack: which way in.
 *
 * It holds no input and no explaining. Email gets its own screen so this one
 * stays a choice, the buttons sit where the thumb is, and the app name is the
 * only thing above them.
 */
export function SignInMethodScreen({
  onChooseEmail,
  scheme,
}: {
  onChooseEmail: () => void;
  /** The mode the app is drawing, which the provider buttons follow. */
  scheme: "dark" | "light";
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
            scheme={scheme}
            testID="sign-in-google"
          />

          {Platform.OS === "ios" ? (
            <SignInButton
              isBusy={provider.pending === "apple"}
              isDisabled={provider.isBusy}
              label={signInLabels.apple}
              method="apple"
              onPress={provider.startApple}
              scheme={scheme}
              testID="sign-in-apple"
            />
          ) : null}

          <AuthDivider />

          <SignInButton
            isDisabled={provider.isBusy}
            label={signInLabels.emailMethod}
            method="email"
            onPress={onChooseEmail}
            scheme={scheme}
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
                : "flex-row flex-wrap items-center justify-center gap-x-2 pt-1"
            }
          >
            <LinkButton
              accessibilityLabel={profileLabels.terms}
              accessibilityRole="link"
              className="min-h-11 max-w-full justify-center px-2"
              onPress={openTerms}
              size="sm"
            >
              <LinkButton.Label
                className="text-center text-muted underline"
                maxFontSizeMultiplier={LEGAL_LABEL_MAX_FONT_SIZE_MULTIPLIER}
              >
                {profileLabels.terms}
              </LinkButton.Label>
            </LinkButton>
            {isLargeText ? null : (
              <Typography.Paragraph
                accessible={false}
                className="text-muted"
                type="body-sm"
              >
                ·
              </Typography.Paragraph>
            )}
            <LinkButton
              accessibilityLabel={profileLabels.privacyPolicy}
              accessibilityRole="link"
              className="min-h-11 max-w-full justify-center px-2"
              onPress={openPrivacy}
              size="sm"
            >
              <LinkButton.Label
                className="text-center text-muted underline"
                maxFontSizeMultiplier={LEGAL_LABEL_MAX_FONT_SIZE_MULTIPLIER}
              >
                {profileLabels.privacyPolicy}
              </LinkButton.Label>
            </LinkButton>
          </View>
        </>
      }
      isRoot
      title={appName}
    />
  );
}
