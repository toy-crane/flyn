import { router, Stack } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { profileLabels } from "@/features/auth/ui/profile-labels";
import {
  deviceTimeZone,
  useLearningRecordRefresh,
  useSpokenDays,
  useStreakSummary,
} from "@/features/streak/query/learning-record";
import { useDeviceToday } from "@/features/streak/state/use-device-today";
import { dayKey, weekOf } from "@/features/streak/ui/calendar-days";
import { HomeScreen } from "@/screens/home/home-screen";
import { ProfileAvatarButton } from "@/screens/home/profile-avatar-button";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function openSettings() {
  router.push("/settings");
}

function openStreak() {
  router.push("/streak");
}

export default function HomeRoute() {
  const { session } = useAuthSession();
  const userId = session?.user.id;
  const zone = deviceTimeZone();
  const { isFocused, today } = useDeviceToday(useLearningRecordRefresh(userId));
  const { days } = weekOf(today);
  const summary = useStreakSummary(userId, zone, dayKey(today));
  const spokenDays = useSpokenDays(
    userId,
    zone,
    dayKey(days[0] as Date),
    dayKey(days[6] as Date)
  );
  const { refetch: refetchSummary } = summary;
  const { refetch: refetchDays } = spokenDays;
  const refetch = useCallback(
    () => Promise.all([refetchSummary(), refetchDays()]),
    [refetchDays, refetchSummary]
  );
  const { isRetrying, retry } = useVisibleRetry(refetch);

  return (
    <>
      <HomeScreen
        isFocused={isFocused}
        isLoading={(summary.isPending || spokenDays.isPending) && !isRetrying}
        isRetrying={isRetrying}
        onOpenStreak={openStreak}
        onRetry={retry}
        spokenDays={spokenDays.data}
        summary={summary.data}
        today={today}
      />
      <Stack.Toolbar placement="right">
        {Platform.OS === "ios" ? (
          <Stack.Toolbar.View hidesSharedBackground>
            <ProfileAvatarButton onPress={openSettings} />
          </Stack.Toolbar.View>
        ) : (
          // Android draws the toolbar with Compose, and a React Native view
          // hosted in it has no width of its own: it stretches across the
          // whole bar and pushes out the title and every sibling button.
          <Stack.Toolbar.Button
            accessibilityLabel={profileLabels.openSettings}
            icon={toolbarIcon("profile")}
            onPress={openSettings}
          />
        )}
      </Stack.Toolbar>
    </>
  );
}
