import { useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { dayKey } from "@/features/streak/ui/calendar-days";

function readToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 기기의 오늘. 화면에 돌아올 때마다 다시 읽고, 그때 기록도 새로 읽게 한다.
 *
 * 홈은 탭이라 앱이 열릴 때 한 번 배치되고 그대로 붙어 있다. 자정을 넘기거나 대화에서
 * 화를 끝내고 돌아와도 스스로 다시 그리지 않으므로, 화면에 다시 들어오는 순간과
 * 앱이 앞으로 나오는 순간에 오늘을 다시 읽고 `onReturn`을 부른다. 처음 들어올
 * 때는 쿼리가 이미 읽고 있으므로 부르지 않는다.
 */
export function useDeviceToday(onReturn: () => void) {
  const [today, setToday] = useState(readToday);
  const isFocused = useIsFocused();
  const focused = useRef(isFocused);
  focused.current = isFocused;
  const hasEntered = useRef(false);

  const refresh = useCallback(() => {
    const next = readToday();
    // 같은 날이면 그대로 두어 날짜로 만든 쿼리 키와 칸이 바뀌지 않게 한다.
    setToday((current) => (dayKey(current) === dayKey(next) ? current : next));
    onReturn();
  }, [onReturn]);

  useFocusEffect(
    useCallback(() => {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: 첫 포커스가 이 ref를 바꾼다
      if (!hasEntered.current) {
        hasEntered.current = true;
        return;
      }
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && focused.current) {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  return { isFocused, today };
}
