import type { Tables } from "@flyn/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

export type ChatRoom = Tables<"chat_rooms">;
export type StoredChatMessage = Tables<"chat_messages">;

const ROOM_COLUMNS = "id, user_id, title, created_at, updated_at";
const MESSAGE_COLUMNS = "id, chat_room_id, role, content, status, created_at";

export async function fetchChatRooms(userId: string): Promise<ChatRoom[]> {
  const { data } = await supabase
    .from("chat_rooms")
    .select(ROOM_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .throwOnError();

  return data;
}

export async function createChatRoom(userId: string): Promise<ChatRoom> {
  const { data } = await supabase
    .from("chat_rooms")
    .insert({ user_id: userId })
    .select(ROOM_COLUMNS)
    .single()
    .throwOnError();

  return data;
}

export async function deleteChatRoom(roomId: string): Promise<void> {
  await supabase.from("chat_rooms").delete().eq("id", roomId).throwOnError();
}

export async function fetchChatRoom(roomId: string): Promise<ChatRoom | null> {
  const { data } = await supabase
    .from("chat_rooms")
    .select(ROOM_COLUMNS)
    .eq("id", roomId)
    .maybeSingle()
    .throwOnError();

  return data;
}

export async function fetchChatMessages(
  roomId: string
): Promise<StoredChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select(MESSAGE_COLUMNS)
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .throwOnError();

  return data;
}

export function useChatRooms(userId: string) {
  return useQuery({
    queryFn: () => fetchChatRooms(userId),
    queryKey: queryKeys.chatRooms(userId),
  });
}

export function useCreateChatRoom(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createChatRoom(userId),
    onSuccess: (room) => {
      queryClient.setQueryData<ChatRoom[]>(
        queryKeys.chatRooms(userId),
        (rooms = []) => [room, ...rooms]
      );
      queryClient.setQueryData(queryKeys.chatRoom(room.id), room);
    },
  });
}

export function useDeleteChatRoom(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChatRoom,
    onSuccess: (_result, roomId) => {
      queryClient.setQueryData<ChatRoom[]>(
        queryKeys.chatRooms(userId),
        (rooms = []) => rooms.filter((room) => room.id !== roomId)
      );
      queryClient.removeQueries({
        queryKey: queryKeys.chatRoom(roomId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.chatMessages(roomId),
      });
    },
  });
}

export function useChatRoom(roomId: string) {
  return useQuery({
    queryFn: () => fetchChatRoom(roomId),
    queryKey: queryKeys.chatRoom(roomId),
  });
}

export function useChatMessages(roomId: string) {
  return useQuery({
    queryFn: () => fetchChatMessages(roomId),
    queryKey: queryKeys.chatMessages(roomId),
  });
}
