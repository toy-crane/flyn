import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@legendapp/list/react-native", () => {
  const ReactRuntime = require("react");
  const { View } = require("react-native");

  return {
    LegendList: ({
      data,
      renderItem,
    }: {
      data: unknown[];
      renderItem: (info: { item: unknown }) => unknown;
    }) =>
      ReactRuntime.createElement(
        View,
        null,
        data.map((item, index) =>
          ReactRuntime.createElement(
            ReactRuntime.Fragment,
            { key: index },
            renderItem({ item })
          )
        )
      ),
  };
});
jest.mock("expo-router", () =>
  require("../test-support/expo-router").expoRouterMock()
);
jest.mock("../lib/use-chat-rooms", () => ({
  useChatRooms: jest.fn(),
  useCreateChatRoom: jest.fn(),
  useDeleteChatRoom: jest.fn(),
}));
jest.mock("../lib/use-profile", () => ({
  useProfile: () => ({ data: { display_name: "테스터" } }),
}));
jest.mock("../lib/user-id", () => ({ useUserId: () => "user-1" }));

import {
  useChatRooms,
  useCreateChatRoom,
  useDeleteChatRoom,
} from "../lib/use-chat-rooms";
import { routerStub } from "../test-support/expo-router";
import HomeScreen from "./index";

const mockUseChatRooms = useChatRooms as jest.Mock;
const mockUseCreateChatRoom = useCreateChatRoom as jest.Mock;
const mockUseDeleteChatRoom = useDeleteChatRoom as jest.Mock;
const createRoom = jest.fn();
const deleteRoom = jest.fn();
const retry = jest.fn();

const ROOMS = [
  {
    created_at: "2026-07-28T01:00:00.000Z",
    id: "room-1",
    title: "첫 번째 채팅",
    updated_at: "2026-07-28T02:00:00.000Z",
    user_id: "user-1",
  },
  {
    created_at: "2026-07-27T01:00:00.000Z",
    id: "room-2",
    title: "두 번째 채팅",
    updated_at: "2026-07-27T02:00:00.000Z",
    user_id: "user-1",
  },
];

function alertButtons() {
  const spy = Alert.alert as unknown as jest.Mock;

  return (spy.mock.calls.at(-1)?.[2] ?? []) as {
    onPress?: () => void;
    style?: string;
    text: string;
  }[];
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  createRoom.mockResolvedValue({ id: "new-room" });
  mockUseChatRooms.mockReturnValue({
    data: ROOMS,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: retry,
  });
  mockUseCreateChatRoom.mockReturnValue({
    isPending: false,
    mutateAsync: createRoom,
  });
  mockUseDeleteChatRoom.mockReturnValue({
    isPending: false,
    mutate: deleteRoom,
  });
});

describe("채팅방 목록", () => {
  it("최근 채팅방을 제목과 갱신 시각이 있는 행으로 보여준다", async () => {
    await render(<HomeScreen />);

    expect(screen.getByText("첫 번째 채팅")).toBeTruthy();
    expect(screen.getByText("두 번째 채팅")).toBeTruthy();
    expect(screen.getAllByTestId("chat-room-updated-at")).toHaveLength(2);
  });

  it("채팅방 행을 누르면 상세 화면으로 push한다", async () => {
    await render(<HomeScreen />);

    fireEvent.press(screen.getByRole("button", { name: "첫 번째 채팅" }));

    expect(routerStub.push).toHaveBeenCalledWith("/chats/room-1");
  });

  it("native toolbar의 설정 action으로 설정 화면을 연다", async () => {
    await render(<HomeScreen />);

    fireEvent.press(screen.getByRole("button", { name: "설정" }));

    expect(routerStub.push).toHaveBeenCalledWith("/settings");
  });

  it("native toolbar의 새 채팅 action은 방을 만든 뒤 상세로 이동한다", async () => {
    await render(<HomeScreen />);

    fireEvent.press(screen.getByRole("button", { name: "새 채팅" }));

    expect(createRoom).toHaveBeenCalled();
    await waitFor(() => {
      expect(routerStub.push).toHaveBeenCalledWith("/chats/new-room");
    });
  });

  it("행을 길게 누르면 확인 전에는 삭제하지 않는다", async () => {
    await render(<HomeScreen />);

    fireEvent(
      screen.getByRole("button", { name: "첫 번째 채팅" }),
      "longPress"
    );

    expect(Alert.alert).toHaveBeenCalled();
    expect(deleteRoom).not.toHaveBeenCalled();
    expect(alertButtons().find((button) => button.text === "삭제")?.style).toBe(
      "destructive"
    );
  });

  it("삭제 확인을 누르면 해당 채팅방을 지운다", async () => {
    await render(<HomeScreen />);
    fireEvent(
      screen.getByRole("button", { name: "첫 번째 채팅" }),
      "longPress"
    );

    alertButtons()
      .find((button) => button.text === "삭제")
      ?.onPress?.();

    expect(deleteRoom).toHaveBeenCalledWith(
      "room-1",
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it("채팅방이 없으면 설명과 새 채팅 action을 보여준다", async () => {
    mockUseChatRooms.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: retry,
    });

    await render(<HomeScreen />);

    expect(screen.getByText("아직 채팅이 없어요")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "첫 채팅 시작하기" })
    ).toBeTruthy();
  });

  it("목록 조회 실패는 같은 화면에서 다시 시도할 수 있다", async () => {
    mockUseChatRooms.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: retry,
    });

    await render(<HomeScreen />);
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(retry).toHaveBeenCalled();
  });
});
