import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { cn } from "heroui-native/utils";
import { useCallback, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";

import type { SpokenDays } from "@/features/streak/api/learning-record";
import { dayKey } from "./calendar-days";
import { streakLabels } from "./streak-labels";

const DAYS_IN_WEEK = 7;
/** 칸 사이 간격. `gap-1.5`와 같은 값이다. */
const CELL_GAP = 6;
/** 툴팁이 칸 아래에서 떨어지는 거리. 꼬리가 이 틈에 선다. */
const TOOLTIP_OFFSET = 8;
/** 꼬리 한 변의 길이. 45도 돌린 정사각형이라 절반만 말풍선 위로 나온다. */
const TAIL_SIZE = 10;
/**
 * 날짜 숫자와 요일의 확대 상한.
 *
 * 한 줄에 7칸을 두는 격자라 칸의 크기가 화면 폭으로 정해진다. 가장 좁은 375pt
 * 화면의 칸은 약 38pt라서, 상한이 없으면 최대 시스템 글자 크기에서 숫자가 칸에
 * 잘린다. 1.5배면 `30`과 줄 높이가 그 칸에 들어간다. 같은 날짜와 횟수는 칸의
 * 접근성 이름과 툴팁이 상한 없이 전한다.
 */
const DAY_TEXT_MAX_SCALE = 1.5;

/**
 * 영어로 말한 횟수의 다섯 단계. 0번은 빈 칸이고 1–3, 4–7, 8–12, 13번 이상이
 * 차례로 진해진다. 임계값은 실제 한 화의 메시지 수를 본 뒤 다시 정한다.
 */
export function spokenLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) {
    return 0;
  }
  if (count <= 3) {
    return 1;
  }
  if (count <= 7) {
    return 2;
  }
  if (count <= 12) {
    return 3;
  }
  return 4;
}

const LEVEL_CLASS_NAME = {
  0: "bg-surface-secondary",
  1: "bg-spoken-1",
  2: "bg-spoken-2",
  3: "bg-spoken-3",
  4: "bg-spoken-4",
} as const;

function DayCell({
  count,
  date,
  isFuture,
  isSelected,
  isToday,
  onSelect,
}: {
  /** 그날 영어로 말한 횟수. 아직 읽는 중이면 undefined다. */
  count: number | undefined;
  date: Date;
  isFuture: boolean;
  isSelected: boolean;
  isToday: boolean;
  onSelect: (day: string) => void;
}) {
  const key = dayKey(date);
  let record: string | undefined;
  if (isFuture) {
    record = streakLabels.future;
  } else if (count !== undefined) {
    record = streakLabels.spoken(count);
  }
  const label = [
    streakLabels.dayLabel(date),
    ...(record ? [record] : []),
    ...(isToday ? [streakLabels.today] : []),
  ].join(", ");
  // 읽는 중인 날을 눌러 `기록 없음`을 보여 주면 틀린 말이 된다.
  const isDisabled = isFuture || count === undefined;
  // 오늘은 영어로 아직 말하지 않았을 때만 따로 표시한다. 말한 오늘은 색 칸만으로 충분하다.
  const isTodayEmpty = isToday && count === 0;
  const select = useCallback(() => onSelect(key), [key, onSelect]);
  let surfaceClassName: string = LEVEL_CLASS_NAME[spokenLevel(count ?? 0)];
  if (isFuture) {
    surfaceClassName = "border border-border bg-transparent";
  } else if (isTodayEmpty) {
    surfaceClassName = "bg-transparent";
  }

  return (
    // 고른 칸의 테두리는 칸 밖으로 나오므로 이웃 칸보다 위에 그린다.
    <View className={cn("aspect-square flex-1", isSelected && "z-10")}>
      {/*
        표시선은 칸보다 먼저 그려 칸 뒤에 둔다. 칸 위에 겹치면 Android가 가려진 칸
        버튼을 접근성 트리에서 뺀다. 오늘과 고른 상태는 칸의 이름과 상태가 읽으므로
        표시선은 화면 읽기에서 숨긴다.

        오늘의 점선은 칸 자리에 그린다. 비어 있는 오늘 칸은 면이 투명해서 뒤의 점선이
        보인다. 선택 테두리는 칸 바깥에 표면색 틈을 두고 그려 칸의 크기와 주변 배치를
        바꾸지 않는다.
      */}
      {isTodayEmpty ? (
        <View
          accessibilityElementsHidden
          className="absolute inset-0 rounded-xl border-[1.5px] border-muted border-dashed"
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          testID={`day-today-empty-${key}`}
        />
      ) : null}
      {isSelected ? (
        <View
          accessibilityElementsHidden
          className="absolute -inset-[3.5px] rounded-[15.5px] border-[1.5px] border-foreground"
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          testID={`day-selected-${key}`}
        />
      ) : null}
      <PressableFeedback
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected: isSelected }}
        className={cn(
          "flex-1 items-center justify-center rounded-xl",
          surfaceClassName
        )}
        isDisabled={isDisabled}
        onPress={select}
      >
        <Typography.Paragraph
          maxFontSizeMultiplier={DAY_TEXT_MAX_SCALE}
          type="body-sm"
          weight={isFuture ? "normal" : "medium"}
        >
          {date.getDate()}
        </Typography.Paragraph>
      </PressableFeedback>
    </View>
  );
}

/**
 * 고른 칸 아래에 잠시 뜨는 정확한 수.
 *
 * 좌우로는 칸들의 폭 안에 머물러 가장자리 칸에서는 안쪽으로 밀리고, 아래로는
 * 다음 줄이나 카드 아래를 덮는다. 배치를 밀어내지 않는다. 같은 내용을 칸의
 * 접근성 이름이 이미 읽으므로 화면 읽기에는 두 번 드러내지 않는다.
 */
function DayTooltip({
  centerX,
  gridWidth,
  text,
  top,
}: {
  centerX: number;
  gridWidth: number;
  text: string;
  top: number;
}) {
  const [width, setWidth] = useState<number>();
  const measure = useCallback(
    (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    []
  );
  const left =
    width === undefined
      ? 0
      : Math.max(0, Math.min(gridWidth - width, centerX - width / 2));

  return (
    <View
      accessibilityElementsHidden
      className="absolute z-20"
      importantForAccessibility="no-hide-descendants"
      onLayout={measure}
      pointerEvents="none"
      // 너비를 재기 전에는 자리를 모르므로 보이지 않게 둔다. 큰 글자에서 칸들의
      // 폭보다 길어지면 줄을 바꾼다.
      style={{
        left,
        maxWidth: gridWidth > 0 ? gridWidth : undefined,
        opacity: width === undefined ? 0 : 1,
        top,
      }}
      testID="day-tooltip"
    >
      <View
        className="absolute size-2.5 rotate-45 rounded-[2px] bg-foreground"
        style={{
          left: centerX - left - TAIL_SIZE / 2,
          top: -TAIL_SIZE / 2,
        }}
      />
      <View className="rounded-xl bg-foreground px-2.5 py-1.5">
        <Typography.Paragraph className="text-background" type="body-sm">
          {text}
        </Typography.Paragraph>
      </View>
    </View>
  );
}

/**
 * 월요일부터 시작하는 요일 줄과 날짜 칸.
 *
 * 이번 주 카드와 월 달력이 같은 칸을 쓴다. `days`의 null은 달의 첫날 앞에
 * 비워 두는 자리다. 아직 오지 않은 날은 테두리만 있는 빈 칸이고 누를 수 없다.
 */
export function DayGrid({
  days,
  onSelectDay,
  selectedDay,
  spokenDays,
  testID,
  today,
}: {
  days: (Date | null)[];
  onSelectDay: (day: string) => void;
  selectedDay: string | null;
  /** 아직 읽는 중이면 undefined다. 칸은 숫자만 두고 누를 수 없다. */
  spokenDays: SpokenDays | undefined;
  testID: string;
  today: Date;
}) {
  const todayKey = dayKey(today);
  const rows = Array.from(
    { length: Math.ceil(days.length / DAYS_IN_WEEK) },
    (_, row) => days.slice(row * DAYS_IN_WEEK, (row + 1) * DAYS_IN_WEEK)
  );
  const [gridWidth, setGridWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const measureGrid = useCallback(
    (event: LayoutChangeEvent) => setGridWidth(event.nativeEvent.layout.width),
    []
  );
  const measureHeader = useCallback(
    (event: LayoutChangeEvent) =>
      setHeaderHeight(event.nativeEvent.layout.height),
    []
  );

  // 칸은 폭을 7로 나눈 정사각형이라 줄과 칸의 자리를 폭에서 계산한다.
  const cellSize = (gridWidth - CELL_GAP * (DAYS_IN_WEEK - 1)) / DAYS_IN_WEEK;
  const selectedIndex = days.findIndex(
    (date) => date !== null && dayKey(date) === selectedDay
  );
  const selectedDate = days[selectedIndex];

  return (
    // 툴팁이 달력 아래의 합계 줄 위에 그려지도록 카드 안의 다음 요소보다 위에 둔다.
    <View className="z-10 gap-1.5" onLayout={measureGrid} testID={testID}>
      <View className="flex-row gap-1.5" onLayout={measureHeader}>
        {streakLabels.weekdays.map((weekday) => (
          <Typography.Paragraph
            align="center"
            className="flex-1"
            color="muted"
            key={weekday}
            maxFontSizeMultiplier={DAY_TEXT_MAX_SCALE}
            type="body-xs"
          >
            {weekday}
          </Typography.Paragraph>
        ))}
      </View>
      {rows.map((row) => (
        <View
          className="flex-row gap-1.5"
          key={row.find(Boolean)?.toISOString()}
        >
          {Array.from({ length: DAYS_IN_WEEK }, (_, column) => {
            const date = row[column];
            if (!date) {
              // biome-ignore lint/suspicious/noArrayIndexKey: 빈자리는 위치 말고는 구분할 것이 없다.
              return <View className="aspect-square flex-1" key={column} />;
            }
            const key = dayKey(date);
            return (
              <DayCell
                count={spokenDays ? (spokenDays[key] ?? 0) : undefined}
                date={date}
                isFuture={key > todayKey}
                isSelected={key === selectedDay}
                isToday={key === todayKey}
                key={key}
                onSelect={onSelectDay}
              />
            );
          })}
        </View>
      ))}
      {selectedDate && spokenDays ? (
        <DayTooltip
          centerX={
            (selectedIndex % DAYS_IN_WEEK) * (cellSize + CELL_GAP) +
            cellSize / 2
          }
          gridWidth={gridWidth}
          key={selectedDay}
          text={streakLabels.spoken(spokenDays[dayKey(selectedDate)] ?? 0)}
          top={
            headerHeight +
            CELL_GAP +
            Math.floor(selectedIndex / DAYS_IN_WEEK) * (cellSize + CELL_GAP) +
            cellSize +
            TOOLTIP_OFFSET
          }
        />
      ) : null}
    </View>
  );
}
