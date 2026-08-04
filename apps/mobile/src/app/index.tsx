import { LegendList } from "@legendapp/list/react-native";
import { Stack, useIsFocused, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  type ColorValue,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RNSymbol } from "../components/symbols/rn-symbol";
import {
  type ChatRoom,
  useChatRooms,
  useCreateChatRoom,
  useDeleteChatRoom,
} from "../lib/use-chat-rooms";
import { useUserId } from "../lib/user-id";
import { useColors } from "../theme/app-theme";
import { spacing, typography } from "../theme/tokens";

const styles = StyleSheet.create({
  action: {
    alignSelf: "center",
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  actionLabel: typography.action,
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  emptyAction: {
    marginTop: spacing.xs,
  },
  emptyDescription: {
    ...typography.supporting,
    textAlign: "center",
  },
  emptyTitle: typography.title,
  errorMessage: {
    ...typography.body,
    textAlign: "center",
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  roomContent: {
    flex: 1,
    gap: spacing.xxs,
    paddingRight: spacing.md,
  },
  roomRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  roomTitle: typography.body,
  screen: {
    flex: 1,
  },
  timestamp: typography.caption,
});

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
  disclosureColor: ColorValue;
  onDelete: (room: ChatRoom) => void;
  onOpen: (roomId: string) => void;
  room: ChatRoom;
}) {
  const colors = useColors();
  const handleDelete = useCallback(() => {
    onDelete(room);
  }, [onDelete, room]);
  const handleOpen = useCallback(() => {
    onOpen(room.id);
  }, [onOpen, room.id]);
  const rowStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.roomRow,
      { borderColor: colors.separator },
      pressed && { backgroundColor: colors.surface },
    ],
    [colors.separator, colors.surface]
  );

  return (
    <Pressable
      accessibilityHint="길게 누르면 삭제할 수 있어요"
      accessibilityLabel={room.title}
      accessibilityRole="button"
      onLongPress={handleDelete}
      onPress={handleOpen}
      style={rowStyle}
    >
      <View style={styles.roomContent}>
        <Text
          numberOfLines={2}
          style={[styles.roomTitle, { color: colors.text }]}
        >
          {room.title}
        </Text>
        <Text
          style={[styles.timestamp, { color: colors.secondaryText }]}
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
  const colors = useColors();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      styles.emptyAction,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View style={styles.centered}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        아직 채팅이 없어요
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.secondaryText }]}>
        궁금한 것을 보내면 대화가 여기에 저장돼요.
      </Text>
      <Pressable
        accessibilityLabel="첫 채팅 시작하기"
        accessibilityRole="button"
        onPress={onCreate}
        style={actionStyle}
      >
        <Text style={[styles.actionLabel, { color: colors.onPrimary }]}>
          첫 채팅 시작하기
        </Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
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
        disclosureColor={colors.secondaryText}
        onDelete={confirmDelete}
        onOpen={openRoom}
        room={item}
      />
    ),
    [colors.secondaryText, confirmDelete, openRoom]
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
  const retryStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      {
        backgroundColor: colors.primary,
        opacity: pressed || rooms.isFetching ? 0.7 : 1,
      },
    ],
    [colors.primary, rooms.isFetching]
  );

  let content: ReactNode;
  if (rooms.isPending && !rooms.data) {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator accessibilityLabel="채팅 불러오는 중" />
      </View>
    );
  } else if (rooms.isError && !rooms.data) {
    content = (
      <View style={styles.centered}>
        <Text style={[styles.errorMessage, { color: colors.text }]}>
          채팅을 불러오지 못했어요.
        </Text>
        <Pressable
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
          disabled={rooms.isFetching}
          onPress={retryRooms}
          style={retryStyle}
        >
          <Text style={[styles.actionLabel, { color: colors.onPrimary }]}>
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

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {content}
      </View>
    </>
  );
}
