import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("react-native-safe-area-context", () => ({
  // HeroUI provider가 이 모듈에서 함께 가져다 쓴다 — 통째로 대체하면 provider가
  // 렌더되지 않는다.
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

import type { EpisodeGoal } from "../../lib/episodes";
import { HeroUIWrapper } from "../../test-support/heroui";
import { GoalDock } from "./goal-dock";

const GOALS: EpisodeGoal[] = [
  {
    achieved_at: "2026-08-05T00:00:00.000Z",
    achieved_message_id: "user-1",
    position: 1,
    sentence: "오늘의 원두 추천 받기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 2,
    sentence: "우유를 오트밀크로 바꿔 주문하기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 3,
    sentence: "근처 가볼 만한 곳 물어보기",
  },
];

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderDock({ usedTurns = 2 }: { usedTurns?: number } = {}) {
  return render(
    <GoalDock
      currentPosition={2}
      goals={GOALS}
      turnLimit={20}
      usedTurns={usedTurns}
    />,
    { wrapper: HeroUIWrapper }
  );
}

describe("목표 바", () => {
  beforeEach(() => {
    // 아이콘 글리프는 jest-expo의 asset registry mock 위에서만 마운트된다 —
    // `resetAllMocks`는 그 mock까지 지운다.
    jest.clearAllMocks();
  });

  it("접히면 지금 할 목표 한 줄만 보여준다", async () => {
    await renderDock();

    expect(screen.getByTestId("goal-dock-now")).toHaveTextContent(
      "우유를 오트밀크로 바꿔 주문하기"
    );
    expect(screen.queryByText("오늘의 원두 추천 받기")).toBeNull();
    expect(screen.queryByText("근처 가볼 만한 곳 물어보기")).toBeNull();
  });

  it("턴 진행은 펼쳤을 때만 보인다", async () => {
    await renderDock();

    expect(screen.queryByTestId("goal-dock-turns")).toBeNull();

    await fireEvent.press(screen.getByTestId("goal-dock"));

    expect(screen.getByTestId("goal-dock-turns")).toHaveTextContent("턴 2/20");
  });

  it("펼치면 같은 자리에서 목표 3개를 상태별로 보여준다", async () => {
    await renderDock();

    await fireEvent.press(screen.getByTestId("goal-dock"));

    expect(screen.getByText("오늘의 원두 추천 받기")).toBeTruthy();
    expect(screen.getByText("우유를 오트밀크로 바꿔 주문하기")).toBeTruthy();
    expect(screen.getByText("근처 가볼 만한 곳 물어보기")).toBeTruthy();
    expect(screen.getByTestId("goal-pip-done")).toBeTruthy();
    expect(screen.getByTestId("goal-pip-now")).toBeTruthy();
    expect(screen.getByTestId("goal-pip-todo")).toBeTruthy();
  });

  it("남은 턴이 5개 이하가 되어야 접힌 바에 나타난다", async () => {
    const { rerender } = await renderDock({ usedTurns: 14 });

    expect(screen.queryByTestId("goal-dock-turns-left")).toBeNull();

    await rerender(
      <GoalDock
        currentPosition={2}
        goals={GOALS}
        turnLimit={20}
        usedTurns={15}
      />
    );

    expect(screen.getByTestId("goal-dock-turns-left")).toHaveTextContent(
      "5턴 남음"
    );
  });

  it("남은 턴 표시는 경고색이 아니라 보조 텍스트다", async () => {
    await renderDock({ usedTurns: 16 });
    await fireEvent.press(screen.getByTestId("goal-dock"));
    // 노드 핸들은 다시 렌더될 때 재사용되므로 그 자리의 값을 바로 꺼낸다.
    const expandedTurns: string =
      screen.getByTestId("goal-dock-turns").props.className;

    await fireEvent.press(screen.getByTestId("goal-dock"));
    const turnsLeft = screen.getByTestId("goal-dock-turns-left");

    expect(turnsLeft).toHaveTextContent("4턴 남음");
    // 나타난 것 자체가 신호다. 펼친 바의 턴과 같은 보조 텍스트 토큰을 쓴다.
    expect(turnsLeft.props.className).toEqual(expandedTurns);
    expect(turnsLeft.props.className).toContain("color-muted");
    expect(turnsLeft.props.className).not.toContain("danger");
  });

  it("목표를 다 이루면 지금 할 목표 자리가 다 됐다고 말한다", async () => {
    await render(
      <GoalDock
        currentPosition={null}
        goals={GOALS.map((goal) => ({
          ...goal,
          achieved_at: "2026-08-05T00:00:00.000Z",
          achieved_message_id: "user-1",
        }))}
        turnLimit={20}
        usedTurns={6}
      />,
      { wrapper: HeroUIWrapper }
    );

    // 마지막 목표 문장을 계속 세워 두면 다 된 표시 옆에 끝난 문장이 남는다.
    expect(screen.getByTestId("goal-dock-now")).toHaveTextContent(
      "목표를 모두 달성했어요"
    );
  });
});
