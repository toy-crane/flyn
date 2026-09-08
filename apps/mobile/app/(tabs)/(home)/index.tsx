import { router, Stack } from "expo-router";
import { Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { profileLabels } from "@/features/auth/ui/profile-labels";
import { useHome } from "@/features/story/query/story";
import { HomeScreen } from "@/screens/home/home-screen";
import { ProfileAvatarButton } from "@/screens/home/profile-avatar-button";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function openEpisode(episodeId: string) {
  router.push({ params: { episodeId }, pathname: "/episode" });
}

function openStories() {
  router.push("/stories");
}

function openSettings() {
  router.push("/settings");
}

export default function HomeRoute() {
  const { session } = useAuthSession();
  const home = useHome(session?.user.id, session?.access_token);
  const { isRetrying, retry: retryHome } = useVisibleRetry(home.refetch);

  return (
    <>
      <HomeScreen
        home={home.data}
        isLoading={home.isPending && !isRetrying}
        isRetrying={isRetrying}
        onOpenEpisode={openEpisode}
        onOpenStories={openStories}
        onRetry={retryHome}
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
