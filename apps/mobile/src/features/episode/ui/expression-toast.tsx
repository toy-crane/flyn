import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { Toast, useToast } from "heroui-native/toast";
import { useCallback } from "react";

import { Icon } from "@/shared/ui/icon";
import { savedExpressionLabels } from "./episode-labels";

/** 읽고 사라지기에 충분한 시간. 대화를 오래 가리지 않는다. */
const TOAST_MS = 2500;
/**
 * 담기와 취소가 같은 한 자리를 나눠 쓴다.
 *
 * 토스트는 같은 id로 다시 띄우면 앞의 것을 갈아치운다. 연달아 담고 취소해도
 * 문구 하나만 서 있고, 서 있던 시간을 새로 센다. 대화 위에 같은 줄이 여러 개
 * 쌓이면 방금 무엇을 했는지가 오히려 흐려진다.
 */
const TOAST_ID = "saved-expression";

/**
 * 담고 도로 놓을 때마다 문구를 잠시 띄우고 가벼운 햅틱을 함께 준다.
 *
 * 결과가 다른 탭에 생겨 그 자리에서는 보이지 않으므로 알린다. 누를 동작은 두지
 * 않는다. 표현 노트로 보내면 대화 흐름이 끊기고, 되돌리기는 방금 누른 책갈피를
 * 다시 누르는 것과 역할이 겹친다.
 *
 * 글자 폭에 맞춘 알약 하나로 서고 방금 누른 책갈피와 같은 아이콘을 단다. 전폭
 * 카드에 짧은 한 줄만 담으면 빈자리가 대화를 그만큼 더 가린다.
 */
export function useExpressionToast() {
  const { toast } = useToast();

  return useCallback(
    /** 담았으면 참, 도로 놓았으면 거짓. 두 문구가 같은 자리에 뜬다. */
    (isSaved: boolean) => {
      // 햅틱을 지원하지 않는 기기에서도 문구는 그대로 뜬다.
      impactAsync(ImpactFeedbackStyle.Light).catch(() => undefined);
      toast.show({
        component: (props) => (
          <Toast
            {...props}
            accessibilityLiveRegion="polite"
            className="flex-row items-center gap-2 self-center rounded-full px-4 py-2.5"
            testID="expression-toast"
          >
            <Icon
              filled={isSaved}
              name="bookmark"
              size="sm"
              tone={isSaved ? "accent" : "muted"}
            />
            <Toast.Title className="font-normal text-base leading-5">
              {isSaved
                ? savedExpressionLabels.saved
                : savedExpressionLabels.unsaved}
            </Toast.Title>
          </Toast>
        ),
        duration: TOAST_MS,
        id: TOAST_ID,
      });
    },
    [toast]
  );
}
