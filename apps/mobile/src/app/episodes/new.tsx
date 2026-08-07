import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import {
  Button,
  Card,
  Input,
  Label,
  LinkButton,
  PressableFeedback,
  Separator,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { HeaderTitles } from "../../components/navigation/header-titles";
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

/**
 * 생성은 화면 하나다. ① 상황 → ② 역할 → ③ 목표로 큰 제목만 바뀌고, 이전
 * 스텝의 결정은 내비게이션이 나른다.
 *
 * 본문은 HeroUI가 그리는 브랜드 층이다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표). 스크롤
 * 본문·키보드에 붙는 입력·바닥에 상주하는 CTA가 한 scroll 경계를 공유하므로
 * 시스템 폼이 아니라 RN 표면이다.
 */

function failed(message: string) {
  Alert.alert("지금은 만들지 못했어요", message);
}

/** 스텝마다 바뀌는 큰 제목. 한 화면 안에서 지금 무엇을 묻는지 말한다. */
function StepTitle({ children }: { children: string }) {
  return (
    <Typography.Heading className="mx-1 mt-2 mb-4" type="h4">
      {children}
    </Typography.Heading>
  );
}

/**
 * 만들어지는 동안 자리를 지키는 수동형 진행. 누를 것이 없으므로 중립 회색이다
 * (docs/decisions/apple-hig-with-app-theme.md).
 */
function Pending({ label }: { label: string }) {
  const neutral = useThemeColor("muted");

  return (
    <View className="items-center gap-3 py-8">
      <Spinner accessibilityLabel={label} color={neutral} />
      <Typography color="muted" type="body-sm">
        {label}
      </Typography>
    </View>
  );
}

/** 같은 자리를 다시 만들어 채우는 action. 목록·목표 아래에 한 줄로 선다. */
function RegenerateLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const accent = useThemeColor("accent");

  return (
    // 손가락이 닿을 44pt를 세로로 확보한다 — LinkButton은 높이·padding을 스스로
    // 0으로 두므로 min-height로만 늘린다.
    <LinkButton
      accessibilityLabel={label}
      className="min-h-11 self-start"
      onPress={onPress}
      size="sm"
    >
      {/* 브랜드 층의 아이콘은 Ionicons를 의미 토큰으로 칠한다
          (docs/decisions/apple-hig-with-app-theme.md). */}
      <Ionicons color={accent} name="refresh" size={16} />
      <LinkButton.Label className="text-accent">{label}</LinkButton.Label>
    </LinkButton>
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
  const handlePress = useCallback(() => {
    onSelect(scenario);
  }, [onSelect, scenario]);

  return (
    <PressableFeedback
      accessibilityLabel={scenario.title}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="mb-3"
      onPress={handlePress}
    >
      {/* 고른 후보는 accent 외곽선과 한 단계 다른 surface로 말한다 — 색과
          모양만으로 나르지 않도록 accessibilityState의 selected를 함께 둔다.
          배경은 유틸리티로 덮지 않고 라이브러리의 variant로 바꾼다. */}
      <Card
        className={
          selected ? "border-2 border-accent" : "border-2 border-transparent"
        }
        variant={selected ? "secondary" : "default"}
      >
        <Card.Body className="gap-1">
          <Typography type="body-sm" weight="semibold">
            {scenario.title}
          </Typography>
          <Typography type="body-sm">{scenario.description}</Typography>
        </Card.Body>
      </Card>
    </PressableFeedback>
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
  // 보조 아이콘과 수동형 progress는 둘 다 약한 전경이다
  // (docs/decisions/apple-hig-with-app-theme.md).
  const muted = useThemeColor("muted");

  return (
    <TextField>
      {/* 다시 만들기는 라벨 오른쪽에 붙는다 — 입력 안에 넣으면 값 편집과
          경쟁한다. */}
      <View className="min-h-7 flex-row items-center justify-between">
        <Label>{label}</Label>
        {pending ? null : (
          <PressableFeedback
            accessibilityLabel={`${label} 다시 만들기`}
            accessibilityRole="button"
            className="size-7 items-center justify-center"
            onPress={onRegenerate}
          >
            <Ionicons color={muted} name="refresh" size={16} />
          </PressableFeedback>
        )}
      </View>
      {/* 만드는 동안에도 입력이 서던 자리를 그대로 지킨다 — 값이 도착할 때
          레이아웃이 튀지 않는다. */}
      {pending ? (
        <View className="min-h-12 justify-center rounded-field bg-field px-3">
          <Spinner
            accessibilityLabel={`${label} 만드는 중`}
            color={muted}
            size="sm"
          />
        </View>
      ) : (
        <Input
          accessibilityLabel={label}
          onChangeText={onChange}
          value={value}
        />
      )}
    </TextField>
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
  const accentForeground = useThemeColor("accent-foreground");

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
  /*
   * CTA 안의 progress는 CTA를 눌러서 시작된 일에만 붙는다 — 후보 조회나 역할
   * 재생성은 본문이 이미 자기 자리에서 말하고 있고, 여기까지 돌면 화면에 진행
   * 표시가 둘이 된다. 문구가 바뀌는 세 상태와 정확히 같은 집합이다.
   */
  const ctaPending = rolesPending || pending === "goals" || pending === "save";

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

      <View className="flex-1 bg-background">
        <ScrollView
          contentContainerClassName="p-4 pb-8"
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
            <View className="gap-4">
              <StepTitle>이런 역할 어때요?</StepTitle>
              <RoleField
                label="상대"
                onChange={editPartnerRole}
                onRegenerate={regeneratePartnerRole}
                pending={rolesPending || pending === "partner-role"}
                value={state.roles?.partnerRole ?? ""}
              />
              <RoleField
                label="내 역할"
                onChange={editUserRole}
                onRegenerate={regenerateUserRole}
                pending={rolesPending || pending === "user-role"}
                value={state.roles?.userRole ?? ""}
              />
            </View>
          ) : null}

          {state.step === "goals" ? (
            <>
              <StepTitle>이번 대화의 목표예요</StepTitle>
              {sentences ? (
                <>
                  <Card className="mb-3">
                    <Card.Body className="gap-2">
                      {sentences.map((sentence) => (
                        <View
                          className="flex-row items-center gap-2"
                          key={sentence}
                        >
                          {/* 아직 아무것도 달성하지 않은 상태다 — 빈 원만 둔다. */}
                          <View className="size-[18px] rounded-full border-[1.5px] border-border" />
                          <Typography className="flex-1" type="body-sm">
                            {sentence}
                          </Typography>
                        </View>
                      ))}
                    </Card.Body>
                  </Card>
                  <RegenerateLink label="다른 목표 보기" onPress={loadGoals} />
                </>
              ) : (
                <Pending label="목표 만드는 중" />
              )}
            </>
          ) : null}
        </ScrollView>

        {/* 전진 CTA는 스크롤 밖 바닥에 상주한다. 버튼 안 progress는 그 action의
            전경색을 따른다(docs/decisions/apple-hig-with-app-theme.md). */}
        <Separator />
        <View className="px-4 pt-2 pb-6">
          <Button
            className="w-full"
            isDisabled={disabled}
            onPress={advance}
            size="lg"
          >
            {ctaPending ? <Spinner color={accentForeground} size="sm" /> : null}
            <Button.Label>{ctaLabel}</Button.Label>
          </Button>
        </View>
      </View>
    </>
  );
}
