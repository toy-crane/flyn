import { useCallback, useState } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { EpisodeGoal } from "../../lib/episodes";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";
import { RNSymbol } from "../symbols/rn-symbol";

/** 이만큼 남았을 때부터 접힌 바에도 턴이 나타난다. 나타난 것 자체가 신호다. */
const TURNS_LEFT_THRESHOLD = 5;

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
  },
  dock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  goalLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 32,
  },
  goalText: {
    flex: 1,
  },
  now: {
    flex: 1,
  },
  openHead: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
    paddingBottom: spacing.xs,
  },
  pip: {
    alignItems: "center",
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
});

type GoalState = "done" | "now" | "todo";

function goalState(goal: EpisodeGoal, currentPosition: number): GoalState {
  if (goal.achieved_at !== null) {
    return "done";
  }

  return goal.position === currentPosition ? "now" : "todo";
}

/** 완료는 초록 체크, 현재는 파란 링, 남은 것은 회색 원. */
function GoalPip({ state }: { state: GoalState }) {
  const { colors } = useTheme();

  if (state === "done") {
    return (
      <View
        style={[styles.pip, { backgroundColor: colors.success }]}
        testID="goal-pip-done"
      >
        <RNSymbol color={colors.onAccent} symbol="achieved" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.pip,
        state === "now"
          ? { borderColor: colors.accent, borderWidth: 2 }
          : { borderColor: colors.border, borderWidth: 1.5 },
      ]}
      testID={state === "now" ? "goal-pip-now" : "goal-pip-todo"}
    />
  );
}

function GoalLine({ goal, state }: { goal: EpisodeGoal; state: GoalState }) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.goalLine}>
      <GoalPip state={state} />
      <Text
        style={[
          styles.goalText,
          typography.supporting,
          {
            color: state === "now" ? colors.text : colors.secondaryText,
            fontWeight: state === "now" ? "600" : "400",
          },
        ]}
      >
        {goal.sentence}
      </Text>
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
  currentPosition: number;
  goals: EpisodeGoal[];
  turnLimit: number;
  usedTurns: number;
}) {
  const { colors, typography } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);
  const dockStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.dock,
      {
        backgroundColor: colors.surface,
        borderTopColor: colors.separator,
        opacity: pressed ? 0.7 : 1,
      },
    ],
    [colors.separator, colors.surface]
  );
  const currentGoal =
    goals.find((goal) => goal.position === currentPosition) ?? goals[0];
  const turnsLeft = Math.max(turnLimit - usedTurns, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={toggle}
      style={dockStyle}
      testID="goal-dock"
    >
      {expanded ? (
        <>
          <View
            style={[styles.openHead, { borderBottomColor: colors.separator }]}
          >
            <Text
              style={[typography.caption, { color: colors.secondaryText }]}
              testID="goal-dock-turns"
            >
              턴 {usedTurns}/{turnLimit}
            </Text>
            <RNSymbol color={colors.secondaryText} symbol="chevronDown" />
          </View>
          {goals.map((goal) => (
            <GoalLine
              goal={goal}
              key={goal.position}
              state={goalState(goal, currentPosition)}
            />
          ))}
        </>
      ) : (
        <View style={styles.bar}>
          <Text
            numberOfLines={1}
            style={[
              styles.now,
              typography.supporting,
              { color: colors.text, fontWeight: "600" },
            ]}
            testID="goal-dock-now"
          >
            {currentGoal?.sentence ?? ""}
          </Text>
          {/*
           * 남은 턴이 임계값 이하일 때만 나타난다. 나타났다는 사실이 신호이므로
           * 경고색 없이 보조 텍스트로 둔다.
           */}
          {turnsLeft <= TURNS_LEFT_THRESHOLD ? (
            <Text
              style={[typography.caption, { color: colors.secondaryText }]}
              testID="goal-dock-turns-left"
            >
              {turnsLeft}턴 남음
            </Text>
          ) : null}
          <RNSymbol color={colors.secondaryText} symbol="chevronUp" />
        </View>
      )}
    </Pressable>
  );
}
