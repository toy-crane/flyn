import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Spinner, Typography, useThemeColor } from "heroui-native";
import { type ReactNode, useCallback } from "react";
import { View } from "react-native";
import { ChatConversation } from "../../components/chat/chat-conversation";
import { ChatMarkdown } from "../../components/chat/chat-markdown";
import { QuotedSentenceCard } from "../../components/episode/quoted-sentence-card";
import { HeaderTitles } from "../../components/navigation/header-titles";
import { questionedSentence } from "../../lib/episodes";
import type { SentenceQuestionMessage } from "../../lib/sentence-question";
import { useSentenceQuestion as useStoredSentenceQuestion } from "../../lib/sentence-question";
import { useEpisode, useEpisodeMessages } from "../../lib/use-episodes";
import { useSentenceQuestion } from "../../lib/use-sentence-question";

const INTRO =
  "무엇이든 물어보세요. 왜 이렇게 고치면 좋은지, 다른 표현은 없는지, 비슷한 상황에서 어떻게 말하는지 다 좋아요.";

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

/** 화면이 설 수 없거나 아직 아무것도 없을 때 쓰는 한 프레임. */
function CenteredState({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      {children}
    </View>
  );
}

/**
 * 무엇을 물어봐도 되는 자리인지 한 번 말해 준다. 오간 말이 아니라 안내라
 * 저장되지 않고 목록 머리에 서서 지난 내용 위에 남는다.
 */
function QuestionIntro() {
  return (
    <View className="pb-3" testID="sentence-question-intro">
      <ChatMarkdown>{INTRO}</ChatMarkdown>
    </View>
  );
}

function SentenceQuestionSession({
  episodeId,
  messageId,
  sentence,
  storedMessages,
}: {
  episodeId: string;
  messageId: string;
  sentence: string;
  storedMessages: SentenceQuestionMessage[];
}) {
  const { chat } = useSentenceQuestion(episodeId, messageId, storedMessages);

  return (
    <View className="flex-1 bg-background">
      {/* 인용 카드는 목록 바깥에 서서 스크롤해도 대상 문장을 놓치지 않는다. */}
      <QuotedSentenceCard sentence={sentence} />
      <ChatConversation
        chat={chat}
        listHeader={<QuestionIntro />}
        // 여기는 롤플레잉이 아니라 학습 질문을 주고받는 자리라 한국어도 앞길이다.
        placeholder="영어나 한국어로 써 보세요"
      />
    </View>
  );
}

/**
 * 문장 하나를 두고 묻는 화면. 첨삭 시트의 `더 물어보기`가 유일한 진입점이고,
 * 시트 위에 쌓이지 않고 대화 화면 위로 push된다. 헤더 서브타이틀이 원래
 * 에피소드 이름을 나르므로 어느 문장을 어디서 물고 왔는지 잃지 않는다.
 */
export default function SentenceQuestionScreen() {
  const params = useLocalSearchParams<{
    episodeId?: string | string[];
    messageId?: string | string[];
  }>();
  const router = useRouter();
  const episodeId = single(params.episodeId);
  const messageId = single(params.messageId);
  const episode = useEpisode(episodeId);
  const messages = useEpisodeMessages(episodeId);
  const question = useStoredSentenceQuestion(episodeId, messageId);
  const sentence = questionedSentence(messages.data ?? [], messageId);
  // 스스로 나타나는 수동형 진행이라 중립 회색이다
  // (docs/decisions/apple-hig-with-app-theme.md).
  const neutral = useThemeColor("muted");

  const retry = useCallback(() => {
    messages.refetch();
    question.refetch();
  }, [messages, question]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  let content: ReactNode;
  if (
    (messages.isPending && messages.data === undefined) ||
    (question.isPending && question.data === undefined)
  ) {
    content = (
      <CenteredState>
        <Spinner accessibilityLabel="지난 내용 불러오는 중" color={neutral} />
      </CenteredState>
    );
  } else if (
    (messages.isError && messages.data === undefined) ||
    (question.isError && question.data === undefined)
  ) {
    content = (
      <CenteredState>
        <Typography.Paragraph align="center">
          지난 내용을 불러오지 못했어요.
        </Typography.Paragraph>
        <Button onPress={retry}>
          <Button.Label>다시 시도</Button.Label>
        </Button>
      </CenteredState>
    );
  } else if (sentence) {
    content = (
      <SentenceQuestionSession
        episodeId={episodeId}
        messageId={messageId}
        sentence={sentence}
        storedMessages={question.data ?? []}
      />
    );
  } else {
    content = (
      <CenteredState>
        <Typography.Paragraph align="center">
          문장을 찾을 수 없어요.
        </Typography.Paragraph>
        <Button onPress={goBack}>
          <Button.Label>대화로 돌아가기</Button.Label>
        </Button>
      </CenteredState>
    );
  }

  return (
    <>
      <Stack.Title asChild>
        <HeaderTitles
          subtitle={episode.data?.scenario_title ?? null}
          title="문장 이야기"
        />
      </Stack.Title>
      {content}
    </>
  );
}
