jest.mock("./supabase", () => ({ supabase: { from: jest.fn() } }));

import { supabase } from "./supabase";
import {
  createChatRoom,
  deleteChatRoom,
  fetchChatMessages,
  fetchChatRoom,
  fetchChatRooms,
} from "./use-chat-rooms";

const mockFrom = supabase.from as unknown as jest.Mock;

function stubQuery(result: Promise<{ data: unknown }>) {
  const calls: Record<string, unknown[][]> = {};
  const chain: Record<string, unknown> = {
    throwOnError: () => result,
  };

  for (const method of [
    "delete",
    "eq",
    "insert",
    "maybeSingle",
    "order",
    "select",
    "single",
  ]) {
    chain[method] = (...args: unknown[]) => {
      calls[method] = [...(calls[method] ?? []), args];
      return chain;
    };
  }

  mockFrom.mockReturnValue(chain);
  return calls;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("채팅방 직접 데이터 접근", () => {
  it("자기 채팅방을 최근 갱신 순으로 조회한다", async () => {
    const calls = stubQuery(Promise.resolve({ data: [] }));

    await fetchChatRooms("user-1");

    expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
    expect(calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(calls.order).toContainEqual(["updated_at", { ascending: false }]);
  });

  it("새 채팅방은 사용자 ID만 보내 DB 기본 제목을 쓴다", async () => {
    const room = { id: "room-1", title: "새 채팅" };
    const calls = stubQuery(Promise.resolve({ data: room }));

    await expect(createChatRoom("user-1")).resolves.toEqual(room);

    expect(calls.insert).toEqual([[{ user_id: "user-1" }]]);
  });

  it("채팅방 삭제는 선택한 ID로 좁힌다", async () => {
    const calls = stubQuery(Promise.resolve({ data: null }));

    await deleteChatRoom("room-1");

    expect(calls.delete).toHaveLength(1);
    expect(calls.eq).toContainEqual(["id", "room-1"]);
  });

  it("상세 진입은 RLS 안에서 해당 방 하나를 찾는다", async () => {
    const room = { id: "room-1", title: "제목" };
    const calls = stubQuery(Promise.resolve({ data: room }));

    await expect(fetchChatRoom("room-1")).resolves.toEqual(room);

    expect(calls.eq).toContainEqual(["id", "room-1"]);
    expect(calls.maybeSingle).toHaveLength(1);
  });

  it("메시지는 생성 시각과 ID 순으로 읽기만 한다", async () => {
    const calls = stubQuery(Promise.resolve({ data: [] }));

    await fetchChatMessages("room-1");

    expect(mockFrom).toHaveBeenCalledWith("chat_messages");
    expect(calls.eq).toContainEqual(["chat_room_id", "room-1"]);
    expect(calls.order).toEqual([
      ["created_at", { ascending: true }],
      ["id", { ascending: true }],
    ]);
    expect(calls.insert).toBeUndefined();
  });
});
