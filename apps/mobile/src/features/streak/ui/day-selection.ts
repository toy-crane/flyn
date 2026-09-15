import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** 한 번의 터치. 시작할 때 열려 있던 칸과, 그 터치로 칸을 눌렀는지를 기억한다. */
interface DayTouch {
  openedAtStart: string | null;
  pressedDay: boolean;
}

/**
 * 툴팁을 연 날짜 칸 하나.
 *
 * 같은 칸을 다시 누르거나 칸이 아닌 곳을 누르면 닫고, 다른 칸을 누르면 그
 * 칸으로 옮긴다. 한 번에 하나만 열린다.
 *
 * 칸이 아닌 곳의 누름은 화면 전체에 건 터치 시작과 끝으로 안다. 칸의 누름과
 * 화면의 터치 끝 중 무엇이 먼저 도착해도 같은 결과가 되도록, 칸은 터치가 시작될
 * 때 열려 있던 칸을 기준으로 여닫는다.
 *
 * 화면을 떠나면(`isActive`가 false) 닫는다. 돌아왔을 때 지난 툴팁이 떠 있지 않다.
 */
export function useDaySelection(isActive = true) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const current = useRef(selectedDay);
  current.current = selectedDay;
  const touch = useRef<DayTouch | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSelectedDay(null);
    }
  }, [isActive]);

  const selectDay = useCallback((day: string) => {
    const ongoing = touch.current;
    // 화면 읽기의 두 번 탭은 터치 없이 누름만 보낸다.
    // biome-ignore lint/suspicious/noUnnecessaryConditions: 터치 시작 이벤트가 이 ref를 채운다
    const opened = ongoing ? ongoing.openedAtStart : current.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: 터치 시작 이벤트가 이 ref를 채운다
    if (ongoing) {
      ongoing.pressedDay = true;
    }
    setSelectedDay(opened === day ? null : day);
  }, []);

  const clearDay = useCallback(() => setSelectedDay(null), []);

  const touchHandlers = useMemo(
    () => ({
      onTouchEnd: () => {
        const ended = touch.current;
        // biome-ignore lint/suspicious/noUnnecessaryConditions: 터치 시작 이벤트가 이 ref를 채운다
        if (ended && !ended.pressedDay) {
          setSelectedDay(null);
        }
        // 칸의 누름이 이 뒤에 도착해도 같은 터치로 보도록 다음 차례에 비운다.
        setTimeout(() => {
          if (touch.current === ended) {
            touch.current = null;
          }
        }, 0);
      },
      onTouchStart: () => {
        touch.current = { openedAtStart: current.current, pressedDay: false };
      },
    }),
    []
  );

  return { clearDay, selectDay, selectedDay, touchHandlers };
}
