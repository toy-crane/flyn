import { useAppVersionGate } from "@/features/app-version/use-app-version-gate";
import { UpdateRequiredScreen } from "@/screens/session/update-required-screen";

export default function UpdateRequiredRoute() {
  const gate = useAppVersionGate();
  return (
    <UpdateRequiredScreen
      checkError={gate.checkError}
      isRechecking={gate.isRechecking}
      onOpenInstall={gate.openInstall}
      openError={gate.openError}
    />
  );
}
