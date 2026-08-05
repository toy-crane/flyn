import { fireEvent, render, screen } from "@testing-library/react-native";

const mockHeaderOptions: { current?: Record<string, unknown> } = {};
const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const Stack = {
    Screen: ({ options }: { options: Record<string, unknown> }) => {
      mockHeaderOptions.current = options;
      return null;
    },
  };

  return {
    Stack,
    useLocalSearchParams: () => ({ id: "room-1" }),
    useRouter: () => ({ back: mockBack }),
  };
});
jest.mock("../../components/chat/chat-conversation", () => {
  const ReactRuntime = require("react");
  const { Text } = require("react-native");

  return {
    ChatConversation: () => ReactRuntime.createElement(Text, null, "대화 화면"),
  };
});
jest.mock("../../lib/use-chat-rooms", () => ({
  useChatMessages: jest.fn(),
  useChatRoom: jest.fn(),
}));
jest.mock("../../lib/use-persistent-chat", () => ({
  usePersistentChat: jest.fn(() => ({ messages: [] })),
}));
jest.mock("../../lib/user-id", () => ({
  useUserId: () => "account-1",
}));

import { useChatMessages, useChatRoom } from "../../lib/use-chat-rooms";
import { usePersistentChat } from "../../lib/use-persistent-chat";
import ChatDetailScreen from "./[id]";

const mockUseChatRoom = useChatRoom as jest.Mock;
const mockUseChatMessages = useChatMessages as jest.Mock;
const mockUsePersistentChat = usePersistentChat as jest.Mock;
const retryRoom = jest.fn();
const retryMessages = jest.fn();

const ROOM = {
  created_at: "2026-07-28T01:00:00.000Z",
  id: "room-1",
  title: "테스트 채팅",
  updated_at: "2026-07-28T01:00:00.000Z",
  user_id: "account-1",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockHeaderOptions.current = undefined;
  mockUseChatRoom.mockReturnValue({
    data: ROOM,
    isError: false,
    isPending: false,
    refetch: retryRoom,
  });
  mockUseChatMessages.mockReturnValue({
    data: [],
    isError: false,
    isPending: false,
    refetch: retryMessages,
  });
});

describe("채팅방 상세", () => {
  it("native header에 채팅방 제목을 쓰고 대화 controller를 연결한다", async () => {
    await render(<ChatDetailScreen />);

    expect(mockHeaderOptions.current).toMatchObject({
      headerShown: true,
      title: "테스트 채팅",
    });
    expect(screen.getByText("대화 화면")).toBeTruthy();
    expect(mockUsePersistentChat).toHaveBeenCalledWith(
      "room-1",
      "account-1",
      []
    );
  });

  it("방이나 메시지를 읽는 동안 native 화면 안에 loading을 보여준다", async () => {
    mockUseChatMessages.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: true,
      refetch: retryMessages,
    });

    await render(<ChatDetailScreen />);

    expect(screen.getByLabelText("채팅 불러오는 중").props.color).toBe(
      "#777777"
    );
    expect(screen.queryByText("대화 화면")).toBeNull();
  });

  it("조회 실패는 현재 화면에서 방과 메시지를 함께 재시도한다", async () => {
    mockUseChatRoom.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: retryRoom,
    });

    await render(<ChatDetailScreen />);
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(retryRoom).toHaveBeenCalled();
    expect(retryMessages).toHaveBeenCalled();
  });

  it("삭제됐거나 남의 방이면 막다른 화면 대신 목록으로 돌아갈 수 있다", async () => {
    mockUseChatRoom.mockReturnValue({
      data: null,
      isError: false,
      isPending: false,
      refetch: retryRoom,
    });

    await render(<ChatDetailScreen />);
    fireEvent.press(screen.getByRole("button", { name: "채팅 목록으로" }));

    expect(screen.getByText("채팅방을 찾을 수 없어요.")).toBeTruthy();
    expect(mockBack).toHaveBeenCalled();
  });
});
