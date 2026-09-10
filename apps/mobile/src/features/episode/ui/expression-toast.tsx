import type { ReactNode } from "react";
import { useCallback } from "react";

import { Icon } from "@/shared/ui/icon";
import { useScreenToast } from "@/shared/ui/screen-toast";
import { savedExpressionLabels } from "./episode-labels";

/**
 * 담고 도로 놓을 때마다 문구를 잠시 띄우고 가벼운 햅틱을 함께 준다.
 *
 * 결과가 다른 탭에 생겨 그 자리에서는 보이지 않으므로 알린다. 누를 동작은 두지
 * 않는다. 표현 노트로 보내면 대화 흐름이 끊기고, 되돌리기는 방금 누른 책갈피를
 * 다시 누르는 것과 역할이 겹친다.
 *
 * 글자 폭에 맞춘 알약 하나로 서고 방금 누른 책갈피와 같은 아이콘을 단다. 전폭
 * 카드에 짧은 한 줄만 담으면 빈자리가 대화를 그만큼 더 가린다.
 *
 * 자리는 그 화면의 위쪽 띠 바로 밑이다. 대화에서는 상황 줄, 표현 돌아보기에서는
 * 헤더 밑이며, 화면이 `toast`를 그 자리에 놓는다.
 */
export function useExpressionToast(): {
  announce: (isSaved: boolean) => void;
  toast: ReactNode;
} {
  const { show, toast } = useScreenToast();

  const announce = useCallback(
    /** 담았으면 참, 도로 놓았으면 거짓. 두 문구가 같은 자리에 뜬다. */
    (isSaved: boolean) => {
      // 햅틱은 여기서 주지 않는다. 아이콘 줄이 누르는 순간에 이미 한 번 준다.
      // 둘 다 주면 책갈피 한 번에 두 번 울린다.
      show({
        icon: (
          <Icon
            filled={isSaved}
            name="bookmark"
            size="sm"
            tone={isSaved ? "accent" : "muted"}
          />
        ),
        text: isSaved
          ? savedExpressionLabels.saved
          : savedExpressionLabels.unsaved,
      });
    },
    [show]
  );

  return { announce, toast };
}
