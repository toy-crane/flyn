export interface NewConversationActionProps {
  onPress: () => void;
}

/**
 * 대화 기록 헤더의 `새 대화`, 헤더가 텍스트 액션을 스스로 그리지 못하는
 * 플랫폼용.
 *
 * iOS는 마운트하지 않는다. 그쪽은 `Stack.Toolbar.Button`이 같은 컨트롤을
 * 시스템 표현으로 그린다. Android의 툴바 버튼은 아이콘만 그려서 텍스트를 넘기면
 * 아무것도 나오지 않는다(2026-09-09 에뮬레이터에서 확인). 그래서 파일을 나눈다.
 * iOS 번들이 Compose 뷰를 싣지 않는 이유도 같다.
 *
 * 어느 플랫폼이 무엇으로 그리는지는
 * [모바일 스토리 탐색](../../../../../docs/decisions/mobile-story-browsing.md)이 정한다.
 */
export function NewConversationAction(_props: NewConversationActionProps) {
  return null;
}
