import {
  accessibilityElement,
  accessibilityHint,
  accessibilityLabel,
  accessibilityValue,
} from "@expo/ui/swift-ui/modifiers";
import { nativeApplicationVersion } from "expo-application";
import { setStringAsync } from "expo-clipboard";
import { isEmbeddedLaunch, isEnabled, updateId } from "expo-updates";
import { Typography } from "heroui-native/text";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { profileLabels } from "@/features/auth/ui/profile-labels";
import type { ThemePreference } from "@/shared/theme/theme-preference";

const COPY_FEEDBACK_MS = 2500;
const UPDATE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The installed binary and the update actually running on this device. */
export function useSettingsReleaseInfo() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const isDevelopment = (globalThis as { __DEV__?: boolean }).__DEV__ === true;
  const appVersion = nativeApplicationVersion?.trim() || null;
  const runningUpdateId =
    !isDevelopment &&
    isEnabled &&
    !isEmbeddedLaunch &&
    updateId !== null &&
    UPDATE_ID_PATTERN.test(updateId)
      ? updateId
      : null;
  let updateValue: string = profileLabels.updateUnknown;
  if (isDevelopment) {
    updateValue = profileLabels.developmentVersion;
  } else if (isEnabled && isEmbeddedLaunch) {
    updateValue = profileLabels.embeddedVersion;
  } else if (runningUpdateId) {
    updateValue = runningUpdateId.slice(0, 8);
  }
  const display = appVersion
    ? `${appVersion} · ${updateValue}`
    : profileLabels.versionUnknown;
  const copyableUpdateId = appVersion ? runningUpdateId : null;
  const accessibilityValueText = appVersion
    ? `${appVersion}, ${runningUpdateId ? `실행 중인 업데이트 ${updateValue}` : updateValue}`
    : profileLabels.versionUnknown;

  const showFeedback = (message: string) => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
    }
    setFeedback(message);
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(message);
    }
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setFeedback(null);
    }, COPY_FEEDBACK_MS);
  };
  const copy = () => {
    if (copyableUpdateId === null) {
      return;
    }
    setStringAsync(copyableUpdateId)
      .then((copied) => {
        showFeedback(
          copied ? profileLabels.updateCopied : profileLabels.updateCopyFailed
        );
      })
      .catch(() => showFeedback(profileLabels.updateCopyFailed));
  };

  return {
    accessibilityModifiers:
      Platform.OS === "ios"
        ? [
            accessibilityElement("combine"),
            accessibilityLabel(profileLabels.version),
            accessibilityValue(accessibilityValueText),
            ...(copyableUpdateId
              ? [accessibilityHint("누르면 업데이트 정보를 복사합니다")]
              : []),
          ]
        : undefined,
    copy: copyableUpdateId ? copy : undefined,
    display,
    feedback,
  };
}

/** A brief, non-interactive confirmation over the bottom of Settings. */
export function SettingsCopyFeedback({
  message,
  themePreference,
}: {
  message: string | null;
  themePreference: ThemePreference;
}) {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" && systemColorScheme === "dark");

  if (message === null) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={{
        alignItems: "center",
        bottom: Math.max(insets.bottom, 20),
        left: 16,
        position: "absolute",
        right: 16,
      }}
      testID="version-copy-feedback"
    >
      <View
        style={{
          backgroundColor: isDark ? "#eeeef2" : "#2d2e33",
          borderRadius: 10,
          paddingHorizontal: 15,
          paddingVertical: 11,
        }}
      >
        <Typography.Paragraph
          style={{ color: isDark ? "#141418" : "#ffffff" }}
          type="body-sm"
        >
          {message}
        </Typography.Paragraph>
      </View>
    </View>
  );
}
