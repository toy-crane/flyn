import { router, Stack } from "expo-router";
import { Platform } from "react-native";

import { profileLabels } from "@/features/auth/ui/profile-labels";
import { HomeScreen } from "@/screens/home/home-screen";
import { ProfileAvatarButton } from "@/screens/home/profile-avatar-button";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function openSettings() {
  router.push("/settings");
}

export default function HomeRoute() {
  return (
    <>
      <HomeScreen />
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
