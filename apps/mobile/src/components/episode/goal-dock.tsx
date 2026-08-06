import Ionicons from "@expo/vector-icons/Ionicons";
import {
  PressableFeedback,
  Separator,
  Typography,
  useThemeColor,
} from "heroui-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import type { EpisodeGoal } from "../../lib/episodes";

/** 이만큼 남았을 때부터 접힌 바에도 턴이 나타난다. 나타난 것 자체가 신호다. */
const TURNS_LEFT_THRESHOLD = 5;

/** 셋을 다 이룬 뒤 접힌 바가 대신 말하는 것. 종료는 곧 화면이 알린다. */
const ALL_GOALS_DONE = "목표를 모두 달성했어요";

type GoalState = "done" | "now" | "todo";

function goalState(
  goal: EpisodeGoal,
  currentPosition: number | null
): GoalState {
  if (goal.achieved_at !== null) {
    return "done";
  }

  return goal.position === currentPosition ? "now" : "todo";
}

/** 완료는 초록 체크, 현재는 accent 링, 남은 것은 회색 원. */
function GoalPip({ state }: { state: GoalState }) {
  const onSuccess = useThemeColor("success-foreground");

  if (state === "done") {
    return (
      <View
        className="size-4.5 items-center justify-center rounded-full bg-success"
        testID="goal-pip-done"
      >
        {/* 줄이 읽는 것은 목표 문장뿐이고 달성 여부는 색과 모양으로만 말한다 —
            매핑되지 않은 글리프가 정지점을 만들지 않게 숨긴다
            (docs/decisions/apple-hig-with-app-theme.md). */}
        <Ionicons
          accessibilityElementsHidden
          color={onSuccess}
          name="checkmark"
          size={10}
        />
      </View>
    );
  }

  if (state === "now") {
    return (
      <View
        className="size-4.5 rounded-full border-2 border-accent"
        testID="goal-pip-now"
      />
    );
  }

  return (
    <View
      className="size-4.5 rounded-full border-[1.5px] border-border"
      testID="goal-pip-todo"
    />
  );
}

function GoalLine({ goal, state }: { goal: EpisodeGoal; state: GoalState }) {
  return (
    <View className="min-h-8 flex-row items-center gap-2">
      <GoalPip state={state} />
      <Typography
        className="flex-1"
        color={state === "now" ? "default" : "muted"}
        type="body-sm"
        weight={state === "now" ? "semibold" : "normal"}
      >
        {goal.sentence}
      </Typography>
    </View>
  );
}

/**
 * 목표 바는 composer 바로 위에 상주한다. 접히면 지금 할 목표 한 줄, 펼치면
 * 같은 자리에서 턴 진행과 목표 전체가 나온다. 헤더에 `목표` 버튼을 두지 않고
 * 여기에 항상 두는 이유는 목표가 탭 없이 보여야 하기 때문이다.
 *
 * 턴은 펼쳤을 때만 보인다 — 상시 노출하면 없는 압박을 만든다.
 */
export function GoalDock({
  currentPosition,
  goals,
  turnLimit,
  usedTurns,
}: {
  currentPosition: number | null;
  goals: EpisodeGoal[];
  turnLimit: number;
  usedTurns: number;
}) {
  const muted = useThemeColor("muted");
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);
  const currentGoal = goals.find((goal) => goal.position === currentPosition);
  const turnsLeft = Math.max(turnLimit - usedTurns, 0);

  return (
    <PressableFeedback
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={toggle}
      testID="goal-dock"
    >
      <Separator />
      <View className="bg-surface px-4 py-2">
        {expanded ? (
          <>
            <View className="min-h-9 flex-row items-center justify-between pb-2">
              <Typography color="muted" testID="goal-dock-turns" type="body-xs">
                턴 {usedTurns}/{turnLimit}
              </Typography>
              <Ionicons
                accessibilityElementsHidden
                color={muted}
                name="chevron-down"
                size={14}
              />
            </View>
            <Separator />
            <View className="pt-1">
              {goals.map((goal) => (
                <GoalLine
                  goal={goal}
                  key={goal.position}
                  state={goalState(goal, currentPosition)}
                />
              ))}
            </View>
          </>
        ) : (
          <View className="min-h-11 flex-row items-center gap-2">
            <Typography
              className="flex-1"
              numberOfLines={1}
              testID="goal-dock-now"
              type="body-sm"
              weight="semibold"
            >
              {currentGoal?.sentence ?? ALL_GOALS_DONE}
            </Typography>
            {/*
             * 남은 턴이 임계값 이하일 때만 나타난다. 나타났다는 사실이 신호이므로
             * 경고색 없이 보조 텍스트로 둔다.
             */}
            {turnsLeft <= TURNS_LEFT_THRESHOLD ? (
              <Typography
                color="muted"
                testID="goal-dock-turns-left"
                type="body-xs"
              >
                {turnsLeft}턴 남음
              </Typography>
            ) : null}
            <Ionicons
              accessibilityElementsHidden
              color={muted}
              name="chevron-up"
              size={14}
            />
          </View>
        )}
      </View>
    </PressableFeedback>
  );
}
