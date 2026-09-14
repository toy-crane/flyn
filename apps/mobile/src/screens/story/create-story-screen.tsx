import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { randomUUID } from "expo-crypto";
import { useHeaderHeight } from "expo-router/react-navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  type StoryCreationStage,
  saveStory,
} from "@/features/story/api/create-story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryOutlineTurn } from "@/features/story/ui/story-outline-card";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";
import { trackPendingUserWork } from "@/shared/state/pending-user-work";

/**
 * 화면을 열면 이미 놓여 있는 플린의 첫마디.
 *
 * 모델이 쓰지 않는다. 첫 화면이 빈 채로 기다리지 않고, 이 문장이 무엇을
 * 물어보는 자리인지 바로 말한다.
 */
const OPENING: UIMessage = {
  id: "creation-opening",
  parts: [{ text: "어떤 상황에서 영어로 대화해 보고 싶으세요?", type: "text" }],
  role: "assistant",
};

/**
 * 카드가 자기 버튼에 대해 알아야 하는 것.
 *
 * 패널이 아니라 이 통로로 간다. 목록은 메시지가 바뀔 때만 줄을 다시 그리므로,
 * 곁들일 것을 새로 만들어 넘겨도 이미 그려진 카드에는 닿지 않는다. 진행 중이
 * 화면에 나타나지 않던 이유가 이것이었다.
 */
const OutlineStart = createContext<{
  isDisabled: boolean;
  isStarting: boolean;
  onAdd: () => void;
  onStart: () => void;
  startableMessageId: string | undefined;
  stage: StoryCreationStage | undefined;
}>({
  isDisabled: false,
  isStarting: false,
  onAdd: () => undefined,
  onStart: () => undefined,
  stage: undefined,
  startableMessageId: undefined,
});

/**
 * 메시지 하나 곁에 붙는 스토리 카드.
 *
 * 패널은 글 조각만 그린다. 카드가 흐르는 조각은 이 자리가 아니면 화면에 나오지
 * 않는다. 이 컴포넌트는 한 번 만들어 두고 바꾸지 않는다.
 */
function OutlineAddon({ message }: { message: UIMessage }) {
  const { isDisabled, isStarting, onAdd, onStart, startableMessageId, stage } =
    useContext(OutlineStart);
  const outline = outlineOfMessage(message);

  if (!outline) {
    return null;
  }

  return (
    <StoryOutlineTurn
      isDisabled={isDisabled}
      isStarting={isStarting}
      onAdd={message.id === startableMessageId ? onAdd : undefined}
      onStart={message.id === startableMessageId ? onStart : undefined}
      outline={outline}
      progress={
        message.id === startableMessageId && stage
          ? storyLabels.creationProgress[stage]
          : undefined
      }
    />
  );
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
  /** 저장이 끝나면 스토리 상세를 연다. */
  onMade: (made: MadeStory) => void;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const headerHeight = useHeaderHeight();
  const inputRef = useFocusOnArrival<TextInput>();
  const [isStarting, setIsStarting] = useState(false);
  const [stage, setStage] = useState<StoryCreationStage>();
  const [addingAt, setAddingAt] = useState<string>();
  const requestLock = useRef(false);
  // 같은 프레임에 두 번 눌리는 것까지 막는다. 상태만으로는 다시 그리기 전의
  // 두 번째 누름이 지나가 스토리가 둘 만들어진다. 만드는 중인 카드를 들고
  // 있으므로 어느 카드로 만드는 중인지도 이 한 값이 답한다.
  const starting = useRef<string | undefined>(undefined);
  const mounted = useRef<true | undefined>(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = undefined;
    };
  }, []);

  const transport = useMemo(
    () => createStoryTransport(() => accessToken),
    [accessToken]
  );
  const chat = useChat({
    // React Native에는 전역 `crypto`가 없다. 에피소드 대화와 같은 것을 쓴다.
    generateId: () => randomUUID(),
    messages: [OPENING],
    throttle: STREAM_UPDATE_INTERVAL_MS,
    transport,
  });
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(
    chat,
    drafts,
    accessToken,
    undefined,
    requestLock
  );
  const newest = useMemo(() => latestOutline(chat.messages), [chat.messages]);
  const interviewPending =
    newest !== undefined &&
    (addingAt === newest.messageId ||
      chat.messages.at(-1)?.id !== newest.messageId);
  const isDisabled = conversation.isBusy || interviewPending;
  const add = useCallback(() => {
    if (
      // biome-ignore lint/suspicious/noUnnecessaryConditions: 다른 버튼 호출이 이 ref를 동기적으로 변경한다.
      requestLock.current ||
      starting.current ||
      isDisabled ||
      !accessToken ||
      !newest ||
      newest.outline.episodes.length >= 5
    ) {
      return;
    }
    requestLock.current = true;
    setAddingAt(newest.messageId);
    trackPendingUserWork(
      chat.sendMessage({ text: "에피소드를 하나 더 넣고 싶어요." })
    )
      .catch(() => {
        // 요청 실패는 useChat의 error를 통해 기존 대화 재시도로 표시한다.
      })
      .finally(() => {
        requestLock.current = false;
      });
  }, [accessToken, chat.sendMessage, isDisabled, newest]);

  const start = useCallback(() => {
    if (
      starting.current !== undefined ||
      requestLock.current ||
      isDisabled ||
      !(accessToken && newest)
    ) {
      return;
    }

    requestLock.current = true;
    starting.current = newest.messageId;
    setIsStarting(true);

    trackPendingUserWork(
      saveStory(accessToken, newest.outline, (nextStage) => {
        // biome-ignore lint/suspicious/noUnnecessaryConditions: 응답 전에 effect 정리 함수가 ref를 변경할 수 있다.
        if (mounted.current) {
          setStage(nextStage);
        }
      })
    )
      .then((made) => {
        // biome-ignore lint/suspicious/noUnnecessaryConditions: 응답 전에 화면이 사라질 수 있다.
        if (mounted.current) {
          onMade(made);
        }
      })
      .catch(() => {
        // biome-ignore lint/suspicious/noUnnecessaryConditions: 응답 전에 화면이 사라질 수 있다.
        if (!mounted.current) {
          return;
        }
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
        requestLock.current = false;
        starting.current = undefined;
        // biome-ignore lint/suspicious/noUnnecessaryConditions: 응답 전에 화면이 사라질 수 있다.
        if (mounted.current) {
          setIsStarting(false);
          setStage(undefined);
        }
      });
  }, [accessToken, isDisabled, newest, onMade]);

  /*
    `대화 시작하기`는 가장 최근 카드에만 붙는다. 지난 카드는 대화에 남되 버튼이
    없어, 어느 카드로 만드는지가 흐려지지 않는다.
  */
  const startState = useMemo(
    () => ({
      isDisabled,
      isStarting,
      onAdd: add,
      onStart: start,
      stage,
      startableMessageId: newest?.messageId,
    }),
    [add, isDisabled, isStarting, newest?.messageId, stage, start]
  );

  return (
    <OutlineStart value={startState}>
      <ChatPanel
        canCompose={!isStarting}
        chat={conversation}
        hasMessageActions={false}
        inputRef={inputRef}
        messageAddon={OutlineAddon}
        placeholder={storyLabels.createPlaceholder}
        topInset={Platform.OS === "ios" ? headerHeight : 0}
      />
    </OutlineStart>
  );
}
