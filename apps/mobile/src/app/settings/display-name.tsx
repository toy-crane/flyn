import { useRouter } from "expo-router";
import { useCallback } from "react";
import { NicknameEditForm } from "../../components/profile/nickname-edit-form";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

export default function DisplayNameScreen() {
  const router = useRouter();
  const userId = useUserId();
  const profile = useProfile(userId);
  const dismiss = useCallback(() => router.back(), [router]);

  return (
    <NicknameEditForm
      initialValue={profile.data?.display_name ?? ""}
      onDismiss={dismiss}
      userId={userId}
    />
  );
}
