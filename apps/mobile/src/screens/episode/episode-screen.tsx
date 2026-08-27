import type { UIMessage } from "ai";
import { useNavigation } from "expo-router";
import {
  type NavigationAction,
  useHeaderHeight,
  usePreventRemove,
} from "expo-router/react-navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, Text, View } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  useConversation,
  useLocalChatDrafts,
} from "@/features/chat/state/use-chat-session";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import { useEpisodeRun } from "@/features/episode/state/use-episode-run";
import { EpisodeClosing } from "@/features/episode/ui/episode-closing";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { EpisodeSituationBanner } from "@/features/episode/ui/episode-situation-banner";

/**
 * 에피소드 하나를 사건 시작부터 결말까지 진행하는 화면.
 *
 * 대화를 굴리는 부분은 채팅 기능의 것을 그대로 쓰고, 에피소드 기능은 어떤
 * 화를 어디까지 진행했는지를 소유한다. 둘을 잇는 자리가 이 화면이다. 진행하던
 * 서버에서 받은 장면으로 시작한다. 진행 중이면 입력을 열고, 끝난 기록이면 같은
 * 메시지를 읽기 전용으로 보여 준다. 나가기와 다음 화 열기는 경로가 소유한다.
 *
 * 어느 화인지는 화면이 정하지 않는다. 계정의 진행이 정한 화를 경로가 넘겨
 * 주고, 경로는 그 화를 알기 전에 이 화면을 그리지 않는다. 상황 줄이 뒤늦게
 * 생기면 장면 목록이 이미 잡아 둔 배치와 어긋나 첫 장면이 화면 밖에 남는다.
 *
 * Side chat으로 들어가는 길은 넘기지 않는다. 잠깐 물어보기는 다음 단위이고,
 * 템플릿의 Side chat이 그 자리를 미리 차지하지 않는다.
 */
export function EpisodeScreen({
  episodeId,
  initialMessages,
  onLeave,
  onSettlingChange,
  onStartNext,
  readOnly,
  situation,
  situationEmoji,
}: {
  episodeId: string;
  initialMessages: UIMessage[];
  onLeave: () => void;
  onSettlingChange: (isSettling: boolean) => void;
  onStartNext: (episodeId: string) => void;
  readOnly: boolean;
  situation: string;
  situationEmoji: string;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const { chat, ending, isSaving, nextUp, open, stopAndSave } = useEpisodeRun(
    accessToken,
    episodeId,
    initialMessages,
    readOnly
  );
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(chat, drafts, accessToken);
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const pendingRemoval = useRef<NavigationAction | undefined>(undefined);
  const [canRemove, setCanRemove] = useState(false);
  // 첫 장면을 받지 못했다면 다시 받을 것은 답변이 아니라 에피소드의 시작이다.
  // 되받을 답변이 없어 그냥 돌아서는 다시 시도는 눌러도 아무 일이 없다.
  // 중지한 장면을 저장하는 동안 오류가 함께 와도 새 요청은 시작하지 않는다.
  const retry = useCallback(() => {
    if (isSaving) {
      return;
    }

    if (conversation.messages.length === 0) {
      open();
      return;
    }

    conversation.retry();
  }, [conversation.messages.length, conversation.retry, isSaving, open]);
  const conversationRun = useMemo(
    () => ({
      ...conversation,
      isBusy: conversation.isBusy || isSaving,
      retry,
      stop: stopAndSave,
    }),
    [conversation, isSaving, retry, stopAndSave]
  );
  // useChat의 stop은 요청만 취소하고 마지막 응답 조각이 React에 들어오기를
  // 기다리지 않는다. 나가기 동작은 한 번만 맡아 두고, 마지막 렌더를 서버와
  // 맞춘 뒤 원래 POP, GO_BACK 또는 REPLACE를 그대로 이어 간다.
  const handlePreventedRemoval = useCallback(
    ({ data }: { data: { action: NavigationAction } }) => {
      if (pendingRemoval.current !== undefined) {
        return;
      }

      pendingRemoval.current = data.action;
      stopAndSave()
        .catch(() => undefined)
        .finally(() => {
          setCanRemove(true);
        });
    },
    [stopAndSave]
  );

  usePreventRemove(
    conversationRun.isBusy && !canRemove,
    handlePreventedRemoval
  );

  useEffect(() => {
    const action = pendingRemoval.current;
    if (!(canRemove && action)) {
      return;
    }

    pendingRemoval.current = undefined;
    navigation.dispatch(action);
  }, [canRemove, navigation]);

  useEffect(() => {
    onSettlingChange(isSaving);
  }, [isSaving, onSettlingChange]);

  let closing: ReactNode;

  if (ending !== undefined) {
    closing = (
      <EpisodeClosing
        ending={ending}
        isSettling={isSaving}
        nextUp={nextUp}
        onLeave={onLeave}
        onStartNext={onStartNext}
        readOnly={readOnly}
      />
    );
  } else if (readOnly) {
    closing = (
      <View
        className="rounded-2xl bg-surface px-5 py-4"
        testID="episode-read-only"
      >
        <Text className="font-semibold text-accent text-sm">
          {episodeLabels.reviewOnly}
        </Text>
      </View>
    );
  }
  // 첫 장면은 사용자의 보내기 동작 없이 서버에서 먼저 온다. 빈 상태로
  // 배치된 LegendList를 한 번 다시 만들어야 첫 행의 높이와 위치를 잰다.
  const panelKey = conversationRun.messages.length === 0 ? "empty" : "started";

  return (
    <ChatPanel
      banner={
        <EpisodeSituationBanner emoji={situationEmoji} text={situation} />
      }
      busyLabel={isSaving ? episodeLabels.saving : undefined}
      canStop={!isSaving}
      chat={conversationRun}
      closing={closing}
      hasMessageActions={false}
      key={panelKey}
      placeholder={episodeLabels.placeholder}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}
