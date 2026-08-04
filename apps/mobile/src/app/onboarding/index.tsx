import { Redirect } from "expo-router";
import { LaunchChecking } from "../../components/launch";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

export default function OnboardingIndexScreen() {
  const userId = useUserId();
  const profile = useProfile(userId);

  if (!profile.data) {
    return <LaunchChecking />;
  }

  return (
    <Redirect
      href={
        profile.data.display_name === null
          ? "/onboarding/nickname"
          : "/onboarding/username"
      }
    />
  );
}
