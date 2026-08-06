import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  LinkButton,
  Separator,
  Typography,
  useThemeColor,
} from "heroui-native";
import { type ReactNode, useCallback } from "react";
import { ScrollView, View } from "react-native";
import {
  findFeedback,
  type MessageFeedback,
  messageMark,
} from "../../lib/message-feedback";
import { improvedSegments } from "../../lib/sentence-diff";
import { useStoredFeedback } from "../../lib/use-episodes";

/**
 * 표시를 눌러 여는 첨삭 시트. presentation·detent·grabber·모서리·뒷배경 dimming은
 * 라우트가 세우는 native sheet의 것이고(`app/_layout.tsx`) 본문만 HeroUI가 그린다
 * (docs/decisions/self-contained-native-ui-boundaries.md). 판정은 대화 화면이 이미
 * 읽어 둔 것만 본다.
 *
 * 본문은 다른 화면과 같은 중립 `background` 토큰을 깐다. 이 자리에 native가 주는
 * 불투명 표면이 없어서(iOS 26·react-native-screens formSheet는 본문 배경을 비워
 * 둔다) 깔지 않으면 뒤 화면이 그대로 비쳐 accent 위에 accent가 겹친다.
 */

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

/** 한 덩어리는 무엇인지 말하는 라벨과 그 내용으로 이루어진다. */
function Block({ children, label }: { children: ReactNode; label: string }) {
  return (
    <View>
      <Typography className="mb-1" color="muted" type="body-xs">
        {label}
      </Typography>
      {children}
    </View>
  );
}

function Sentence({ children }: { children: string }) {
  return <Typography type="body">{children}</Typography>;
}

/**
 * 개선 문장. 밑줄은 **이미 적용된 변경**을 뜻하므로 바뀐 자리에만 긋는다.
 * 말풍선 본문에는 넣지 않는다 — 교정 전 문장에 밑줄을 그으면 뜻이 반대가 된다.
 */
function ImprovedSentence({
  delivered,
  improved,
}: {
  delivered: string;
  improved: string;
}) {
  let offset = 0;
  const segments = improvedSegments(delivered, improved).map((segment) => {
    const key = `${offset}:${segment.text}`;

    offset += segment.text.length;

    return { ...segment, key };
  });

  return (
    <Typography testID="feedback-improved" type="body" weight="semibold">
      {segments.map((segment) =>
        segment.changed ? (
          <Typography
            className="underline decoration-accent"
            key={segment.key}
            testID="feedback-improved-edit"
            type="body"
            weight="semibold"
          >
            {segment.text}
          </Typography>
        ) : (
          segment.text
        )
      )}
    </Typography>
  );
}

/** 항목별 이유. 번역 시트에서는 같은 자리가 표현 노트가 된다. */
function Reasons({ reasons }: { reasons: string[] }) {
  return (
    <View className="gap-2" testID="feedback-reasons">
      {reasons.map((reason) => (
        <Typography key={reason} type="body-sm">
          {reason}
        </Typography>
      ))}
    </View>
  );
}

/**
 * 시트 하단의 `더 물어보기`. 여기서 열리는 문장 질문은 시트 위에 쌓이지 않고
 * 대화 위로 push되므로, 이 자리는 목적지를 여는 일만 한다.
 */
function AskMoreAction({ onPress }: { onPress: () => void }) {
  const accent = useThemeColor("accent");

  return (
    // 손가락이 닿을 44pt를 세로로 확보한다 — LinkButton은 높이·padding을 스스로
    // 0으로 두므로 min-height로만 늘린다.
    <LinkButton
      accessibilityLabel="더 물어보기"
      className="min-h-11 self-start"
      onPress={onPress}
      testID="feedback-ask-more"
    >
      {/* 브랜드 층의 아이콘은 Ionicons를 의미 토큰으로 칠한다
          (docs/decisions/apple-hig-with-app-theme.md). 말풍선이 "이 문장에 대해
          이야기한다"를 그대로 말한다. */}
      <Ionicons color={accent} name="chatbubble-outline" size={17} />
      <LinkButton.Label className="text-accent">더 물어보기</LinkButton.Label>
    </LinkButton>
  );
}

/**
 * 첨삭 시트 본문. 번역이든 교정이든 **같은 시트**이며 내용만 다르다. 이미
 * 저장된 판정만 읽으므로 열 때 아무것도 다시 부르지 않는다.
 */
function FeedbackSheet({
  feedback,
  onAskMore,
}: {
  feedback: MessageFeedback;
  onAskMore: () => void;
}) {
  // 원문이 있을 때만 한글 블록이 선다. `messageMark`가 번역 표시를 고르는 조건과
  // 같은 값을 본다 — 표시와 시트가 어긋날 수 없다.
  const sourceText =
    messageMark(feedback) === "translated" ? feedback.sourceText : null;
  /**
   * 첨삭은 **학습자가 영어로 직접 쓴 문장에만** 붙는다. 번역된 문장은 학습자가
   * 쓴 것이 아니라 "더 자연스럽게 쓸 수 있다"는 말이 성립하지 않고, 판정도
   * 그런 문장에는 개선문을 남기지 않는다. 그 자리는 `reasons`가 표현 노트로
   * 채운다.
   */
  const alternative =
    feedback.improvedSentence === null ? null : (
      <Block label="이렇게 쓰면 더 자연스러워요">
        <ImprovedSentence
          delivered={feedback.delivered}
          improved={feedback.improvedSentence}
        />
      </Block>
    );

  return (
    <ScrollView
      className="flex-1 bg-background"
      // grabber가 시트 맨 위에 서므로 첫 줄이 그 아래에서 시작한다.
      contentContainerClassName="gap-4 px-5 pt-5 pb-6"
      testID="feedback-sheet"
    >
      {sourceText === null ? (
        alternative
      ) : (
        <>
          <Block label="내가 쓴 한글">
            <Sentence>{sourceText}</Sentence>
          </Block>
          <Separator />
          <Block label="이렇게 전달됐어요">
            <Sentence>{feedback.delivered}</Sentence>
          </Block>
        </>
      )}
      {feedback.reasons.length > 0 ? (
        <>
          <Separator />
          <Reasons reasons={feedback.reasons} />
        </>
      ) : null}
      <Separator />
      <AskMoreAction onPress={onAskMore} />
    </ScrollView>
  );
}

export default function FeedbackSheetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    episodeId?: string | string[];
    messageId?: string | string[];
  }>();
  const episodeId = single(params.episodeId);
  const messageId = single(params.messageId);
  const feedback = useStoredFeedback(episodeId);
  const judged = findFeedback(feedback ?? [], messageId);
  /**
   * `더 물어보기`는 시트 위에 시트를 쌓지 않는다. 시트를 닫고 그 아래 대화
   * 화면 위로 문장 질문을 push해, 뒤로 가면 시트가 아니라 대화로 돌아온다.
   */
  const askMore = useCallback(() => {
    router.back();
    router.push({
      params: { episodeId, messageId },
      pathname: "/episodes/question",
    });
  }, [episodeId, messageId, router]);

  if (!judged) {
    return (
      <View className="flex-1 justify-center bg-background px-5">
        <Typography.Paragraph color="muted">
          대화 화면에서 다시 열어 주세요.
        </Typography.Paragraph>
      </View>
    );
  }

  return <FeedbackSheet feedback={judged} onAskMore={askMore} />;
}
