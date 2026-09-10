import type { UIMessage } from "ai";
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import type { TextInput } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  useConversation,
  useLocalChatDrafts,
} from "@/features/chat/state/use-conversation";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import type {
  EpisodeCorrection,
  ExpressionResult,
} from "@/features/episode/api/episode-correction";
import type { EpisodeCastMember } from "@/features/episode/api/episode-session";
import type { SavedExpressionRef } from "@/features/episode/api/saved-expression";
import { useEpisodeAsks } from "@/features/episode/state/episode-asks";
import { EpisodeCorrectionsProvider } from "@/features/episode/state/episode-corrections";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { SavedExpressionsProvider } from "@/features/episode/state/saved-expressions";
import { useEpisodeStoryPlay } from "@/features/episode/state/use-episode-story-play";
import { EpisodeCorrectionNote } from "@/features/episode/ui/correction-note";
import { EpisodeClosing } from "@/features/episode/ui/episode-closing";
import {
  correctionLabels,
  episodeLabels,
} from "@/features/episode/ui/episode-labels";
import { EpisodeSituationBanner } from "@/features/episode/ui/episode-situation-banner";
import { UtteranceExpressionSlot } from "@/features/episode/ui/expression-bookmark";
import { useExpressionToast } from "@/features/episode/ui/expression-toast";
import { useExpressionNoteRefresh } from "@/features/note/query/expression-note";
import { StatusLine } from "@/shared/ui/status-line";

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
 * 배울 표현은 말풍선 아래에 매달린다. 대화는 채팅 기능의 것이고 교정은
 * 에피소드 기능의 것이라, 둘을 잇는 자리도 여기다. 메시지 하나에 거는 동작과
 * 템플릿의 텍스트 선택 진입은 여전히 넘기지 않는다. 물어보는 자리로 들어가는
 * 길은 교정 카드 하나뿐이다.
 *
 * 나가기를 붙잡아 두지 않는다. 대화를 저장하는 주체가 서버 하나라, 중지하거나
 * 화면을 나가면 요청만 끊고 서버가 자기가 만든 데까지를 스스로 남긴다.
 */
export function EpisodeScreen({
  cast,
  episodeId,
  initialMessages,
  onReview,
  onOpenAsk,
  onStoryPlayStarted,
  readOnly,
  recordedEnding,
  recordedNextUp,
  storyPlayId,
  savedExpressions,
  savedResults,
  situation,
  situationEmoji,
  storyId,
}: {
  /** 이 화에 서는 인물. 이름표 색이 그 스토리 안 순서를 받는다. */
  cast?: readonly EpisodeCastMember[];
  episodeId: string;
  initialMessages: UIMessage[];
  onReview: (nextUp: EpisodeNextUp | undefined) => void;
  onOpenAsk: (id: string) => void;
  /** 새 대화의 회차가 서버에서 막 생겼다. */
  onStoryPlayStarted: (storyPlayId: string) => void;
  readOnly: boolean;
  recordedEnding?: EpisodeEnding;
  recordedNextUp?: EpisodeNextUp;
  /** 이어가는 회차. 새 대화는 아직 없다. */
  storyPlayId?: string;
  /** 이 화에서 이미 담아 둔 자리. 책갈피가 그 말풍선 곁으로 돌아온다. */
  savedExpressions?: readonly SavedExpressionRef[];
  savedResults?: readonly ExpressionResult[];
  situation: string;
  situationEmoji: string;
  /** 새 대화가 시작할 스토리. 이어가는 회차에는 필요 없다. */
  storyId?: string;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const { announce, toast } = useExpressionToast();
  const refreshNote = useExpressionNoteRefresh();
  /*
    담은 것과 도로 놓은 것이 표현 노트에도 닿아야 한다. 노트 탭은 앱이 열릴 때
    한 번 배치되고 그대로 붙어 있어서, 여기서 알리지 않으면 앱을 다시 켤 때까지
    낡은 목록을 보여 준다.
  */
  const changed = useCallback(
    (isSaved: boolean) => {
      announce(isSaved);
      refreshNote();
    },
    [announce, refreshNote]
  );
  const { chat, corrections, ending, nextUp, open, saved } =
    useEpisodeStoryPlay(
      accessToken,
      episodeId,
      initialMessages,
      readOnly,
      storyId,
      storyPlayId,
      onStoryPlayStarted,
      recordedEnding,
      recordedNextUp,
      savedResults,
      savedExpressions,
      changed
    );
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(chat, drafts, accessToken);
  const { openAsk } = useEpisodeAsks();
  const inputRef = useRef<TextInput>(null);
  // 첫 장면을 받지 못했다면 다시 받을 것은 답변이 아니라 에피소드의 시작이다.
  // 되받을 답변이 없어 그냥 돌아서는 다시 시도는 눌러도 아무 일이 없다.
  const retry = useCallback(() => {
    if (conversation.messages.length === 0) {
      open();
      return;
    }

    conversation.retry();
  }, [conversation.messages.length, conversation.retry, open]);
  const { messages } = conversation;
  const askAboutCorrection = useCallback(
    (correction: EpisodeCorrection) => {
      const asked = messages.findIndex(
        (message) => message.id === correction.messageId
      );

      if (asked < 0) {
        return;
      }

      onOpenAsk(
        openAsk({
          correction,
          // 물어본 그 말까지의 대화. 시트가 열릴 때 고정되고 바뀌지 않는다.
          snapshot: messages.slice(0, asked + 1),
        })
      );
    },
    [messages, onOpenAsk, openAsk]
  );
  const correctionsView = useMemo(
    () => ({
      ask: askAboutCorrection,
      byMessageId: corrections.byMessageId,
      retry: corrections.retry,
      states: corrections.states,
    }),
    [
      askAboutCorrection,
      corrections.byMessageId,
      corrections.retry,
      corrections.states,
    ]
  );
  const conversationRun = useMemo(
    () => ({ ...conversation, retry }),
    [conversation, retry]
  );

  let closing: ReactNode;
  const isChecking = Object.values(corrections.states).some(
    (state) => state.status === "pending"
  );
  const celebrated = useRef(readOnly || recordedEnding !== undefined);
  const isReady = ending !== undefined && !isChecking;
  const animate = isReady && !celebrated.current;
  useEffect(() => {
    if (isReady) {
      celebrated.current = true;
    }
  }, [isReady]);
  const review = useCallback(() => onReview(nextUp), [nextUp, onReview]);

  if (ending !== undefined) {
    closing = isChecking ? (
      <StatusLine
        label={correctionLabels.checking}
        loading
        testID="episode-ending-checking"
      />
    ) : (
      <EpisodeClosing animate={animate} ending={ending} onReview={review} />
    );
  } else if (readOnly) {
    closing = null;
  }
  // 첫 장면은 사용자의 보내기 동작 없이 서버에서 먼저 온다. 빈 상태로
  // 배치된 LegendList를 한 번 다시 만들어야 첫 행의 높이와 위치를 잰다.
  const panelKey = conversationRun.messages.length === 0 ? "empty" : "started";
  // 이름표가 인물의 스토리 안 순서를 색으로 받는다. 이름으로 찾으므로 목록을
  // 지도로 한 번 바꿔 둔다.
  const castOrder = useMemo(
    () =>
      cast === undefined
        ? undefined
        : new Map(cast.map((person) => [person.name, person.position])),
    [cast]
  );

  return (
    <EpisodeCorrectionsProvider value={correctionsView}>
      <SavedExpressionsProvider value={saved}>
        <ChatPanel
          banner={
            <EpisodeSituationBanner emoji={situationEmoji} text={situation} />
          }
          /*
            회차가 생기기 전의 첫 장면에는 책갈피를 두지 않는다.

            회차는 사용자가 처음 말할 때 생기고, 그전의 첫 장면은 계정에 남지
            않는다. 담을 자리가 없는데 입구만 보여 주면 누르는 사람은 까닭을 알 수
            없는 실패를 만난다. 복사는 회차 없이도 되는 동작이라 그동안에도 혼자
            선다. 처음 말하는 순간 회차가 생기고 그 장면도 대화의 첫 줄로 남으므로,
            책갈피는 그때 복사 옆에 합류한다.
          */
          canSaveUtterances={storyPlayId !== undefined}
          cast={castOrder}
          chat={conversationRun}
          closing={closing}
          hasMessageActions={false}
          inputRef={inputRef}
          key={panelKey}
          messageAddon={EpisodeCorrectionNote}
          placeholder={episodeLabels.placeholder}
          toast={toast}
          utteranceAddon={UtteranceExpressionSlot}
        />
      </SavedExpressionsProvider>
    </EpisodeCorrectionsProvider>
  );
}
