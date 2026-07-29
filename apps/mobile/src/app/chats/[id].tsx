import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  type ChatController,
  ChatConversation,
} from "../../components/chat/chat-conversation";
import {
  type StoredChatMessage,
  useChatMessages,
  useChatRoom,
} from "../../lib/use-chat-rooms";
import { usePersistentChat } from "../../lib/use-persistent-chat";
import { useUserId } from "../../lib/user-id";

function ConversationSession({
  messages,
  roomId,
  userId,
}: {
  messages: StoredChatMessage[];
  roomId: string;
  userId: string;
}) {
  const chat: ChatController = usePersistentChat(roomId, userId, messages);

  return <ChatConversation chat={chat} />;
}

function CenteredAction({
  actionLabel,
  message,
  onPress,
}: {
  actionLabel: string;
  message: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      <Text className="text-center text-[17px] text-foreground">{message}</Text>
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        className="min-h-11 justify-center rounded-full bg-primary px-5"
        onPress={onPress}
      >
        <Text className="font-semibold text-primary-foreground">
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();
  const router = useRouter();
  const userId = useUserId();
  const roomId = Array.isArray(params.id)
    ? (params.id[0] ?? "")
    : (params.id ?? "");
  const room = useChatRoom(roomId);
  const messages = useChatMessages(roomId);

  const retry = useCallback(() => {
    room.refetch();
    messages.refetch();
  }, [messages, room]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  let content: ReactNode;
  if (
    (room.isPending && room.data === undefined) ||
    (messages.isPending && messages.data === undefined)
  ) {
    content = (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel="채팅 불러오는 중" />
      </View>
    );
  } else if (
    (room.isError && room.data === undefined) ||
    (messages.isError && messages.data === undefined)
  ) {
    content = (
      <CenteredAction
        actionLabel="다시 시도"
        message="채팅을 불러오지 못했어요."
        onPress={retry}
      />
    );
  } else if (!roomId || room.data === null) {
    content = (
      <CenteredAction
        actionLabel="채팅 목록으로"
        message="채팅방을 찾을 수 없어요."
        onPress={goBack}
      />
    );
  } else {
    content = (
      <ConversationSession
        messages={messages.data ?? []}
        roomId={roomId}
        userId={userId}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: room.data?.title ?? "새 채팅",
        }}
      />
      {content}
    </>
  );
}
