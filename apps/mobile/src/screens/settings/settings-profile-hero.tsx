import { Typography } from "heroui-native/text";
import { Pressable, useWindowDimensions, View } from "react-native";

import { profileLabels } from "@/features/auth/ui/profile-labels";
import { UserAvatar } from "@/shared/ui/user-avatar";

export interface SettingsProfileHeroProps {
  avatarUrl: string | null;
  displayName: string | null;
  onPress: () => void;
  username: string | null;
}

/**
 * The profile at the top of Settings: the picture, the nickname, the account id.
 *
 * The picture is the control and the two lines below it are not. Pressing it
 * opens 프로필 rather than a photo menu, so the picture and the 프로필 row lead
 * to the same place and a change to any part of the public profile is saved or
 * abandoned as one.
 *
 * No `@` in front of the id: `@` means a mention or an address, and this app has
 * neither, so it would promise something that does not exist.
 *
 * Spacing comes from the project's scale rather than from the sheet's native
 * metrics. This layout is the app's own; the sections below it belong to the
 * platform and keep theirs.
 */
export function SettingsProfileHero({
  avatarUrl,
  displayName,
  onPress,
  username,
}: SettingsProfileHeroProps) {
  const { width } = useWindowDimensions();
  // SectionHeader의 RNHostView는 자식의 너비만큼 커진다. 양옆 자리를 남겨
  // 긴 닉네임과 아이디도 화면 안에서 줄바꿈한다.
  return (
    <View
      className="items-center gap-3 pt-2 pb-5"
      style={{ width: width - 64 }}
    >
      <Pressable
        accessibilityLabel={profileLabels.profile}
        accessibilityRole="button"
        onPress={onPress}
        testID="settings-profile-photo"
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="xl"
          transparentPhotoBackground
        />
      </Pressable>

      <View className="items-center gap-1">
        {/*
          The nickname is what a person recognises, so it carries the weight and
          the id sits under it as the quieter of the two. Both wrap and centre
          rather than truncate: a 20 character id and a 30 character nickname are
          both allowed, and cutting one off hides part of what the screen exists
          to show.
        */}
        <Typography.Heading
          align="center"
          testID="settings-profile-name"
          type="h3"
        >
          {displayName}
        </Typography.Heading>
        <Typography.Paragraph
          align="center"
          color="muted"
          testID="settings-profile-username"
        >
          {username}
        </Typography.Paragraph>
      </View>
    </View>
  );
}
