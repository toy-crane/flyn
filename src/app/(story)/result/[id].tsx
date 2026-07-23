import { useLocalSearchParams } from "expo-router";

import { SessionResultScreen } from "@/screens/session-result";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionResultScreen sessionId={id} />;
}
