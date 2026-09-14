import { ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { NoteExpressionCard } from "@/features/note/ui/expression-card";
import { noteLabels } from "@/features/note/ui/note-labels";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";

/**
 * 계정에 담아 둔 표현을 한곳에서 보는 자리.
 *
 * 최근 담은 것이 위에 오는 한 목록이다. 스토리별 묶음도 검색도 필터도 없다.
 * 담긴 것이 쌓이면 무엇이 필요한지는 실제로 써 본 뒤에 정한다.
 *
 * 빈 화면과 실패 화면은 둘 다 본문 정중앙에 선다. 목록 하나가 화면의 전부라
 * 위쪽에 세울 내용이 없다.
 */
export function ExpressionNoteScreen({
  expressions,
  isLoading,
  isRetrying,
  onErase,
  onRetry,
}: {
  expressions: SavedExpression[] | undefined;
  isLoading: boolean;
  isRetrying: boolean;
  onErase: (id: string) => void;
  onRetry: () => void;
}) {
  const hasExpressions = expressions !== undefined && expressions.length > 0;

  if (!hasExpressions) {
    return (
      // 이 화면의 네이티브 헤더와 탭을 뺀 영역을 사용한다. 상위 Provider의
      // 안전 영역이나 JS 높이 측정으로 배치하면 첫 진입 때 위치가 달라진다.
      <SafeAreaProvider>
        <View className="flex-1 bg-background px-5">
          <SafeAreaView
            edges={["top", "bottom"]}
            style={{ flex: 1 }}
            testID="expression-note-status"
          >
            {expressions ? (
              <ScreenEmpty
                icon="bookmark"
                testID="expression-note-empty"
                title={noteLabels.emptyTitle}
              />
            ) : null}
            {expressions || isLoading ? null : (
              <ScreenUnavailable
                isCentered
                isRetrying={isRetrying}
                onRetry={onRetry}
                testID="expression-note-unavailable"
                title={noteLabels.unavailable}
              />
            )}
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-2.5 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="expression-note-scroll"
    >
      {expressions.map((expression) => (
        <NoteExpressionCard
          expression={expression}
          key={expression.id}
          onErase={onErase}
        />
      ))}
    </ScrollView>
  );
}
