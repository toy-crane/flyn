import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, processColor } from "react-native";

jest.mock("uniwind", () =>
  require("../test-support/heroui").uniwindThemeMock()
);

jest.mock("@legendapp/list/react-native", () => {
  const ReactRuntime = require("react");
  const { Pressable, View } = require("react-native");

  return {
    LegendList: ({
      ListHeaderComponent,
      data,
      refreshControl,
      renderItem,
    }: {
      ListHeaderComponent: unknown;
      data: unknown[];
      refreshControl: {
        props: {
          onRefresh: () => void;
          refreshing: boolean;
          testID?: string;
          tintColor?: string;
        };
      };
      renderItem: (info: { item: unknown }) => unknown;
    }) => {
      const refreshProps = refreshControl.props;

      return ReactRuntime.createElement(
        View,
        null,
        ListHeaderComponent,
        ReactRuntime.createElement(Pressable, {
          accessibilityState: {
            busy: refreshProps.refreshing,
          },
          onPress: refreshProps.onRefresh,
          testID: refreshProps.testID ?? "episode-list-refresh-control",
          tintColor: refreshProps.tintColor,
        }),
        data.map((item, index) =>
          ReactRuntime.createElement(
            ReactRuntime.Fragment,
            { key: index },
            renderItem({ item })
          )
        )
      );
    },
  };
});
jest.mock("expo-router", () =>
  require("../test-support/expo-router").expoRouterMock()
);
jest.mock("../lib/use-episodes", () => ({
  useDeleteEpisode: jest.fn(),
  useEpisodes: jest.fn(),
}));
jest.mock("../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useDeleteEpisode, useEpisodes } from "../lib/use-episodes";
import { routerStub, setIsFocused } from "../test-support/expo-router";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../test-support/heroui";
import HomeScreen, { formatEpisodeDay } from "./index";

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderHome() {
  return render(<HomeScreen />, { wrapper: HeroUIWrapper });
}

const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];
const ACCENT = THEME_TOKEN_STUBS["--color-accent"];
const GOAL_PROGRESS_TAIL = /목표 3\/3$/;
const mockUseEpisodes = useEpisodes as jest.Mock;
const mockUseDeleteEpisode = useDeleteEpisode as jest.Mock;
const deleteEpisode = jest.fn();
const retry = jest.fn();

function goals(achieved: number) {
  return [1, 2, 3].map((position) => ({
    achieved_at:
      position <= achieved
        ? "2026-08-04T00:00:00.000Z"
        : (null as string | null),
    position,
    sentence: `목표 ${position}`,
  }));
}

function episode({
  achieved = 0,
  id,
  status = "active",
  title,
  updatedAt,
}: {
  achieved?: number;
  id: string;
  status?: string;
  title: string;
  updatedAt: string;
}) {
  return {
    created_at: "2026-08-01T00:00:00.000Z",
    episode_goals: goals(achieved),
    id,
    partner_role: "바리스타 Maya",
    scenario_description: "설명",
    scenario_title: title,
    status,
    summary: null,
    turn_limit: 20,
    updated_at: updatedAt,
    user_role: "처음 방문한 여행객",
  };
}

const RECENT_ACTIVE = episode({
  achieved: 1,
  id: "episode-1",
  title: "포틀랜드 카페에서 첫 주문",
  updatedAt: "2026-08-05T04:00:00.000Z",
});
const OLDER_ACTIVE = episode({
  achieved: 2,
  id: "episode-2",
  title: "공항에서 짐이 안 나왔을 때",
  updatedAt: "2026-08-05T01:00:00.000Z",
});
const FINISHED = episode({
  achieved: 3,
  id: "episode-3",
  status: "goals_met",
  title: "호스텔 체크인이 꼬였어요",
  updatedAt: "2026-08-04T01:00:00.000Z",
});

function alertButtons() {
  const spy = Alert.alert as unknown as jest.Mock;

  return (spy.mock.calls.at(-1)?.[2] ?? []) as {
    onPress?: () => void;
    style?: string;
    text: string;
  }[];
}

function episodesAre(data: unknown[]) {
  mockUseEpisodes.mockReturnValue({
    data,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: retry,
  });
}

beforeEach(() => {
  /*
   * `resetAllMocks`가 아니다. 그것은 jest-expo가 세운 asset registry 대역
   * (`@react-native/assets-registry/registry`)의 구현까지 지워
   * `getAssetByID`가 undefined를 돌려주고, 브랜드 층 아이콘(Ionicons)이 폰트를
   * 실으려다 "Module 1 is missing from the asset registry"로 마운트에 실패한다.
   */
  jest.clearAllMocks();
  setIsFocused(true);
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  episodesAre([RECENT_ACTIVE, OLDER_ACTIVE, FINISHED]);
  mockUseDeleteEpisode.mockReturnValue({
    isPending: false,
    mutate: deleteEpisode,
  });
});

describe("에피소드가 없는 홈", () => {
  it("첫 에피소드를 만들자는 안내만 보여준다", async () => {
    episodesAre([]);

    await renderHome();

    expect(screen.getByText("아직 만든 에피소드가 없어요")).toBeTruthy();
    expect(screen.queryByText("모든 에피소드")).toBeNull();
    expect(screen.queryByText("이어서 하기")).toBeNull();
    expect(screen.queryByRole("button", { name: "새 에피소드" })).toBeNull();
  });

  it("안내의 action이 생성 화면을 연다", async () => {
    episodesAre([]);

    await renderHome();
    fireEvent.press(screen.getByRole("button", { name: "첫 에피소드 만들기" }));

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/new");
  });
});

describe("홈의 카드와 목록", () => {
  it("가장 최근 진행 중 하나만 카드에 오르고 목록에는 없다", async () => {
    await renderHome();

    expect(screen.getByText("이어서 하기")).toBeTruthy();
    expect(screen.getByText("대화 이어가기")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: RECENT_ACTIVE.scenario_title })
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: OLDER_ACTIVE.scenario_title })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: FINISHED.scenario_title })
    ).toBeTruthy();
  });

  it("진행 중이 하나도 없으면 카드만 사라지고 목록은 남는다", async () => {
    episodesAre([FINISHED]);

    await renderHome();

    expect(screen.queryByText("이어서 하기")).toBeNull();
    expect(screen.getByText("모든 에피소드")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: FINISHED.scenario_title })
    ).toBeTruthy();
  });

  it("진행 중인 행에는 파란 점과 어디까지 했는지가 붙는다", async () => {
    await renderHome();

    expect(screen.getByTestId("episode-active-dot-episode-2")).toBeTruthy();
    expect(screen.queryByTestId("episode-active-dot-episode-3")).toBeNull();
    expect(
      screen.getByTestId("episode-supporting-episode-2")
    ).toHaveTextContent("목표 2/3");
    // 끝난 행은 앞에 날짜가 붙는다. 날짜 규칙은 아래 formatEpisodeDay가 본다.
    expect(
      screen.getByTestId("episode-supporting-episode-3")
    ).toHaveTextContent(GOAL_PROGRESS_TAIL);
  });

  it("카드의 대화 이어가기가 그 에피소드의 대화를 연다", async () => {
    await renderHome();

    fireEvent.press(screen.getByRole("button", { name: "대화 이어가기" }));

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/episode-1");
  });

  it("목록 행을 누르면 그 에피소드의 대화를 연다", async () => {
    await renderHome();

    fireEvent.press(
      screen.getByRole("button", { name: OLDER_ACTIVE.scenario_title })
    );

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/episode-2");
  });

  it("끝난 에피소드를 열면 대화가 아니라 결과로 간다", async () => {
    await renderHome();

    fireEvent.press(
      screen.getByRole("button", { name: FINISHED.scenario_title })
    );

    expect(routerStub.push).toHaveBeenCalledWith({
      params: { episodeId: "episode-3" },
      pathname: "/episodes/result",
    });
  });

  it("행을 길게 눌러 확인하면 에피소드와 목표를 함께 지운다", async () => {
    await renderHome();

    fireEvent(
      screen.getByRole("button", { name: OLDER_ACTIVE.scenario_title }),
      "longPress"
    );

    expect(Alert.alert).toHaveBeenCalledWith(
      "에피소드를 지울까요?",
      expect.stringContaining("목표도 함께 사라져요"),
      expect.anything()
    );
    expect(deleteEpisode).not.toHaveBeenCalled();

    alertButtons()
      .find((button) => button.style === "destructive")
      ?.onPress?.();

    expect(deleteEpisode).toHaveBeenCalledWith("episode-2", expect.anything());
  });

  it("native toolbar의 새 에피소드 action이 생성 화면을 연다", async () => {
    await renderHome();

    fireEvent.press(screen.getByRole("button", { name: "새 에피소드" }));

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/new");
  });

  it("native toolbar의 설정 action으로 설정 화면을 연다", async () => {
    await renderHome();

    fireEvent.press(screen.getByRole("button", { name: "설정" }));

    expect(routerStub.push).toHaveBeenCalledWith("/settings");
  });
});

describe("홈의 조회 상태", () => {
  it("최초 조회는 수동형 의미 색의 loading을 보여준다", async () => {
    mockUseEpisodes.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: retry,
    });

    await renderHome();

    // 스스로 나타나는 수동형 진행이라 중립 회색이다. Spinner 기본값
    // (`color="default"`)은 브랜드 accent라 그대로 두면 누를 수 있는 것처럼
    // 보인다(docs/decisions/apple-hig-with-app-theme.md).
    expect(screen.getByLabelText("에피소드 불러오는 중")).toBeTruthy();

    const painted = paintedColors(screen.toJSON());

    expect(painted).toContain(processColor(NEUTRAL));
    expect(painted).not.toContain(processColor(ACCENT));
  });

  it("당겨서 새로고침하는 progress도 수동형 의미 색을 사용한다", async () => {
    await renderHome();

    expect(
      screen.getByTestId("episode-list-refresh-control").props.tintColor
    ).toBe(NEUTRAL);
  });

  it("조회가 실패하면 다시 시도할 수 있다", async () => {
    mockUseEpisodes.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: retry,
    });

    await renderHome();
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(retry).toHaveBeenCalled();
  });
});

describe("보조 줄의 날짜", () => {
  it("오늘·어제·n일 전 다음에는 날짜를 쓴다", () => {
    // 하루의 경계는 기기의 시간대가 정한다 — 고정 오프셋을 섞지 않는다.
    const now = new Date("2026-08-05T09:00:00");

    expect(formatEpisodeDay("2026-08-05T01:00:00", now)).toBe("오늘");
    expect(formatEpisodeDay("2026-08-04T23:00:00", now)).toBe("어제");
    expect(formatEpisodeDay("2026-08-02T01:00:00", now)).toBe("3일 전");
    expect(formatEpisodeDay("2026-07-20T01:00:00", now)).toBe("7월 20일");
  });
});
