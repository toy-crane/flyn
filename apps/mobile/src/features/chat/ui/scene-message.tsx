import { Text, View } from "react-native";
import type { TextContextMenuItem } from "react-native-enriched-markdown";

import { MarkdownAnswer } from "./markdown-answer";
import { MessageActions } from "./message-actions";
import type { SceneSegment } from "./scene";

/**
 * 한 장면: 인물별 말풍선과 지문이 도착한 순서대로 쌓인다.
 *
 * 스파이크: 다시 받기와 복사는 장면 전체에 걸린다. 발화 하나 단위의 동작은
 * 아직 없다. 조각은 스트리밍 중에 뒤로만 늘어나므로 자리 번호가 그대로
 * 열쇠가 된다.
 */
export function SceneMessage({
  areActionsDisabled,
  hasActions,
  onCopy,
  onRegenerate,
  segments,
  selectionMenuItems,
}: {
  areActionsDisabled: boolean;
  hasActions: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  segments: SceneSegment[];
  selectionMenuItems?: TextContextMenuItem[];
}) {
  return (
    <View className="w-full gap-2">
      {segments.map((segment, index) =>
        segment.name === null ? (
          <Text
            className="px-1 text-muted text-sm leading-5"
            // biome-ignore lint/suspicious/noArrayIndexKey: 조각은 뒤로만 늘어난다
            key={index}
            testID="chat-scene-narration"
          >
            {segment.text}
          </Text>
        ) : (
          <View
            className="max-w-[85%] self-start"
            // biome-ignore lint/suspicious/noArrayIndexKey: 조각은 뒤로만 늘어난다
            key={index}
            testID="chat-scene-utterance"
          >
            <Text className="mb-1 px-1 text-muted text-xs">{segment.name}</Text>
            <View className="rounded-2xl bg-surface px-4 py-3">
              <MarkdownAnswer
                contextMenuItems={selectionMenuItems}
                markdown={segment.text}
              />
            </View>
          </View>
        )
      )}
      {hasActions ? (
        <MessageActions
          isDisabled={areActionsDisabled}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
        />
      ) : null}
    </View>
  );
}
