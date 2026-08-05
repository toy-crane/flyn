import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LoadingIndicator } from "../../components/feedback/loading-indicator";
import { RNSymbol } from "../../components/symbols/rn-symbol";
import {
  canContinue,
  draftGoals,
  type EpisodeRoleTarget,
  type EpisodeScenario,
  episodeDraftReducer,
  episodeDraftSubtitle,
  episodeDraftTitle,
  initialEpisodeDraftState,
  needsGoals,
  needsRoles,
} from "../../lib/episode-draft";
import {
  useEpisodeDraft,
  useGoalGeneration,
  useRoleGeneration,
  useSaveEpisode,
  useScenarioCandidates,
} from "../../lib/use-episode-creation";
import { useUserId } from "../../lib/user-id";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

/**
 * 생성은 화면 하나다. ① 상황 → ② 역할 → ③ 목표로 큰 제목만 바뀌고, 이전
 * 스텝의 결정은 내비게이션이 나른다.
 *
 * renderer가 RN인 이유: 스크롤 본문·키보드에 붙는 입력·바닥에 상주하는 CTA가
 * 한 scroll 경계를 공유한다(docs/decisions/self-contained-native-ui-boundaries.md의
 * 채팅 표면과 같은 이유).
 */

const styles = StyleSheet.create({
  candidate: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  cta: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  ctaButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
  },
  fieldGap: {
    height: spacing.md,
  },
  goal: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  goalCard: {
    borderRadius: 16,
    gap: spacing.xs,
    padding: spacing.md,
  },
  goalCircle: {
    borderRadius: 9,
    borderWidth: 1.5,
    height: 18,
    width: 18,
  },
  goalText: {
    flex: 1,
  },
  headerTitles: {
    alignItems: "center",
  },
  input: {
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    marginHorizontal: spacing.xxs,
    minHeight: 28,
  },
  pending: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  regenerateButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  regenerateLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: spacing.xxs,
  },
  screen: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.xxs,
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: 2,
  },
});

function failed(message: string) {
  Alert.alert("지금은 만들지 못했어요", message);
}

function HeaderTitles({
  subtitle,
  title,
}: {
  subtitle: string | null;
  title: string;
}) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.headerTitles}>
      <Text
        numberOfLines={1}
        style={[typography.body, { color: colors.text, fontWeight: "600" }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          numberOfLines={1}
          style={[
            styles.subtitle,
            typography.caption,
            { color: colors.secondaryText },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function StepTitle({ children }: { children: string }) {
  const { colors, typography } = useTheme();

  return (
    <Text style={[styles.stepTitle, typography.title, { color: colors.text }]}>
      {children}
    </Text>
  );
}

function Pending({ label }: { label: string }) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.pending}>
      <LoadingIndicator accessibilityLabel={label} />
      <Text style={[typography.supporting, { color: colors.secondaryText }]}>
        {label}
      </Text>
    </View>
  );
}

function RegenerateLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const style = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.regenerateLink,
      { opacity: pressed ? 0.6 : 1 },
    ],
    []
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={style}
    >
      <RNSymbol color={colors.accent} symbol="regenerate" />
      <Text style={[typography.supporting, { color: colors.accent }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ScenarioCandidate({
  onSelect,
  scenario,
  selected,
}: {
  onSelect: (scenario: EpisodeScenario) => void;
  scenario: EpisodeScenario;
  selected: boolean;
}) {
  const { colors, typography } = useTheme();
  const handlePress = useCallback(() => {
    onSelect(scenario);
  }, [onSelect, scenario]);

  return (
    <Pressable
      accessibilityLabel={scenario.title}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={[
        styles.candidate,
        {
          backgroundColor: selected ? colors.inputFill : colors.surface,
          borderColor: selected ? colors.accent : "transparent",
        },
      ]}
    >
      <Text
        style={[
          typography.supporting,
          { color: colors.text, fontWeight: "600" },
        ]}
      >
        {scenario.title}
      </Text>
      <Text style={[typography.supporting, { color: colors.text }]}>
        {scenario.description}
      </Text>
    </Pressable>
  );
}

function RoleField({
  label,
  onChange,
  onRegenerate,
  pending,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  pending: boolean;
  value: string;
}) {
  const { colors, typography } = useTheme();

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={[typography.caption, { color: colors.secondaryText }]}>
          {label}
        </Text>
        {pending ? null : (
          <Pressable
            accessibilityLabel={`${label} 다시 만들기`}
            accessibilityRole="button"
            onPress={onRegenerate}
            style={styles.regenerateButton}
          >
            <RNSymbol color={colors.secondaryText} symbol="regenerate" />
          </Pressable>
        )}
      </View>
      {pending ? (
        <View style={[styles.input, { backgroundColor: colors.inputFill }]}>
          <LoadingIndicator
            accessibilityLabel={`${label} 만드는 중`}
            size="small"
          />
        </View>
      ) : (
        <TextInput
          accessibilityLabel={label}
          onChangeText={onChange}
          style={[
            styles.input,
            typography.supporting,
            { backgroundColor: colors.inputFill, color: colors.text },
          ]}
          value={value}
        />
      )}
    </View>
  );
}

/** 무엇을 만들고 있는지. 화면이 직접 들고 있어야 자리마다 다르게 보여준다. */
type PendingWork =
  | "goals"
  | "partner-role"
  | "roles"
  | "save"
  | "scenarios"
  | "user-role";

export default function NewEpisodeScreen() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const userId = useUserId();
  const [state, dispatch] = useReducer(
    episodeDraftReducer,
    initialEpisodeDraftState
  );
  // 들어오자마자 후보를 부르므로 처음부터 만드는 중이다.
  const [pending, setPending] = useState<PendingWork | null>("scenarios");
  const candidates = useScenarioCandidates();
  const draft = useEpisodeDraft();
  const goals = useGoalGeneration();
  const role = useRoleGeneration();
  const save = useSaveEpisode(userId);
  const requested = useRef(false);

  const loadScenarios = useCallback(
    (excluded: string[]) => {
      setPending("scenarios");
      candidates.mutate(excluded, {
        onError: (error: Error) => {
          setPending(null);
          failed(error.message);
        },
        onSuccess: (scenarios) => {
          setPending(null);
          dispatch({ scenarios, type: "scenarios-loaded" });
        },
      });
    },
    [candidates]
  );

  useEffect(() => {
    if (requested.current) {
      return;
    }

    requested.current = true;
    loadScenarios([]);
  }, [loadScenarios]);

  const showOtherScenarios = useCallback(() => {
    loadScenarios((state.scenarios ?? []).map((scenario) => scenario.title));
  }, [loadScenarios, state.scenarios]);

  const selectScenario = useCallback((scenario: EpisodeScenario) => {
    dispatch({ scenario, type: "scenario-selected" });
  }, []);

  const loadGoals = useCallback(() => {
    if (!(state.roles && state.scenario)) {
      return;
    }

    setPending("goals");
    goals.mutate(
      {
        excluded: state.goals?.sentences ?? [],
        roles: state.roles,
        scenario: state.scenario,
      },
      {
        onError: (error: Error) => {
          setPending(null);
          failed(error.message);
        },
        onSuccess: (next) => {
          setPending(null);
          dispatch({ goals: next, type: "goals-loaded" });
        },
      }
    );
  }, [goals, state.goals, state.roles, state.scenario]);

  const regenerateRole = useCallback(
    (target: EpisodeRoleTarget) => {
      if (!(state.roles && state.scenario)) {
        return;
      }

      setPending(target === "partner" ? "partner-role" : "user-role");
      role.mutate(
        { roles: state.roles, scenario: state.scenario, target },
        {
          onError: (error: Error) => {
            setPending(null);
            failed(error.message);
          },
          onSuccess: (next) => {
            setPending(null);
            dispatch({ role: next, target, type: "role-changed" });
          },
        }
      );
    },
    [role, state.roles, state.scenario]
  );

  const regeneratePartnerRole = useCallback(
    () => regenerateRole("partner"),
    [regenerateRole]
  );
  const regenerateUserRole = useCallback(
    () => regenerateRole("user"),
    [regenerateRole]
  );

  const editPartnerRole = useCallback((value: string) => {
    dispatch({ role: value, target: "partner", type: "role-changed" });
  }, []);

  const editUserRole = useCallback((value: string) => {
    dispatch({ role: value, target: "user", type: "role-changed" });
  }, []);

  /**
   * 스텝은 화면이 아니라 한 화면 안의 질문이다. 그래서 헤더의 뒤로 가기는
   * 스택을 벗기기 전에 이전 질문으로 먼저 돌아간다.
   */
  const goBack = useCallback(() => {
    if (state.step === "goals") {
      dispatch({ step: "roles", type: "step-changed" });
      return;
    }

    if (state.step === "roles") {
      dispatch({ step: "scenario", type: "step-changed" });
      return;
    }

    router.back();
  }, [router, state.step]);

  const startEpisode = useCallback(() => {
    const sentences = draftGoals(state);

    if (!(sentences && state.roles && state.scenario)) {
      return;
    }

    setPending("save");
    save.mutate(
      { goals: sentences, roles: state.roles, scenario: state.scenario },
      {
        onError: (error: Error) => {
          setPending(null);
          Alert.alert("에피소드를 만들지 못했어요", error.message);
        },
        // 대화 화면은 아직 없다. 홈으로 돌아가면 새 에피소드가 카드에 오른다.
        onSuccess: () => router.back(),
      }
    );
  }, [router, save, state]);

  const advance = useCallback(() => {
    if (state.step === "scenario") {
      dispatch({ step: "roles", type: "step-changed" });

      if (needsRoles(state) && state.scenario) {
        setPending("roles");
        draft.mutate(state.scenario, {
          onError: (error: Error) => {
            setPending(null);
            dispatch({ step: "scenario", type: "step-changed" });
            failed(error.message);
          },
          onSuccess: (next) => {
            setPending(null);
            dispatch({ draft: next, type: "draft-loaded" });
          },
        });
      }

      return;
    }

    if (state.step === "roles") {
      dispatch({ step: "goals", type: "step-changed" });

      if (needsGoals(state)) {
        loadGoals();
      }

      return;
    }

    startEpisode();
  }, [draft, loadGoals, startEpisode, state]);

  const rolesPending = pending === "roles";
  const sentences = draftGoals(state);
  const disabled = pending !== null || !canContinue(state);

  let ctaLabel = "다음";
  if (state.step === "goals") {
    ctaLabel = "이 상황으로 시작";
  }
  if (rolesPending) {
    ctaLabel = "역할을 만들고 있어요";
  }
  if (pending === "goals") {
    ctaLabel = "목표를 만들고 있어요";
  }
  if (pending === "save") {
    ctaLabel = "에피소드를 만들고 있어요";
  }

  return (
    <>
      <Stack.Title asChild>
        <HeaderTitles
          subtitle={episodeDraftSubtitle(state)}
          title={episodeDraftTitle(state)}
        />
      </Stack.Title>
      {state.step === "scenario" ? null : (
        <>
          <Stack.Screen.BackButton hidden />
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button
              accessibilityLabel="이전 질문"
              icon="chevron.backward"
              onPress={goBack}
            />
          </Stack.Toolbar>
        </>
      )}

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="interactive"
        >
          {state.step === "scenario" ? (
            <>
              <StepTitle>이런 상황 어때요?</StepTitle>
              {pending === "scenarios" ? (
                <Pending label="상황 만드는 중" />
              ) : (
                <>
                  {(state.scenarios ?? []).map((scenario) => (
                    <ScenarioCandidate
                      key={scenario.title}
                      onSelect={selectScenario}
                      scenario={scenario}
                      selected={state.scenario?.title === scenario.title}
                    />
                  ))}
                  <RegenerateLink
                    label="다른 상황 보기"
                    onPress={showOtherScenarios}
                  />
                </>
              )}
            </>
          ) : null}

          {state.step === "roles" ? (
            <>
              <StepTitle>이런 역할 어때요?</StepTitle>
              <RoleField
                label="상대"
                onChange={editPartnerRole}
                onRegenerate={regeneratePartnerRole}
                pending={rolesPending || pending === "partner-role"}
                value={state.roles?.partnerRole ?? ""}
              />
              <View style={styles.fieldGap} />
              <RoleField
                label="내 역할"
                onChange={editUserRole}
                onRegenerate={regenerateUserRole}
                pending={rolesPending || pending === "user-role"}
                value={state.roles?.userRole ?? ""}
              />
            </>
          ) : null}

          {state.step === "goals" ? (
            <>
              <StepTitle>이번 대화의 목표예요</StepTitle>
              {sentences ? (
                <>
                  <View
                    style={[
                      styles.goalCard,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    {sentences.map((sentence) => (
                      <View key={sentence} style={styles.goal}>
                        <View
                          style={[
                            styles.goalCircle,
                            { borderColor: colors.border },
                          ]}
                        />
                        <Text
                          style={[
                            styles.goalText,
                            typography.supporting,
                            { color: colors.text },
                          ]}
                        >
                          {sentence}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <RegenerateLink label="다른 목표 보기" onPress={loadGoals} />
                </>
              ) : (
                <Pending label="목표 만드는 중" />
              )}
            </>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.cta,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.separator,
            },
          ]}
        >
          <Pressable
            accessibilityLabel={ctaLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={advance}
            style={[
              styles.ctaButton,
              { backgroundColor: disabled ? colors.disabled : colors.primary },
            ]}
          >
            <Text
              style={[
                typography.action,
                { color: disabled ? colors.disabledText : colors.onPrimary },
              ]}
            >
              {ctaLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
