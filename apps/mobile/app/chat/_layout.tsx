import { Stack } from "expo-router";

import { getAskSheetOptions } from "@/core/navigation/ask-sheet";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { SideChatsProvider } from "@/features/chat/state/side-chats";
import { chatLabels } from "@/features/chat/ui/chat-labels";

/**
 * A conversation and the side chats opened from it.
 *
 * The stack is here rather than at the root so that a side chat's sheet is a
 * screen inside this conversation. That is also what fixes how long a side
 * chat lives: leaving the conversation, or signing out, takes this layout down
 * and every side chat it was holding with it.
 */
export default function ChatLayout() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();

  return (
    <SideChatsProvider accessToken={session?.access_token}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="side"
          options={getAskSheetOptions(background, chatLabels.sideChat)}
        />
      </Stack>
    </SideChatsProvider>
  );
}
