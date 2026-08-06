import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Card,
  ListGroup,
  PressableFeedback,
  Separator,
  Spinner,
  Typography,
  useThemeColor,
} from "heroui-native";
import { Fragment, type ReactNode, useCallback } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageMarkView } from "../../components/chat/message-mark";
import {
  type GoalResult,
  goalResults,
  type ReviewedUtterance,
  resultHeadline,
  reviewedUtterances,
} from "../../lib/episode-result";
import { type Episode, orderedGoals } from "../../lib/episodes";
import { useSaveEpisode } from "../../lib/use-episode-creation";
import { useRefillJudgment } from "../../lib/use-episode-judgment";
import {
  useEpisode,
  useEpisodeFeedback,
  useEpisodeMessages,
} from "../../lib/use-episodes";
import { useUserId } from "../../lib/user-id";

/**
 * 결과 화면은 HeroUI가 그리는 브랜드 층이다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표). 헤더의 뒤로
 * 가기와 `다시 하기`는 계속 셸이 소유한다.
 */

/** 총평을 만들지 못한 채 끝난 에피소드. 없는 것을 있는 척하지 않는다. */
const MISSING_SUMMARY = "이번 글쓰기 총평은 만들지 못했어요.";

/** safe area가 없는 기기에서도 바닥 action이 화면 끝에 붙지 않게 두는 최소 여백. */
const MIN_BOTTOM_INSET = 20;

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

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography className="mx-1 mb-2" color="muted" type="body-xs">
      {children}
    </Typography>
  );
}

/** 달성은 체크, 미달성은 빈 원이다. X 표시는 어디에도 쓰지 않는다. */
function GoalResultLine({ goal }: { goal: GoalResult }) {
  const onSuccess = useThemeColor("success-foreground");

  return (
    <View className="flex-row items-center gap-2.5">
      {goal.achieved ? (
        <View
          className="size-5 items-center justify-center rounded-full bg-success"
          testID={`goal-result-done-${goal.position}`}
        >
          {/* 브랜드 층의 아이콘은 Ionicons를 의미 토큰으로 칠한다
              (docs/decisions/apple-hig-with-app-theme.md). 줄이 읽는 것은 목표
              문장뿐이고 달성 여부는 색과 모양으로만 말한다 — 매핑되지 않은
              글리프가 정지점을 만들지 않게 체크는 트리에서 숨긴다. */}
          <Ionicons
            accessibilityElementsHidden
            color={onSuccess}
            name="checkmark"
            size={12}
          />
        </View>
      ) : (
        <View
          className="size-5 rounded-full border-[1.5px] border-border"
          testID={`goal-result-missed-${goal.position}`}
        />
      )}
      <Typography
        className="flex-1"
        color={goal.achieved ? "default" : "muted"}
        type="body-sm"
      >
        {goal.sentence}
      </Typography>
    </View>
  );
}

/**
 * 문장 한 줄. 표시와 시트는 대화 화면의 것을 그대로 쓴다 — 같은 컴포넌트,
 * 같은 라우트다. 표시가 없는 줄만 `다시 확인`으로 드러난다.
 */
function UtteranceRow({
  onOpenFeedback,
  onRefill,
  refilling,
  utterance,
}: {
  onOpenFeedback: (messageId: string) => void;
  onRefill: () => void;
  refilling: boolean;
  utterance: ReviewedUtterance;
}) {
  /*
   * 셰브론은 보조 정보라 약한 전경을 쓰고, `다시 확인` 안의 progress는 그
   * action의 전경색을 따른다(docs/specs/neutral-loading-indicators/spec.md).
   */
  const [accent, muted] = useThemeColor(["accent", "muted"]);
  const openable =
    utterance.mark === "improvable" || utterance.mark === "translated";
  const open = useCallback(() => {
    onOpenFeedback(utterance.id);
  }, [onOpenFeedback, utterance.id]);
  const body = (
    <>
      <View testID={`utterance-mark-${utterance.id}`}>
        {utterance.mark ? (
          <MessageMarkView
            mark={utterance.mark}
            onPress={openable ? open : undefined}
          />
        ) : null}
      </View>
      <Typography className="flex-1" type="body-sm">
        {utterance.text}
      </Typography>
      {openable ? (
        // 줄 전체가 이미 접근성 이름을 가지므로 셰브론은 트리에서 숨긴다.
        <Ionicons
          accessibilityElementsHidden
          color={muted}
          name="chevron-forward"
          size={16}
        />
      ) : null}
      {utterance.mark ? null : (
        <PressableFeedback
          accessibilityLabel="다시 확인"
          accessibilityRole="button"
          className="min-h-11 min-w-15 items-center justify-center"
          isDisabled={refilling}
          onPress={onRefill}
          testID={`utterance-refill-${utterance.id}`}
        >
          {refilling ? (
            <Spinner accessible={false} color={accent} size="sm" />
          ) : (
            <Typography
              className="text-accent"
              type="body-sm"
              weight="semibold"
            >
              다시 확인
            </Typography>
          )}
        </PressableFeedback>
      )}
    </>
  );

  if (!openable) {
    /*
     * 누를 것이 없는 줄이다. `accessible`을 끄지 않으면 밑단 Pressable이 자식을
     * 한 덩어리로 묶어, 그 안의 `다시 확인` 버튼이 스크린 리더에서 사라진다.
     */
    return (
      <ListGroup.Item accessible={false} className="gap-2 px-4 py-2">
        {body}
      </ListGroup.Item>
    );
  }

  /*
   * 누름 피드백은 라이브러리가 소유한다(docs/decisions/native-motion.md) —
   * ListGroup 문서가 정한 대로 `PressableFeedback`이 press를 받고 행은
   * `disabled`로 넘긴다. 접근성 이름과 role도 누르는 쪽이 갖는다.
   */
  return (
    <PressableFeedback
      accessibilityLabel={utterance.text}
      accessibilityRole="button"
      onPress={open}
    >
      <ListGroup.Item className="gap-2 px-4 py-2" disabled>
        {body}
      </ListGroup.Item>
    </PressableFeedback>
  );
}

function EpisodeResult({ episode }: { episode: Episode }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useUserId();
  const messages = useEpisodeMessages(episode.id);
  const feedback = useEpisodeFeedback(episode.id);
  const refill = useRefillJudgment(episode.id);
  const restart = useSaveEpisode(userId);
  const utterances = reviewedUtterances(
    messages.data ?? [],
    feedback.data ?? []
  );

  const openFeedback = useCallback(
    (messageId: string) => {
      router.push({
        params: { episodeId: episode.id, messageId },
        pathname: "/episodes/feedback",
      });
    },
    [episode.id, router]
  );
  const refillJudgment = useCallback(() => {
    refill.mutate(undefined, {
      onError: () => {
        Alert.alert("판정을 받지 못했어요", "잠시 후 다시 시도해 주세요.");
      },
    });
  }, [refill]);
  const openConversation = useCallback(() => {
    router.push(`/episodes/${episode.id}`);
  }, [episode.id, router]);
  const createEpisode = useCallback(() => {
    router.push("/episodes/new");
  }, [router]);
  /**
   * `다시 하기`는 같은 시나리오·역할·목표로 새 에피소드를 시작한다. 끝난
   * 에피소드는 그대로 남아 결과를 언제든 다시 볼 수 있다.
   */
  const retryEpisode = useCallback(() => {
    restart.mutate(
      {
        goals: orderedGoals(episode).map((goal) => goal.sentence),
        roles: {
          partnerRole: episode.partner_role,
          userRole: episode.user_role,
        },
        scenario: {
          description: episode.scenario_description,
          title: episode.scenario_title,
        },
      },
      {
        onError: () => {
          Alert.alert("다시 시작하지 못했어요", "잠시 후 다시 시도해 주세요.");
        },
        onSuccess: ({ id }) => {
          router.replace(`/episodes/${id}`);
        },
      }
    );
  }, [episode, restart, router]);

  return (
    <>
      {/* 헤더는 뒤로 가기와 `다시 하기`만 갖는다. 시나리오 제목은 본문 첫 줄이다. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="다시 하기"
          disabled={restart.isPending}
          onPress={retryEpisode}
        >
          다시 하기
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <View className="flex-1 bg-background">
        <ScrollView contentContainerClassName="p-4">
          <Typography
            className="mx-1 mt-2 mb-0.5"
            color="muted"
            testID="result-episode-name"
            type="body-sm"
          >
            {episode.scenario_title}
          </Typography>
          <Typography.Heading
            className="mx-1 mb-5"
            testID="result-headline"
            type="h4"
          >
            {resultHeadline(episode)}
          </Typography.Heading>

          <SectionTitle>이번 대화의 목표</SectionTitle>
          <Card className="mb-6">
            <Card.Body className="gap-2">
              {goalResults(episode).map((goal) => (
                <GoalResultLine goal={goal} key={goal.position} />
              ))}
            </Card.Body>
          </Card>

          <SectionTitle>이번 글쓰기</SectionTitle>
          <Card className="mb-6">
            <Card.Body>
              <Typography
                color={episode.summary ? "default" : "muted"}
                testID="result-summary"
                type="body-sm"
              >
                {episode.summary ?? MISSING_SUMMARY}
              </Typography>
            </Card.Body>
          </Card>

          <SectionTitle>{`내가 쓴 문장 ${utterances.length}개`}</SectionTitle>
          <ListGroup className="mb-6" testID="result-utterances">
            {utterances.map((utterance, index) => (
              <Fragment key={utterance.id}>
                {index > 0 ? <Separator className="mx-4" /> : null}
                <UtteranceRow
                  onOpenFeedback={openFeedback}
                  onRefill={refillJudgment}
                  refilling={refill.isPending}
                  utterance={utterance}
                />
              </Fragment>
            ))}
          </ListGroup>
        </ScrollView>

        {/* 하단은 결과와 무관하게 같다. */}
        <Separator />
        <View
          className="gap-2 px-4 pt-2"
          // safe area는 런타임 값이라 토큰으로 접을 수 없는 자리다.
          style={{ paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET) }}
        >
          <Button className="w-full" onPress={createEpisode} size="lg">
            <Button.Label>새 에피소드 시작</Button.Label>
          </Button>
          <Button
            className="w-full"
            onPress={openConversation}
            size="lg"
            variant="ghost"
          >
            <Button.Label className="text-accent">대화 보기</Button.Label>
          </Button>
        </View>
      </View>
    </>
  );
}

/**
 * 끝난 에피소드의 결과. 대화 화면의 `결과 보기`와 홈 목록의 끝난 행이 여기로
 * 온다. 총평은 종료 시점에 저장된 것을 읽기만 하고 다시 만들지 않는다.
 */
export default function EpisodeResultScreen() {
  const params = useLocalSearchParams<{ episodeId?: string | string[] }>();
  const router = useRouter();
  const episodeId = single(params.episodeId);
  const episode = useEpisode(episodeId);
  // 스스로 나타나는 수동형 진행이라 중립 회색이다
  // (docs/specs/neutral-loading-indicators/spec.md).
  const neutral = useThemeColor("muted");

  const retry = useCallback(() => {
    episode.refetch();
  }, [episode]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  if (episode.isPending && episode.data === undefined) {
    return (
      <CenteredState>
        <Spinner accessibilityLabel="결과 불러오는 중" color={neutral} />
      </CenteredState>
    );
  }

  if (episode.isError && episode.data === undefined) {
    return (
      <CenteredState>
        <Typography.Paragraph align="center">
          결과를 불러오지 못했어요.
        </Typography.Paragraph>
        <Button onPress={retry}>
          <Button.Label>다시 시도</Button.Label>
        </Button>
      </CenteredState>
    );
  }

  if (!episode.data) {
    return (
      <CenteredState>
        <Typography.Paragraph align="center">
          에피소드를 찾을 수 없어요.
        </Typography.Paragraph>
        <Button onPress={goBack}>
          <Button.Label>에피소드 목록으로</Button.Label>
        </Button>
      </CenteredState>
    );
  }

  return <EpisodeResult episode={episode.data} />;
}
