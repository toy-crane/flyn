import { router } from "expo-router";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { SignInMethodScreen } from "@/screens/auth/sign-in-method-screen";

function goToEmail() {
  router.push("/(auth)/email");
}

export default function SignInRoute() {
  const { scheme } = useAppTheme();

  return <SignInMethodScreen onChooseEmail={goToEmail} scheme={scheme} />;
}
