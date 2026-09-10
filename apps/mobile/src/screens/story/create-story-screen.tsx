import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Platform, type TextInput } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  STREAM_UPDATE_INTERVAL_MS,
  useConversation,
  useLocalChatDrafts,
} from "@/features/chat/state/use-conversation";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import {
  createStoryTransport,
  latestOutline,
  type MadeStory,
  outlineOfMessage,
  saveStory,
} from "@/features/story/api/create-story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryOutlineCard } from "@/features/story/ui/story-outline-card";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";

/**
 * 화면을 열면 이미 놓여 있는 플린의 첫마디.
 *
 * 모델이 쓰지 않는다. 첫 화면이 빈 채로 기다리지 않고, 이 문장이 무엇을
 * 물어보는 자리인지 바로 말한다.
 */
const OPENING: UIMessage = {
  id: "creation-opening",
  parts: [{ text: "어떤 상황을 만들고 싶어요?", type: "text" }],
  role: "assistant",
};

/**
 * 메시지 하나 곁에 붙는 스토리 카드.
 *
 * 패널은 글 조각만 그린다. 카드가 흐르는 조각은 이 자리가 아니면 화면에 나오지
 * 않는다. 만들기 화면이 무엇을 넘길지 정해 이 컴포넌트를 만든다.
 */
function createOutlineAddon({
  isStarting,
  onStart,
  startableMessageId,
}: {
  isStarting: boolean;
  onStart: () => void;
  startableMessageId: string | undefined;
}) {
  return function OutlineAddon({ message }: { message: UIMessage }) {
    const outline = outlineOfMessage(message);

    if (!outline) {
      return null;
    }

    return (
      <StoryOutlineCard
        isStarting={isStarting}
        onStart={message.id === startableMessageId ? onStart : undefined}
        outline={outline}
      />
    );
  };
}

/**
 * 플린과 함께 자기만의 스토리를 만드는 자리.
 *
 * 입력창, 스트리밍, 답변 대기 표시는 에피소드와 `AI에게 물어보기`가 쓰는 공통
 * 대화 표현 그대로다. 여기서 더한 것은 스토리 카드 하나뿐이다.
 *
 * 대화는 이 화면과 생사를 같이한다. 나가면 사라지고 다시 열면 첫마디부터
 * 시작한다. 저장은 `대화 시작하기`에서 처음 일어난다.
 */
export function CreateStoryScreen({
  onMade,
}: {
  /** 저장이 끝났을 때. 여기서 1화를 연다. */
  onMade: (made: MadeStory) => void;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const headerHeight = useHeaderHeight();
  const inputRef = useFocusOnArrival<TextInput>();
  const [isStarting, setIsStarting] = useState(false);
  // 같은 프레임에 두 번 눌리는 것까지 막는다. 상태만으로는 다시 그리기 전의
  // 두 번째 누름이 지나가 스토리가 둘 만들어진다. 만드는 중인 카드를 들고
  // 있으므로 어느 카드로 만드는 중인지도 이 한 값이 답한다.
  const starting = useRef<string | undefined>(undefined);

  const transport = useMemo(
    () => createStoryTransport(() => accessToken),
    [accessToken]
  );
  const chat = useChat({
    generateId: () => crypto.randomUUID(),
    messages: [OPENING],
    throttle: STREAM_UPDATE_INTERVAL_MS,
    transport,
  });
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(chat, drafts, accessToken);
  const newest = useMemo(() => latestOutline(chat.messages), [chat.messages]);

  const start = useCallback(() => {
    if (starting.current !== undefined || !(accessToken && newest)) {
      return;
    }

    starting.current = newest.messageId;
    setIsStarting(true);

    saveStory(accessToken, newest.outline)
      .then(onMade)
      .catch(() => {
        /*
          실패한 시도는 아무것도 남기지 않는다. 카드와 대화는 그대로 두고 시작
          실패와 같은 알림만 띄운다.
        */
        Alert.alert(storyLabels.createFailedTitle, undefined, [
          { style: "cancel", text: storyLabels.startFailedClose },
          { onPress: start, text: storyLabels.startFailedRetry },
        ]);
      })
      .finally(() => {
        starting.current = undefined;
        setIsStarting(false);
      });
  }, [accessToken, newest, onMade]);

  /*
    `대화 시작하기`는 가장 최근 카드에만 붙는다. 지난 카드는 대화에 남되 버튼이
    없어, 어느 카드로 만드는지가 흐려지지 않는다.
  */
  const OutlineAddon = useMemo(
    () =>
      createOutlineAddon({
        isStarting,
        onStart: start,
        startableMessageId: newest?.messageId,
      }),
    [isStarting, newest?.messageId, start]
  );

  return (
    <ChatPanel
      chat={conversation}
      hasMessageActions={false}
      inputRef={inputRef}
      messageAddon={OutlineAddon}
      placeholder={storyLabels.createPlaceholder}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}
