/**
 * 에피소드 생성 3스텝의 순수 상태. 화면은 한 개고 큰 제목만 바뀌므로, 어느
 * 질문에 와 있고 무엇이 다시 만들어져야 하는지는 이 파일이 혼자 정한다.
 */

export interface EpisodeScenario {
  description: string;
  title: string;
}

export interface EpisodeRoles {
  partnerRole: string;
  userRole: string;
}

export type EpisodeRoleTarget = "partner" | "user";
export type EpisodeStep = "goals" | "roles" | "scenario";

export interface EpisodeDraftState {
  /** 목표는 만들어질 당시의 역할을 함께 들고 있다 — 역할이 바뀌면 낡는다. */
  goals: { roles: EpisodeRoles; sentences: string[] } | null;
  roles: EpisodeRoles | null;
  scenario: EpisodeScenario | null;
  scenarios: EpisodeScenario[] | null;
  step: EpisodeStep;
}

export type EpisodeDraftAction =
  | { draft: EpisodeRoles & { goals: string[] }; type: "draft-loaded" }
  | { goals: string[]; type: "goals-loaded" }
  | { role: string; target: EpisodeRoleTarget; type: "role-changed" }
  | { scenario: EpisodeScenario; type: "scenario-selected" }
  | { scenarios: EpisodeScenario[]; type: "scenarios-loaded" }
  | { step: EpisodeStep; type: "step-changed" };

export const initialEpisodeDraftState: EpisodeDraftState = {
  goals: null,
  roles: null,
  scenario: null,
  scenarios: null,
  step: "scenario",
};

function sameRoles(left: EpisodeRoles, right: EpisodeRoles) {
  return (
    left.partnerRole === right.partnerRole && left.userRole === right.userRole
  );
}

function withRole(
  roles: EpisodeRoles,
  target: EpisodeRoleTarget,
  role: string
): EpisodeRoles {
  return target === "partner"
    ? { ...roles, partnerRole: role }
    : { ...roles, userRole: role };
}

export function episodeDraftReducer(
  state: EpisodeDraftState,
  action: EpisodeDraftAction
): EpisodeDraftState {
  switch (action.type) {
    // 후보를 새로 받으면 3개가 통째로 바뀐다. 고른 상황도 함께 풀린다.
    case "scenarios-loaded":
      return {
        ...state,
        goals: null,
        roles: null,
        scenario: null,
        scenarios: action.scenarios,
      };
    // 상황이 바뀌면 역할과 목표는 그 상황의 것이 아니다.
    case "scenario-selected":
      if (state.scenario?.title === action.scenario.title) {
        return state;
      }

      return {
        ...state,
        goals: null,
        roles: null,
        scenario: action.scenario,
      };
    case "draft-loaded":
      return {
        ...state,
        goals: {
          roles: {
            partnerRole: action.draft.partnerRole,
            userRole: action.draft.userRole,
          },
          sentences: action.draft.goals,
        },
        roles: {
          partnerRole: action.draft.partnerRole,
          userRole: action.draft.userRole,
        },
      };
    // 역할은 고쳐도 다시 만들어도 여기로 온다. 목표는 낡은 채로 남는다.
    case "role-changed":
      if (!state.roles) {
        return state;
      }

      return {
        ...state,
        roles: withRole(state.roles, action.target, action.role),
      };
    case "goals-loaded":
      if (!state.roles) {
        return state;
      }

      return {
        ...state,
        goals: { roles: state.roles, sentences: action.goals },
      };
    default:
      return { ...state, step: action.step };
  }
}

export function needsRoles(state: EpisodeDraftState) {
  return state.roles === null;
}

/** 역할이 바뀐 뒤로 목표를 다시 만들지 않았으면 목표는 낡았다. */
export function needsGoals(state: EpisodeDraftState) {
  if (!(state.goals && state.roles)) {
    return true;
  }

  return !sameRoles(state.goals.roles, state.roles);
}

export function draftGoals(state: EpisodeDraftState) {
  if (needsGoals(state) || !state.goals) {
    return null;
  }

  return state.goals.sentences;
}

export function canContinue(state: EpisodeDraftState) {
  if (state.step === "scenario") {
    return state.scenario !== null;
  }

  if (state.step === "roles") {
    return (
      state.roles !== null &&
      state.roles.partnerRole.trim().length > 0 &&
      state.roles.userRole.trim().length > 0
    );
  }

  return draftGoals(state) !== null;
}

/** 이전 스텝의 결정은 내비게이션이 나른다. 본문에는 현재 질문만 남는다. */
export function episodeDraftTitle(state: EpisodeDraftState) {
  if (state.step === "scenario" || !state.scenario) {
    return "새 에피소드";
  }

  return state.scenario.title;
}

export function episodeDraftSubtitle(state: EpisodeDraftState) {
  if (state.step !== "goals" || !state.roles) {
    return null;
  }

  return `${state.roles.partnerRole} · ${state.roles.userRole}`;
}
