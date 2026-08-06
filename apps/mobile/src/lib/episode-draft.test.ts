import {
  canContinue,
  draftGoals,
  type EpisodeDraftState,
  episodeDraftReducer,
  episodeDraftSubtitle,
  episodeDraftTitle,
  initialEpisodeDraftState,
  needsGoals,
  needsRoles,
} from "./episode-draft";

const SCENARIOS = [
  { description: "설명 1", title: "포틀랜드 카페에서 첫 주문" },
  { description: "설명 2", title: "호스텔 체크인이 꼬였어요" },
  { description: "설명 3", title: "공항에서 짐이 안 나와요" },
];
const DRAFT = {
  goals: ["원두 추천 받기", "오트밀크로 바꾸기", "가볼 곳 물어보기"],
  partnerRole: "바리스타 Maya",
  userRole: "처음 방문한 여행객",
};

function withDraft(): EpisodeDraftState {
  const withScenarios = episodeDraftReducer(initialEpisodeDraftState, {
    scenarios: SCENARIOS,
    type: "scenarios-loaded",
  });
  const selected = episodeDraftReducer(withScenarios, {
    scenario: SCENARIOS[0],
    type: "scenario-selected",
  });

  return episodeDraftReducer(selected, { draft: DRAFT, type: "draft-loaded" });
}

describe("에피소드 생성 상태", () => {
  it("후보를 다시 받으면 3개가 통째로 바뀌고 고른 상황이 풀린다", () => {
    const next = episodeDraftReducer(withDraft(), {
      scenarios: [
        { description: "새 설명", title: "새 상황" },
        SCENARIOS[1],
        SCENARIOS[2],
      ],
      type: "scenarios-loaded",
    });

    expect(next.scenarios?.[0].title).toBe("새 상황");
    expect(next.scenario).toBeNull();
    expect(next.roles).toBeNull();
    expect(needsRoles(next)).toBe(true);
    expect(needsGoals(next)).toBe(true);
  });

  it("상황을 바꾸면 역할과 목표가 함께 다시 만들어져야 한다", () => {
    const next = episodeDraftReducer(withDraft(), {
      scenario: SCENARIOS[1],
      type: "scenario-selected",
    });

    expect(next.scenario?.title).toBe(SCENARIOS[1].title);
    expect(needsRoles(next)).toBe(true);
    expect(needsGoals(next)).toBe(true);
  });

  it("같은 상황을 다시 고르면 만들어 둔 역할과 목표를 그대로 둔다", () => {
    const state = withDraft();
    const next = episodeDraftReducer(state, {
      scenario: SCENARIOS[0],
      type: "scenario-selected",
    });

    expect(next).toBe(state);
    expect(needsRoles(next)).toBe(false);
    expect(needsGoals(next)).toBe(false);
  });

  it("역할을 바꾸면 목표만 다시 만들어져야 한다", () => {
    const next = episodeDraftReducer(withDraft(), {
      role: "사장 Ben",
      target: "partner",
      type: "role-changed",
    });

    expect(next.roles?.partnerRole).toBe("사장 Ben");
    expect(next.roles?.userRole).toBe(DRAFT.userRole);
    expect(needsRoles(next)).toBe(false);
    expect(needsGoals(next)).toBe(true);
    expect(draftGoals(next)).toBeNull();
  });

  it("역할을 되돌리면 만들어 둔 목표가 다시 유효하다", () => {
    const changed = episodeDraftReducer(withDraft(), {
      role: "사장 Ben",
      target: "partner",
      type: "role-changed",
    });
    const restored = episodeDraftReducer(changed, {
      role: DRAFT.partnerRole,
      target: "partner",
      type: "role-changed",
    });

    expect(needsGoals(restored)).toBe(false);
    expect(draftGoals(restored)).toEqual(DRAFT.goals);
  });

  it("목표를 다시 만들면 지금 역할의 목표가 된다", () => {
    const changed = episodeDraftReducer(withDraft(), {
      role: "사장 Ben",
      target: "partner",
      type: "role-changed",
    });
    const next = episodeDraftReducer(changed, {
      goals: ["새 목표 1", "새 목표 2", "새 목표 3"],
      type: "goals-loaded",
    });

    expect(needsGoals(next)).toBe(false);
    expect(draftGoals(next)).toEqual(["새 목표 1", "새 목표 2", "새 목표 3"]);
  });
});

describe("생성 화면의 진행과 헤더", () => {
  it("상황을 고르기 전에는 다음으로 갈 수 없다", () => {
    const state = episodeDraftReducer(initialEpisodeDraftState, {
      scenarios: SCENARIOS,
      type: "scenarios-loaded",
    });

    expect(canContinue(state)).toBe(false);
    expect(
      canContinue(
        episodeDraftReducer(state, {
          scenario: SCENARIOS[0],
          type: "scenario-selected",
        })
      )
    ).toBe(true);
  });

  it("역할이 비면 다음으로 갈 수 없다", () => {
    const roles = episodeDraftReducer(withDraft(), {
      step: "roles",
      type: "step-changed",
    });
    const emptied = episodeDraftReducer(roles, {
      role: "  ",
      target: "user",
      type: "role-changed",
    });

    expect(canContinue(roles)).toBe(true);
    expect(canContinue(emptied)).toBe(false);
  });

  it("목표가 낡았으면 시작할 수 없다", () => {
    const goalsStep = episodeDraftReducer(withDraft(), {
      step: "goals",
      type: "step-changed",
    });
    const stale = episodeDraftReducer(goalsStep, {
      role: "사장 Ben",
      target: "partner",
      type: "role-changed",
    });

    expect(canContinue(goalsStep)).toBe(true);
    expect(canContinue(stale)).toBe(false);
  });

  it("이전 스텝의 결정을 타이틀과 서브타이틀이 나른다", () => {
    const scenarioStep = withDraft();
    const rolesStep = episodeDraftReducer(scenarioStep, {
      step: "roles",
      type: "step-changed",
    });
    const goalsStep = episodeDraftReducer(rolesStep, {
      step: "goals",
      type: "step-changed",
    });

    expect(episodeDraftTitle(scenarioStep)).toBe("새 에피소드");
    expect(episodeDraftSubtitle(scenarioStep)).toBeNull();
    expect(episodeDraftTitle(rolesStep)).toBe(SCENARIOS[0].title);
    expect(episodeDraftSubtitle(rolesStep)).toBeNull();
    expect(episodeDraftTitle(goalsStep)).toBe(SCENARIOS[0].title);
    expect(episodeDraftSubtitle(goalsStep)).toBe(
      `${DRAFT.partnerRole} · ${DRAFT.userRole}`
    );
  });
});
