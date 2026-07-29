import { LegendList } from "@legendapp/list/react-native";
import { Stack, useIsFocused, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { RNSymbol } from "../components/symbols/rn-symbol";
import {
  type ChatRoom,
  useChatRooms,
  useCreateChatRoom,
  useDeleteChatRoom,
} from "../lib/use-chat-rooms";
import { useUserId } from "../lib/user-id";
import { useAppTheme } from "../theme/app-theme";

const TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
});
const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  day: "numeric",
  month: "short",
});

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return sameDay ? TIME_FORMAT.format(date) : DATE_FORMAT.format(date);
}

function roomKey(room: ChatRoom) {
  return room.id;
}

function ChatRoomRow({
  disclosureColor,
  onDelete,
  onOpen,
  room,
}: {
  disclosureColor: string;
  onDelete: (room: ChatRoom) => void;
  onOpen: (roomId: string) => void;
  room: ChatRoom;
}) {
  const handleDelete = useCallback(() => {
    onDelete(room);
  }, [onDelete, room]);
  const handleOpen = useCallback(() => {
    onOpen(room.id);
  }, [onOpen, room.id]);

  return (
    <Pressable
      accessibilityHint="길게 누르면 삭제할 수 있어요"
      accessibilityLabel={room.title}
      accessibilityRole="button"
      className="min-h-18 flex-row items-center border-border border-b px-5 py-3 active:bg-surface"
      onLongPress={handleDelete}
      onPress={handleOpen}
    >
      <View className="flex-1 gap-1 pr-4">
        <Text
          className="text-[17px] text-foreground leading-6"
          numberOfLines={2}
        >
          {room.title}
        </Text>
        <Text
          className="text-[13px] text-muted-foreground"
          testID="chat-room-updated-at"
        >
          {formatUpdatedAt(room.updated_at)}
        </Text>
      </View>
      <RNSymbol color={disclosureColor} symbol="disclosure" />
    </Pressable>
  );
}

function EmptyRooms({ onCreate }: { onCreate: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="font-semibold text-[22px] text-foreground">
        아직 채팅이 없어요
      </Text>
      <Text className="text-center text-[15px] text-muted-foreground leading-6">
        궁금한 것을 보내면 대화가 여기에 저장돼요.
      </Text>
      <Pressable
        accessibilityLabel="첫 채팅 시작하기"
        accessibilityRole="button"
        className="mt-2 min-h-11 justify-center rounded-full bg-primary px-5 active:opacity-70"
        onPress={onCreate}
      >
        <Text className="font-semibold text-primary-foreground">
          첫 채팅 시작하기
        </Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const app = useAppTheme();
  const isFocused = useIsFocused();
  const router = useRouter();
  const userId = useUserId();
  const rooms = useChatRooms(userId);
  const createRoom = useCreateChatRoom(userId);
  const deleteRoom = useDeleteChatRoom(userId);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setManualRefreshing(false);
    }
  }, [isFocused]);

  const openSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const openRoom = useCallback(
    (roomId: string) => {
      router.push(`/chats/${roomId}`);
    },
    [router]
  );

  const makeRoom = useCallback(async () => {
    if (createRoom.isPending) {
      return;
    }

    try {
      const room = await createRoom.mutateAsync();
      openRoom(room.id);
    } catch {
      Alert.alert("새 채팅을 만들지 못했어요", "잠시 후 다시 시도해 주세요.");
    }
  }, [createRoom, openRoom]);

  const confirmDelete = useCallback(
    (room: ChatRoom) => {
      Alert.alert(
        "채팅을 삭제할까요?",
        `"${room.title}"의 모든 메시지가 함께 삭제됩니다.`,
        [
          { style: "cancel", text: "취소" },
          {
            onPress: () => {
              deleteRoom.mutate(room.id, {
                onError: () => {
                  Alert.alert(
                    "채팅을 삭제하지 못했어요",
                    "잠시 후 다시 시도해 주세요."
                  );
                },
              });
            },
            style: "destructive",
            text: "삭제",
          },
        ]
      );
    },
    [deleteRoom]
  );

  const renderRoom = useCallback(
    ({ item }: { item: ChatRoom }) => (
      <ChatRoomRow
        disclosureColor={app.mutedForeground}
        onDelete={confirmDelete}
        onOpen={openRoom}
        room={item}
      />
    ),
    [app.mutedForeground, confirmDelete, openRoom]
  );
  const retryRooms = useCallback(() => {
    rooms.refetch();
  }, [rooms.refetch]);
  const refreshRooms = useCallback(async () => {
    setManualRefreshing(true);

    try {
      await rooms.refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [rooms.refetch]);

  let content: ReactNode;
  if (rooms.isPending && !rooms.data) {
    content = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator accessibilityLabel="채팅 불러오는 중" />
      </View>
    );
  } else if (rooms.isError && !rooms.data) {
    content = (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Text className="text-center text-[17px] text-foreground">
          채팅을 불러오지 못했어요.
        </Text>
        <Pressable
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
          className="min-h-11 justify-center rounded-full bg-primary px-5"
          disabled={rooms.isFetching}
          onPress={retryRooms}
        >
          <Text className="font-semibold text-primary-foreground">
            다시 시도
          </Text>
        </Pressable>
      </View>
    );
  } else if (rooms.data?.length === 0) {
    content = <EmptyRooms onCreate={makeRoom} />;
  } else {
    content = (
      <LegendList
        contentInsetAdjustmentBehavior="automatic"
        data={rooms.data ?? []}
        keyExtractor={roomKey}
        maintainVisibleContentPosition
        onRefresh={refreshRooms}
        recycleItems
        refreshing={isFocused && manualRefreshing}
        renderItem={renderRoom}
      />
    );
  }

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="설정"
          icon="gearshape"
          onPress={openSettings}
        />
        <Stack.Toolbar.Button
          accessibilityLabel="새 채팅"
          disabled={createRoom.isPending}
          icon="square.and.pencil"
          onPress={makeRoom}
        />
      </Stack.Toolbar>

      <View className="flex-1 bg-background">{content}</View>
    </>
  );
}
