import { useRouter } from "expo-router";
import { useCallback } from "react";
import { UsernameEditForm } from "../../components/profile/username-edit-form";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

export default function UsernameScreen() {
  const router = useRouter();
  const userId = useUserId();
  const profile = useProfile(userId);
  const dismiss = useCallback(() => router.back(), [router]);

  return (
    <UsernameEditForm
      initialValue={profile.data?.username ?? ""}
      onDismiss={dismiss}
      userId={userId}
    />
  );
}
