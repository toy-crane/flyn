import { type ComponentType, memo, type ReactNode } from "react";
import { Text, useWindowDimensions, View } from "react-native";

import { MarkdownAnswer } from "./markdown-answer";
import { MessageActions } from "./message-actions";
import type { SceneSegment } from "./scene";

/**
 * 인물 말풍선 하나를 감싸 그 아래에 무엇을 더 놓는 자리.
 *
 * 무엇이 붙는지 채팅은 알지 못한다. 말풍선과 그 대사의 글을 넘겨줄 뿐이고,
 * 아래에 무엇을 두는지는 이 자리를 채우는 쪽이 정한다.
 */
export type UtteranceAddon = ComponentType<{
  at: number;
  children: ReactNode;
  /** 이 장면이 아직 도착하는 중인지. 붙는 것이 그동안 무엇을 할지 정한다. */
  isArriving: boolean;
  messageId: string;
  /** 이 대사 하나의 원문. 장면 전체가 아니라 말풍선에 보이는 그 글이다. */
  text: string;
}>;

/** 이름표 색. 인물의 스토리 안 순서를 받아 어느 화에서나 같은 색이 된다. */
const CAST_TONES = [
  "text-cast-1",
  "text-cast-2",
  "text-cast-3",
  "text-cast-4",
] as const;

function castTone(position: number | undefined): string {
  return CAST_TONES[((position ?? 1) - 1) % CAST_TONES.length] ?? CAST_TONES[0];
}

/**
 * 에피소드를 여는 장면 서술.
 *
 * 카드도 배경도 표식도 없이 글만 놓는다. 첫 줄은 장소와 시각이라 굵은 본문색,
 * 나머지는 한 단계 옅은 색이다. 그 굵기 차이와 앞뒤 여백만으로 대화가 시작하기
 * 전이라는 것이 읽히고, 아래 말풍선과는 배경 유무가 이미 가른다.
 *
 * 왼쪽 세로 줄을 세워 봤지만 실제 화면에서 인용문처럼 읽혀 뺐다. 글자 크기는
 * 말풍선과 같다. 가운데 정렬과 기울임은 쓰지 않는다. 여러 줄의 가운데 정렬은
 * 양쪽 가장자리가 들쭉날쭉해 읽기 어렵고, 한글에는 진짜 이탤릭이 없어 기울이면
 * 글자가 어긋난다.
 */
const SceneOpening = memo(function SceneOpeningContent({
  text,
}: {
  text: string;
}) {
  const { fontScale } = useWindowDimensions();
  const [lead, ...rest] = text.split("\n");

  return (
    <View
      className="mt-1 mb-3 max-w-[92%] gap-1 px-1"
      key={fontScale}
      testID="chat-scene-opening"
    >
      <Text className="font-semibold text-base text-foreground leading-6">
        {lead}
      </Text>
      {rest.map((line) => (
        <Text className="text-base text-scene leading-6" key={line}>
          {line}
        </Text>
      ))}
    </View>
  );
});

const SceneSegmentBody = memo(function SceneSegmentBodyContent({
  at,
  castPosition,
  isArriving,
  isOpening,
  messageId,
  name,
  text,
  UtteranceSlot,
}: SceneSegment & {
  at: number;
  castPosition: number | undefined;
  isArriving: boolean;
  isOpening: boolean;
  messageId: string;
  UtteranceSlot: UtteranceAddon | undefined;
}) {
  const { fontScale } = useWindowDimensions();
  if (name === null) {
    /*
      각본이 쓴 도입의 서술과, 모델이 형식을 어겨 보낸 이름 없는 줄은 다른
      것이다. 앞의 것만 장면 서술의 모양을 받는다. 뒤의 것은 지금까지의 작은
      회색 줄로 두어 내용을 잃지 않게 하고, 그 처리는 별도 결정으로 정한다.
    */
    return isOpening ? (
      <SceneOpening text={text} />
    ) : (
      <Text
        className="px-1 text-muted text-sm leading-5"
        key={fontScale}
        testID="chat-scene-narration"
      >
        {text}
      </Text>
    );
  }
  const bubble = (
    <View className="max-w-[85%] shrink rounded-2xl bg-surface px-4 py-3">
      <MarkdownAnswer markdown={text} />
    </View>
  );
  return (
    <View className="w-full items-start" testID="chat-scene-utterance">
      <Text
        className={`mb-1 px-1 font-semibold text-sm leading-4 ${castTone(castPosition)}`}
        key={fontScale}
      >
        {name}
      </Text>
      {UtteranceSlot ? (
        <UtteranceSlot
          at={at}
          isArriving={isArriving}
          messageId={messageId}
          text={text}
        >
          {bubble}
        </UtteranceSlot>
      ) : (
        bubble
      )}
    </View>
  );
});

/**
 * 한 장면: 인물별 말풍선과 지문이 도착한 순서대로 쌓인다.
 *
 * 이 자리의 다시 받기와 복사는 장면 전체에 걸린다. 대사 하나에 걸리는 동작은
 * 말풍선 아래 자리를 채우는 쪽이 따로 붙인다. 조각은 스트리밍 중에 뒤로만
 * 늘어나므로 자리 번호가 그대로 열쇠가 된다.
 *
 * 말풍선 아래에 무엇을 매다는 자리는 인물의 대사만 받는다. 지문은 세지 않으므로
 * 넘기는 번호도 대사끼리의 순서다.
 */
export function SceneMessage({
  areActionsDisabled,
  areActionsVisible = true,
  cast,
  hasActions,
  isArriving = false,
  isFirst = false,
  messageId,
  onCopy,
  onRegenerate,
  segments,
  utteranceAddon,
}: {
  areActionsDisabled: boolean;
  areActionsVisible?: boolean;
  /** 이 화에 서는 인물의 스토리 안 순서. 이름표 색이 여기서 나온다. */
  cast?: ReadonlyMap<string, number>;
  hasActions: boolean;
  /** 이 장면이 아직 흐르는 중이다. 마지막 답변에만 참이 된다. */
  isArriving?: boolean;
  /** 대화의 첫 메시지. 각본이 쓴 도입이라 장면 서술이 여기에만 있다. */
  isFirst?: boolean;
  messageId: string;
  onCopy: () => void;
  onRegenerate: () => void;
  segments: SceneSegment[];
  utteranceAddon?: UtteranceAddon;
}) {
  let spoken = -1;

  return (
    <View className="w-full gap-2">
      {segments.map((segment, index) => {
        if (segment.name !== null) {
          spoken += 1;
        }

        return (
          <SceneSegmentBody
            at={spoken}
            castPosition={
              segment.name === null ? undefined : cast?.get(segment.name)
            }
            isArriving={isArriving}
            /*
              장면 서술은 각본이 쓰고 한 화에 하나뿐이다. 첫 메시지에서 아직
              아무도 말하지 않은 동안의 이름 없는 줄만 그 자리다.
            */
            isOpening={isFirst && spoken < 0}
            // biome-ignore lint/suspicious/noArrayIndexKey: 조각은 뒤로만 늘어난다
            key={index}
            messageId={messageId}
            name={segment.name}
            text={segment.text}
            UtteranceSlot={utteranceAddon}
          />
        );
      })}
      {hasActions ? (
        <MessageActions
          isDisabled={areActionsDisabled}
          isVisible={areActionsVisible}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
        />
      ) : null}
    </View>
  );
}
