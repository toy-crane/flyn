import { useLocalSearchParams } from "expo-router";

import { StorySessionScreen } from "@/screens/story-session";

export default function Session() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StorySessionScreen sessionId={id} />;
}
