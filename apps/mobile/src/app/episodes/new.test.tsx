import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { processColor } from "react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../lib/use-episode-creation", () => ({
  useEpisodeDraft: jest.fn(),
  useGoalGeneration: jest.fn(),
  useRoleGeneration: jest.fn(),
  useSaveEpisode: jest.fn(),
  useScenarioCandidates: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import {
  useEpisodeDraft,
  useGoalGeneration,
  useRoleGeneration,
  useSaveEpisode,
  useScenarioCandidates,
} from "../../lib/use-episode-creation";
import { routerStub } from "../../test-support/expo-router";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../../test-support/heroui";
import NewEpisodeScreen from "./new";

interface MutationCallbacks<TData> {
  onError?: (error: Error) => void;
  onSuccess?: (data: TData) => void;
}

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderCreation() {
  return render(<NewEpisodeScreen />, { wrapper: HeroUIWrapper });
}

const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];
const ACCENT = THEME_TOKEN_STUBS["--color-accent"];
const TURN_WORD = /턴/;
const TURN_LIMIT_NUMBER = /20/;

const FIRST_SCENARIOS = [
  { description: "설명 1", title: "포틀랜드 카페에서 첫 주문" },
  { description: "설명 2", title: "호스텔 체크인이 꼬였어요" },
  { description: "설명 3", title: "공항에서 짐이 안 나와요" },
];
const SECOND_SCENARIOS = [
  { description: "설명 4", title: "식당에서 알레르기 알리기" },
  { description: "설명 5", title: "약국에서 감기약 찾기" },
  { description: "설명 6", title: "분실물 센터에 문의하기" },
];
const DRAFT = {
  goals: ["원두 추천 받기", "오트밀크로 바꾸기", "가볼 곳 물어보기"],
  partnerRole: "바리스타 Maya",
  userRole: "처음 방문한 여행객",
};
const NEW_GOALS = ["새 목표 1", "새 목표 2", "새 목표 3"];

/** 실물 mutation처럼 호출을 붙잡아 두고, 테스트가 원할 때 끝낸다. */
function deferredMutation<TVariables, TData>() {
  const calls: {
    callbacks: MutationCallbacks<TData>;
    variables: TVariables;
  }[] = [];
  const mutate = jest.fn(
    (variables: TVariables, callbacks: MutationCallbacks<TData> = {}) => {
      calls.push({ callbacks, variables });
    }
  );

  return {
    calls,
    async fail(error: Error) {
      await act(async () => calls.at(-1)?.callbacks.onError?.(error));
    },
    hook: () => ({ mutate }),
    mutate,
    // RNTL의 render가 async act 안에서 돈다. 여기서도 await하지 않으면 상태
    // 갱신이 그 스코프에 갇혀 화면에 닿지 않는다.
    async resolve(data: TData) {
      await act(async () => calls.at(-1)?.callbacks.onSuccess?.(data));
    },
  };
}

let candidates: ReturnType<
  typeof deferredMutation<string[], typeof FIRST_SCENARIOS>
>;
let draft: ReturnType<typeof deferredMutation<{ title: string }, typeof DRAFT>>;
let goals: ReturnType<typeof deferredMutation<unknown, string[]>>;
let role: ReturnType<typeof deferredMutation<unknown, string>>;
let save: ReturnType<typeof deferredMutation<unknown, { id: string }>>;

function connect() {
  (useScenarioCandidates as jest.Mock).mockImplementation(candidates.hook);
  (useEpisodeDraft as jest.Mock).mockImplementation(draft.hook);
  (useGoalGeneration as jest.Mock).mockImplementation(goals.hook);
  (useRoleGeneration as jest.Mock).mockImplementation(role.hook);
  (useSaveEpisode as jest.Mock).mockImplementation(save.hook);
}

/** ① 상황까지 온 상태. 후보 3개가 보이고 첫 후보를 골랐다. */
async function pickFirstScenario() {
  await renderCreation();
  await candidates.resolve(FIRST_SCENARIOS);
  await screen.findByText(FIRST_SCENARIOS[0].title);
  await fireEvent.press(
    screen.getByRole("button", { name: FIRST_SCENARIOS[0].title })
  );
}

/** ② 역할까지 온 상태. */
async function reachRoles() {
  await pickFirstScenario();
  await fireEvent.press(screen.getByRole("button", { name: "다음" }));
  await draft.resolve(DRAFT);
  await screen.findByText("이런 역할 어때요?");
}

/** ③ 목표까지 온 상태. */
async function reachGoals() {
  await reachRoles();
  await fireEvent.press(screen.getByRole("button", { name: "다음" }));
  await screen.findByText("이번 대화의 목표예요");
}

beforeEach(() => {
  /*
   * `resetAllMocks`가 아니다. 그것은 jest-expo가 세운 asset registry 대역
   * (`@react-native/assets-registry/registry`)의 구현까지 지워
   * `getAssetByID`가 undefined를 돌려주고, 브랜드 층 아이콘(Ionicons)이 폰트를
   * 실으려다 "Module 1 is missing from the asset registry"로 마운트에 실패한다.
   */
  jest.clearAllMocks();
  candidates = deferredMutation();
  draft = deferredMutation();
  goals = deferredMutation();
  role = deferredMutation();
  save = deferredMutation();
  connect();
});

describe("① 상황", () => {
  it("들어오면 후보 3개를 만들고 그 사이 만드는 중이 보인다", async () => {
    await renderCreation();

    expect(candidates.mutate).toHaveBeenCalledWith([], expect.anything());
    expect(screen.getByLabelText("상황 만드는 중")).toBeTruthy();

    await candidates.resolve(FIRST_SCENARIOS);

    for (const scenario of FIRST_SCENARIOS) {
      expect(screen.getByText(scenario.title)).toBeTruthy();
    }
  });

  // 스스로 나타나는 수동형 진행이라 중립 회색이다. Spinner 기본값
  // (`color="default"`)은 브랜드 accent라 그대로 두면 누를 수 있는 것처럼
  // 보인다(docs/specs/neutral-loading-indicators/spec.md).
  it("만드는 중 표시는 중립 회색이다 — 브랜드 accent를 쓰지 않는다", async () => {
    await renderCreation();

    const painted = paintedColors(screen.toJSON());

    expect(painted).toContain(processColor(NEUTRAL));
    expect(painted).not.toContain(processColor(ACCENT));
  });

  it("`다른 상황 보기`가 후보 3개 전체를 교체한다", async () => {
    await pickFirstScenario();

    await fireEvent.press(
      screen.getByRole("button", { name: "다른 상황 보기" })
    );

    expect(candidates.mutate).toHaveBeenLastCalledWith(
      FIRST_SCENARIOS.map((scenario) => scenario.title),
      expect.anything()
    );

    await candidates.resolve(SECOND_SCENARIOS);

    for (const scenario of SECOND_SCENARIOS) {
      expect(screen.getByText(scenario.title)).toBeTruthy();
    }
    for (const scenario of FIRST_SCENARIOS) {
      expect(screen.queryByText(scenario.title)).toBeNull();
    }
  });
});

describe("② 역할", () => {
  it("화면을 넘기지 않고 큰 제목만 바뀌며 만드는 중이 보인다", async () => {
    await pickFirstScenario();

    await fireEvent.press(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("이런 역할 어때요?")).toBeTruthy();
    expect(screen.queryByText("이런 상황 어때요?")).toBeNull();
    expect(screen.getByLabelText("상대 만드는 중")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "역할을 만들고 있어요" })
    ).toBeTruthy();

    await draft.resolve(DRAFT);

    expect(await screen.findByDisplayValue(DRAFT.partnerRole)).toBeTruthy();
    expect(screen.getByDisplayValue(DRAFT.userRole)).toBeTruthy();
  });

  it("이전 스텝의 결정을 헤더가 나른다", async () => {
    await reachRoles();

    expect(screen.getByText(FIRST_SCENARIOS[0].title)).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "다음" }));

    expect(
      await screen.findByText(`${DRAFT.partnerRole} · ${DRAFT.userRole}`)
    ).toBeTruthy();
  });

  it("상대만 다시 만들면 그 자리만 바뀐다", async () => {
    await reachRoles();

    await fireEvent.press(
      screen.getByRole("button", { name: "상대 다시 만들기" })
    );

    expect(role.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ target: "partner" }),
      expect.anything()
    );
    expect(screen.getByLabelText("상대 만드는 중")).toBeTruthy();

    await role.resolve("사장 Ben");

    expect(await screen.findByDisplayValue("사장 Ben")).toBeTruthy();
    expect(screen.getByDisplayValue(DRAFT.userRole)).toBeTruthy();
  });

  it("역할을 고치면 목표를 다시 만든다", async () => {
    await reachRoles();

    await fireEvent.changeText(screen.getByLabelText("내 역할"), "단골 손님");
    await fireEvent.press(screen.getByRole("button", { name: "다음" }));

    expect(goals.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        excluded: DRAFT.goals,
        roles: { partnerRole: DRAFT.partnerRole, userRole: "단골 손님" },
      }),
      expect.anything()
    );
    expect(screen.getByLabelText("목표 만드는 중")).toBeTruthy();

    await goals.resolve(NEW_GOALS);

    expect(await screen.findByText(NEW_GOALS[0])).toBeTruthy();
  });
});

describe("이전 질문으로 돌아가기", () => {
  it("② 역할에서 뒤로 가면 화면을 벗기지 않고 ① 상황으로 돌아간다", async () => {
    await reachRoles();

    await fireEvent.press(screen.getByRole("button", { name: "이전 질문" }));

    expect(screen.getByText("이런 상황 어때요?")).toBeTruthy();
    expect(routerStub.back).not.toHaveBeenCalled();
  });

  it("상황을 바꾸면 역할과 목표를 함께 다시 만든다", async () => {
    await reachRoles();
    await fireEvent.press(screen.getByRole("button", { name: "이전 질문" }));

    await fireEvent.press(
      screen.getByRole("button", { name: FIRST_SCENARIOS[1].title })
    );
    await fireEvent.press(screen.getByRole("button", { name: "다음" }));

    expect(draft.mutate).toHaveBeenLastCalledWith(
      FIRST_SCENARIOS[1],
      expect.anything()
    );
    expect(screen.getByLabelText("상대 만드는 중")).toBeTruthy();

    await draft.resolve({
      goals: ["새 목표 1", "새 목표 2", "새 목표 3"],
      partnerRole: "프런트 직원",
      userRole: "예약이 사라진 여행객",
    });
    await fireEvent.press(screen.getByRole("button", { name: "다음" }));

    expect(goals.mutate).not.toHaveBeenCalled();
    expect(screen.getByText("새 목표 1")).toBeTruthy();
  });

  it("① 상황에서 뒤로 가면 생성 화면을 벗긴다", async () => {
    await pickFirstScenario();

    expect(screen.queryByRole("button", { name: "이전 질문" })).toBeNull();
  });
});

describe("③ 목표", () => {
  it("역할이 그대로면 만들어 둔 목표를 다시 부르지 않는다", async () => {
    await reachGoals();

    expect(goals.mutate).not.toHaveBeenCalled();
    for (const goal of DRAFT.goals) {
      expect(screen.getByText(goal)).toBeTruthy();
    }
  });

  it("목표는 직접 고칠 수 없고 `다른 목표 보기`로만 바뀐다", async () => {
    await reachGoals();

    expect(screen.queryByDisplayValue(DRAFT.goals[0])).toBeNull();

    await fireEvent.press(
      screen.getByRole("button", { name: "다른 목표 보기" })
    );
    await goals.resolve(NEW_GOALS);

    expect(await screen.findByText(NEW_GOALS[0])).toBeTruthy();
    expect(screen.queryByText(DRAFT.goals[0])).toBeNull();
  });

  it("시작하면 상황·역할·목표를 저장하고 홈으로 돌아간다", async () => {
    await reachGoals();

    await fireEvent.press(
      screen.getByRole("button", { name: "이 상황으로 시작" })
    );

    expect(save.mutate).toHaveBeenCalledWith(
      {
        goals: DRAFT.goals,
        roles: {
          partnerRole: DRAFT.partnerRole,
          userRole: DRAFT.userRole,
        },
        scenario: FIRST_SCENARIOS[0],
      },
      expect.anything()
    );

    await save.resolve({ id: "episode-1" });

    await waitFor(() => {
      expect(routerStub.back).toHaveBeenCalled();
    });
  });

  // 버튼 안의 진행 표시는 수동형 indicator가 아니라 그 action의 전경이다
  // (docs/specs/neutral-loading-indicators/spec.md).
  it("만드는 동안 CTA 안의 progress는 그 버튼의 전경색을 따른다", async () => {
    await reachGoals();

    await fireEvent.press(
      screen.getByRole("button", { name: "이 상황으로 시작" })
    );

    const painted = paintedColors(screen.toJSON());

    expect(painted).toContain(
      processColor(THEME_TOKEN_STUBS["--color-accent-foreground"])
    );
    expect(painted).not.toContain(processColor(NEUTRAL));
  });
});

describe("생성 화면의 턴 상한", () => {
  it("어느 스텝에도 턴 상한이 나오지 않는다", async () => {
    await reachGoals();

    expect(screen.queryByText(TURN_WORD)).toBeNull();
    expect(screen.queryByText(TURN_LIMIT_NUMBER)).toBeNull();
  });
});
