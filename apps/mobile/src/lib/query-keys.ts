export const queryKeys = {
  chatMessages: (roomId: string) => ["chat-messages", roomId] as const,
  chatRoom: (roomId: string) => ["chat-room", roomId] as const,
  chatRooms: (userId: string) => ["chat-rooms", userId] as const,
  episodes: (userId: string) => ["episodes", userId] as const,
  // 로그아웃이 캐시를 통째로 비우지만(use-auth.ts), 사용자별로 키를 나눠 두면
  // 비우기 전에 다른 사용자의 프로필을 잠깐이라도 보여줄 여지가 없다.
  profile: (userId: string) => ["profile", userId] as const,
};
