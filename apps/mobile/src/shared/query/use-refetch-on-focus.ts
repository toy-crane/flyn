import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

/**
 * 화면으로 돌아올 때마다 서버에 다시 묻는다.
 *
 * 탭 화면은 한 번 열리면 앱이 살아 있는 동안 그대로 붙어 있어서, 다른 탭이나
 * 대화에서 바꾼 것이 다시 왔을 때 반영되지 않는다. 처음 여는 순간은 건너뛴다.
 * 그때는 쿼리가 이미 스스로 묻고 있다.
 */
export function useRefetchOnFocus(refetch: () => Promise<unknown>) {
  const hasOpened = useRef(false);
  const current = useRef(refetch);

  current.current = refetch;

  useFocusEffect(
    useCallback(() => {
      if (!hasOpened.current) {
        hasOpened.current = true;

        return;
      }

      current.current().catch(() => {
        // 실패는 쿼리가 들고 있고, 화면이 그것을 그대로 보여 준다.
      });
    }, [])
  );
}
