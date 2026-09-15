import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { NoteExpressionCard } from "@/features/note/ui/expression-card";
import { noteLabels } from "@/features/note/ui/note-labels";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";

const NO_MISSING: ReadonlySet<string> = new Set();

/**
 * 계정에 담아 둔 표현을 한곳에서 보는 자리.
 *
 * 최근 담은 것이 위에 오는 한 목록이다. 스토리별 묶음도 검색도 필터도 없다.
 * 담긴 것이 쌓이면 무엇이 필요한지는 실제로 써 본 뒤에 정한다.
 *
 * 빈 화면과 실패 화면은 둘 다 본문 정중앙에 선다. 목록 하나가 화면의 전부라
 * 위쪽에 세울 내용이 없다.
 *
 * 카드에서 그 표현을 두고 AI에게 묻거나 그 표현이 나온 대화로 간다. 어디로
 * 가는지는 경로가 정하고, 이 화면은 어느 표현인지만 넘긴다.
 */
export function ExpressionNoteScreen({
  expressions,
  isLoading,
  isRetrying,
  missingConversationIds = NO_MISSING,
  onAsk,
  onErase,
  onOpenConversation,
  onRetry,
  openingConversationId,
  toast,
}: {
  expressions: SavedExpression[] | undefined;
  isLoading: boolean;
  isRetrying: boolean;
  /**
   * 이동하려다 대화를 찾지 못한 표현. 서버가 아직 원본을 가리키더라도 이 화면에
   * 머무는 동안은 그 카드의 `대화에서 보기`를 세우지 않는다.
   */
  missingConversationIds?: ReadonlySet<string>;
  onAsk: (expression: SavedExpression) => void;
  onErase: (id: string) => void;
  onOpenConversation: (expression: SavedExpression) => void;
  onRetry: () => void;
  /** 대화가 아직 있는지 확인하고 있는 표현. */
  openingConversationId?: string;
  /** 헤더 바로 밑에서 잠깐 떴다 사라지는 문구. 경로가 만들어 넘긴다. */
  toast?: ReactNode;
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
    // 목록을 다른 뷰로 감싸지 않는다. iOS 네이티브 헤더는 화면의 첫 스크롤 뷰를
    // 따라 큰 제목을 접는데, 감싸면 그 스크롤 뷰를 찾지 못해 큰 제목이 목록 위에
    // 그대로 남는다. 토스트 자리는 목록 뒤의 형제로 둔다.
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-2.5 px-5 pt-5 pb-12"
        contentInsetAdjustmentBehavior="automatic"
        testID="expression-note-scroll"
      >
        {expressions.map((expression) => (
          <NoteExpressionCard
            expression={expression}
            isOpeningConversation={openingConversationId === expression.id}
            key={expression.id}
            onAsk={onAsk}
            onErase={onErase}
            onOpenConversation={
              expression.conversation === null ||
              missingConversationIds.has(expression.id)
                ? undefined
                : onOpenConversation
            }
          />
        ))}
      </ScrollView>
      {/*
        토스트가 사는 자리. 이 화면의 네이티브 헤더 바로 밑이다. 헤더는 목록 위에
        겹쳐 그려지고 큰 제목이 접히며 높이가 바뀌므로, 값을 재지 않고 헤더를 뺀
        안전 영역에 맡긴다. 알약은 목록을 밀지 않고 손가락도 받지 않는다.
      */}
      {toast === undefined ? null : (
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          testID="expression-note-toast"
        >
          <SafeAreaProvider>
            <SafeAreaView
              edges={["top"]}
              pointerEvents="none"
              style={{ flex: 1 }}
            >
              <View pointerEvents="none" style={{ flex: 1 }}>
                {toast}
              </View>
            </SafeAreaView>
          </SafeAreaProvider>
        </View>
      )}
    </>
  );
}
