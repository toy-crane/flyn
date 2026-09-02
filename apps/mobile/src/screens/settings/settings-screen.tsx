import { FieldGroup, Host, RNHostView, Row, Spacer, Text } from "@expo/ui";
import Constants from "expo-constants";

import { useAccountDeletion } from "@/features/account-deletion/state/use-account-deletion";
import { accountDeletionLabels } from "@/features/account-deletion/ui/account-deletion-labels";
import {
  readProfileAvatarUrl,
  useProfile,
} from "@/features/auth/query/profile";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { useSignOut } from "@/features/auth/state/use-sign-out";
import { profileLabels } from "@/features/auth/ui/profile-labels";
import type { ThemePreference } from "@/shared/theme/theme-preference";
import { ActionProgress } from "@/shared/ui/action-progress";
import {
  destructiveActionModifiers,
  useDestructiveActionAnnouncement,
} from "./destructive-action";
import { ExternalDestinationIcon } from "./external-destination-icon";
import { useExternalDestinations } from "./external-destinations";
import { SettingsIcon, type SettingsIconProps } from "./settings-icon";
import { SettingsProfileHero } from "./settings-profile-hero";
import { SettingsRow } from "./settings-row";
import {
  getSettingsSectionModifiers,
  getSettingsSurfaceModifiers,
} from "./settings-surface-modifiers";
import { getThemePreferenceLabel } from "./theme-options";

const appVersion = Constants.expoConfig?.version ?? "Unknown";
/** What iOS uses for a list disclosure chevron, which is smaller than body text. */
const CHEVRON_SIZE = 14;
/** The symbol in front of a row's name, at the row's own text size. */
const ROW_ICON_SIZE = 20;

/**
 * The app's settings.
 *
 * Semantic colours that do not come from the native row arrive as props: the
 * app theme belongs to the root layout, and a screen does not reach up into it.
 */
export function SettingsScreen({
  background,
  danger,
  muted,
  onOpenProfile,
  onOpenThemeMode,
  surface,
  themePreference,
}: {
  background: string;
  danger: string;
  muted: string;
  onOpenProfile: () => void;
  onOpenThemeMode: () => void;
  surface: string;
  themePreference: ThemePreference;
}) {
  const { session } = useAuthSession();
  const { data: profile } = useProfile(session?.user.id);
  const {
    failure: signOutFailure,
    isSigningOut,
    requestSignOut,
  } = useSignOut();
  const deletion = useAccountDeletion();
  const { mailFailure, openPrivacy, openSupportMail, openTerms } =
    useExternalDestinations();
  useDestructiveActionAnnouncement(profileLabels.signOut, isSigningOut);
  useDestructiveActionAnnouncement(
    accountDeletionLabels.deleteAccount,
    deletion.isDeleting
  );

  const sectionModifiers = getSettingsSectionModifiers(surface);
  /*
    The chevron is iOS telling people the row goes somewhere. `@expo/ui` has no
    disclosure indicator of its own — SwiftUI only draws the small grey one for
    a NavigationLink — so the size and colour are set here. Left at its
    intrinsic size it inherits the row's font and reads as a heavy black arrow
    rather than the system's quiet one.

    Android lists do not use a chevron, so `SettingsIcon` draws nothing there
    rather than the app reaching for a second icon set.
  */
  const chevron = (
    <SettingsIcon color={muted} name="chevron.right" size={CHEVRON_SIZE} />
  );
  const externalDestination = (
    <ExternalDestinationIcon color={muted} size={CHEVRON_SIZE} />
  );
  const rowIcon = (name: SettingsIconProps["name"]) => (
    <SettingsIcon color={muted} name={name} size={ROW_ICON_SIZE} />
  );
  const value = (text: string) => (
    <Text textStyle={{ color: muted }}>{text}</Text>
  );
  /*
    A value and the chevron share the trailing slot, so they need a container:
    the slot holds one view, and SwiftUI has no implicit row to lay two out in.
  */
  const navigationValue = (text: string) => (
    <Row alignment="center" spacing={8}>
      {value(text)}
      {chevron}
    </Row>
  );

  return (
    <Host
      /*
        Uniwind's variables stop at the native tree, so the chosen mode has to
        be named here. Without it this screen keeps the operating system's mode
        while the rest of the app changes, and 화면 모드 appears to do nothing.
      */
      colorScheme={themePreference === "system" ? undefined : themePreference}
      style={{ backgroundColor: background, flex: 1 }}
      useViewportSizeMeasurement
    >
      <FieldGroup
        modifiers={getSettingsSurfaceModifiers()}
        style={{ backgroundColor: background }}
        testID="settings-field-group"
      >
        <FieldGroup.Section modifiers={sectionModifiers}>
          <FieldGroup.SectionHeader>
            {/*
              The host sizes itself to the React Native content, because a
              percentage width inside it has no parent width to resolve
              against. So the centring is the native row's: flexible space on
              both sides puts the content-sized block in the middle, where a
              section header would otherwise leave it at the leading edge.
            */}
            <Row alignment="center">
              <Spacer flexible />
              <RNHostView matchContents>
                <SettingsProfileHero
                  avatarUrl={readProfileAvatarUrl(profile)}
                  displayName={profile?.displayName ?? null}
                  onPress={onOpenProfile}
                  username={profile?.username ?? null}
                />
              </RNHostView>
              <Spacer flexible />
            </Row>
          </FieldGroup.SectionHeader>
        </FieldGroup.Section>

        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="account-section"
          title={profileLabels.account}
        >
          {/*
            Which account this is. Three sign-in methods lead to the same app,
            and the nickname above says who a person is to other people rather
            than which login they arrived on. Read-only, so it shows its value
            and nothing else on the right.
          */}
          <SettingsRow
            leading={rowIcon("envelope")}
            testID="account-email-row"
            trailing={value(
              session?.user.email ?? profileLabels.contactEmailUnknown
            )}
          >
            <Text>{profileLabels.contactEmail}</Text>
          </SettingsRow>
          <SettingsRow
            leading={rowIcon("person.crop.circle")}
            onPress={onOpenProfile}
            testID="profile-row"
            trailing={chevron}
          >
            <Text>{profileLabels.profile}</Text>
          </SettingsRow>
          {/*
            An ordinary account action in ordinary ink. The red on this screen
            belongs to the one row that cannot be undone, and a second red row
            would take weight from it.

            The name stays 로그아웃 the whole time; the indicator appears in the
            trailing slot and `accessibilityValue` is what says it is running.
            `useSignOut` already drops a second press.
          */}
          <SettingsRow
            leading={rowIcon("rectangle.portrait.and.arrow.right")}
            modifiers={destructiveActionModifiers(isSigningOut)}
            onPress={requestSignOut}
            testID="sign-out-button"
            trailing={
              isSigningOut ? (
                <ActionProgress testID="sign-out-progress" />
              ) : undefined
            }
          >
            <Text>{profileLabels.signOut}</Text>
          </SettingsRow>
          {signOutFailure ? (
            <FieldGroup.SectionFooter>
              <Text testID="sign-out-error" textStyle={{ color: danger }}>
                {signOutFailure}
              </Text>
            </FieldGroup.SectionFooter>
          ) : null}
        </FieldGroup.Section>

        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="preferences-section"
          title={profileLabels.preferences}
        >
          {/*
            The value and the chevron together: this row says what the mode is
            now and that pressing it opens the place to change it. Android takes
            the value alone, where a chevron is not how a settings list says it
            goes somewhere.
          */}
          <SettingsRow
            leading={rowIcon("sun.max")}
            onPress={onOpenThemeMode}
            testID="theme-mode-row"
            trailing={navigationValue(getThemePreferenceLabel(themePreference))}
          >
            <Text>{profileLabels.themeMode}</Text>
          </SettingsRow>
        </FieldGroup.Section>

        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="support-section"
          title={profileLabels.support}
        >
          <SettingsRow
            leading={rowIcon("bubble.left.and.bubble.right")}
            onPress={openSupportMail}
            testID="support-row"
            trailing={externalDestination}
          >
            <Text>{profileLabels.contactSupport}</Text>
          </SettingsRow>
          {mailFailure ? (
            <FieldGroup.SectionFooter>
              <Text testID="support-mail-error" textStyle={{ color: danger }}>
                {mailFailure}
              </Text>
            </FieldGroup.SectionFooter>
          ) : null}
        </FieldGroup.Section>

        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="app-info-section"
          title={profileLabels.appInfo}
        >
          {/*
            Both pages live on the web and open in the browser, so they carry
            the leaving-the-app glyph rather than a chevron. The stores ask for
            the privacy policy to be reachable inside the app as well as on the
            listing, which is what this row is.
          */}
          <SettingsRow
            leading={rowIcon("doc.text")}
            onPress={openTerms}
            testID="terms-row"
            trailing={externalDestination}
          >
            <Text>{profileLabels.terms}</Text>
          </SettingsRow>
          <SettingsRow
            leading={rowIcon("hand.raised")}
            onPress={openPrivacy}
            testID="privacy-row"
            trailing={externalDestination}
          >
            <Text>{profileLabels.privacyPolicy}</Text>
          </SettingsRow>
          <SettingsRow
            leading={rowIcon("info.circle")}
            testID="version-row"
            trailing={value(appVersion)}
          >
            <Text>{profileLabels.version}</Text>
          </SettingsRow>
        </FieldGroup.Section>

        {/*
          Last, alone and unnamed. A title would have to say what this one row
          is a group of, and the platform already reads a lone trailing group as
          the thing that ends the screen. Position, spacing and the red word are
          what warn before the press; the confirmation carries the rest.

          No symbol in front: the red is meant to slow a person down, and an
          icon reaches the eye before the word does.

          The name stays 계정 삭제 the whole time. Nothing is disabled, because
          SwiftUI dims a disabled row and that would drain the red out of the
          one word marking this as destructive; `useAccountDeletion` drops a
          second press before the dialog.
        */}
        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="account-deletion-section"
        >
          <SettingsRow
            modifiers={destructiveActionModifiers(deletion.isDeleting)}
            onPress={deletion.confirmDeletion}
            testID="delete-account-row"
            trailing={
              deletion.isDeleting ? (
                <ActionProgress testID="delete-account-progress" />
              ) : undefined
            }
          >
            <Text textStyle={{ color: danger }}>
              {accountDeletionLabels.deleteAccount}
            </Text>
          </SettingsRow>
          {deletion.failure ? (
            <FieldGroup.SectionFooter>
              <Text
                testID="account-deletion-error"
                textStyle={{ color: danger }}
              >
                {deletion.failure}
              </Text>
            </FieldGroup.SectionFooter>
          ) : null}
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
