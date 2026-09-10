import { type ComponentType, memo, type ReactNode } from "react";
import { Text, useWindowDimensions, View } from "react-native";

import { MarkdownAnswer } from "./markdown-answer";
import { MessageActions } from "./message-actions";
import type { SceneSegment } from "./scene";

/**
 * 인물 말풍선 하나를 감싸 곁에 무엇을 더 놓는 자리.
 *
 * 무엇이 붙는지 채팅은 알지 못한다. 말풍선을 그려 넘겨줄 뿐이고, 그 옆과 아래에
 * 무엇을 두는지는 이 자리를 채우는 쪽이 정한다.
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

const SceneSegmentBody = memo(function SceneSegmentBodyContent({
  at,
  isArriving,
  messageId,
  name,
  text,
  UtteranceSlot,
}: SceneSegment & {
  at: number;
  isArriving: boolean;
  messageId: string;
  UtteranceSlot: UtteranceAddon | undefined;
}) {
  const { fontScale } = useWindowDimensions();
  if (name === null) {
    return (
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
      <Text className="mb-1 px-1 text-muted text-xs" key={fontScale}>
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
 * 스파이크: 다시 받기와 복사는 장면 전체에 걸린다. 발화 하나 단위의 동작은
 * 아직 없다. 조각은 스트리밍 중에 뒤로만 늘어나므로 자리 번호가 그대로
 * 열쇠가 된다.
 *
 * 말풍선 곁에 무엇을 매다는 자리는 인물의 대사만 받는다. 지문은 세지 않으므로
 * 넘기는 번호도 대사끼리의 순서다.
 */
export function SceneMessage({
  areActionsDisabled,
  areActionsVisible = true,
  hasActions,
  isArriving = false,
  messageId,
  onCopy,
  onRegenerate,
  segments,
  utteranceAddon,
}: {
  areActionsDisabled: boolean;
  areActionsVisible?: boolean;
  hasActions: boolean;
  /** 이 장면이 아직 흐르는 중이다. 마지막 답변에만 참이 된다. */
  isArriving?: boolean;
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
            isArriving={isArriving}
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
