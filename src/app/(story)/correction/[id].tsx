import { useLocalSearchParams } from "expo-router";

import { CorrectionThreadScreen } from "@/screens/correction-thread";

export default function Correction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CorrectionThreadScreen correctionId={id} />;
}
