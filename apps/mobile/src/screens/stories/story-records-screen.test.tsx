import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { StoryPlay, StoryPlays } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoryRecordsScreen } from "./story-records-screen";

const STORY_ID = "10000000-0000-4000-8000-000000000001";

function episodeId(number: number): string {
  return `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

function storyPlayId(number: number): string {
  return `1a000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

/** 로컬 시각으로 적은 시작 시각. 카드 제목이 이 시각을 그대로 쓴다. */
function startedAt(day: number, hour: number, minute: number): string {
  return new Date(2026, 8, day, hour, minute).toISOString();
}

/** 1화를 끝내고 2화를 남긴 회차. */
function unfinishedRun(): StoryPlay {
  return {
    episodes: [
      {
        episodeId: episodeId(1),
        hasTranscript: true,
        number: 1,
        outcome: "원하는 커피로 바꿔냈어요.",
        title: "카페에서 생긴 일",
      },
    ],
    finished: 1,
    next: { episodeId: episodeId(2), number: 2, title: "계산이 꼬인 아침" },
    startedAt: startedAt(8, 15, 42),
    storyPlayId: storyPlayId(1),
  };
}

/** 다섯 화를 모두 끝낸 회차. */
function finishedRun(): StoryPlay {
  return {
    episodes: [1, 2, 3, 4, 5].map((number) => ({
      episodeId: episodeId(number),
      hasTranscript: true,
      number,
      outcome: `${number}화의 결과.`,
      title: `${number}화`,
    })),
    finished: 5,
    next: null,
    startedAt: startedAt(2, 9, 5),
    storyPlayId: storyPlayId(2),
  };
}

function records(storyPlays: StoryPlay[]): StoryPlays {
  return {
    coverBlurhash: null,
    coverEmoji: "☕",
    coverImagePath: null,
    intro: "매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.",
    plays: storyPlays,
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 5,
  };
}

function renderRecords(
  overrides: Partial<Parameters<typeof StoryRecordsScreen>[0]> = {}
) {
  const onOpenEpisode =
    jest.fn<(storyPlayId: string, episodeId: string) => void>();
  const onResume = jest.fn<(storyPlayId: string, episodeId: string) => void>();

  return {
    onOpenEpisode,
    onResume,
    rendered: renderWithHeroUI(
      <StoryRecordsScreen
        isLoading={false}
        isRetrying={false}
        onOpenEpisode={onOpenEpisode}
        onResume={onResume}
        onRetry={jest.fn()}
        storyPlays={records([unfinishedRun(), finishedRun()])}
        {...overrides}
      />
    ),
  };
}

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 103,
}));

test("표지 소개와 최근 대화 아래에 회차 카드를 시작한 날짜와 시간으로 보여 준다", async () => {
  const { rendered } = renderRecords();

  await rendered;

  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(screen.getByRole("header", { name: "최근 대화" })).toBeVisible();
  expect(screen.getByText("9월 8일 오후 3:42")).toBeVisible();
  expect(screen.getByText("9월 2일 오전 9:05")).toBeVisible();
});

// 미완료 회차가 여럿이어도 어느 하나를 대표로 세우지 않는다.
test("현재 플레이 배지를 붙이지 않고 회차마다 진행 바를 둔다", async () => {
  const { rendered } = renderRecords({
    storyPlays: records([
      unfinishedRun(),
      {
        ...finishedRun(),
        finished: 2,
        next: {
          episodeId: episodeId(3),
          number: 3,
          title: "자리를 맡아 둔 사이에",
        },
      },
    ]),
  });

  await rendered;

  expect(screen.queryByText("현재 플레이")).toBeNull();
  expect(screen.getAllByTestId("story-progress")).toHaveLength(2);
  expect(screen.queryByText("이어서 하기")).toBeNull();
});

test("접힌 회차는 현재 위치와 화 제목 또는 완료를 보여 준다", async () => {
  const { rendered } = renderRecords({
    storyPlays: records([unfinishedRun(), finishedRun()]),
  });

  await rendered;

  expect(screen.getByText("2/5화 · 계산이 꼬인 아침")).toBeVisible();
  expect(screen.getByText("5/5화 · 완료")).toBeVisible();
  expect(screen.queryByText("이어서 하기")).toBeNull();
});

test("완주한 회차에는 이어서 하기가 없다", async () => {
  const { rendered } = renderRecords({ storyPlays: records([finishedRun()]) });

  await rendered;

  expect(screen.queryByText("이어서 하기")).toBeNull();
});

test("미완료 회차의 이어서 하기는 그 회차의 다음 화를 연다", async () => {
  const { onResume, rendered } = renderRecords({
    storyPlays: records([unfinishedRun()]),
  });

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByTestId(`story-play-toggle-${storyPlayId(1)}`));
  await user.press(screen.getByTestId(`story-play-resume-${storyPlayId(1)}`));

  expect(onResume).toHaveBeenCalledWith(storyPlayId(1), episodeId(2));
});

test("카드를 펼치면 그 회차에서 끝낸 화의 결과가 보이고 눌러서 열 수 있다", async () => {
  const { onOpenEpisode, rendered } = renderRecords({
    storyPlays: records([unfinishedRun()]),
  });

  await rendered;
  const user = userEvent.setup();
  const toggle = screen.getByTestId(`story-play-toggle-${storyPlayId(1)}`);

  expect(screen.queryByText("원하는 커피로 바꿔냈어요.")).toBeNull();
  expect(toggle).toHaveProp(
    "accessibilityLabel",
    "9월 8일 오후 3:42, 2/5화 · 계산이 꼬인 아침, 대화 기록 펼치기"
  );
  expect(toggle).toHaveProp("accessibilityState", { expanded: false });

  await user.press(toggle);

  expect(screen.getByText("원하는 커피로 바꿔냈어요.")).toBeVisible();
  expect(toggle).toHaveProp(
    "accessibilityLabel",
    "9월 8일 오후 3:42, 2/5화 · 계산이 꼬인 아침, 대화 기록 접기"
  );
  expect(toggle).toHaveProp("accessibilityState", { expanded: true });

  await user.press(screen.getByTestId("story-play-episode-1"));

  expect(onOpenEpisode).toHaveBeenCalledWith(storyPlayId(1), episodeId(1));
});

// 첫 화를 끝내지 않았어도 사용자 메시지가 있으면 기록에 선다. 이때는 펼칠 것이
// 없으므로 펼친 뒤 이어서 하기만 나타난다.
test("아직 아무 화도 끝내지 않은 회차도 펼쳐서 이어간다", async () => {
  const started: StoryPlay = {
    episodes: [],
    finished: 0,
    next: { episodeId: episodeId(1), number: 1, title: "카페에서 생긴 일" },
    startedAt: startedAt(9, 10, 0),
    storyPlayId: storyPlayId(3),
  };
  const { rendered } = renderRecords({ storyPlays: records([started]) });

  await rendered;
  const user = userEvent.setup();

  expect(
    screen.getByTestId(`story-play-toggle-${storyPlayId(3)}`)
  ).toBeVisible();
  expect(screen.getByTestId("story-progress")).toBeVisible();
  expect(screen.getByText("1/5화 · 카페에서 생긴 일")).toBeVisible();
  expect(screen.getByTestId("story-progress-step-1")).toHaveProp(
    "className",
    expect.stringContaining("border-accent")
  );
  expect(screen.queryByText("이어서 하기")).toBeNull();

  await user.press(screen.getByTestId(`story-play-toggle-${storyPlayId(3)}`));

  expect(
    screen.queryByTestId(`story-play-episodes-${storyPlayId(3)}`)
  ).toBeNull();
  expect(screen.getByText("이어서 하기")).toBeVisible();
});

// 결말만 남고 대화가 없는 화는 열어도 볼 것이 없다.
test("대화가 없는 끝낸 화는 결과만 보이고 누를 수 없다", async () => {
  const storyPlay = unfinishedRun();
  const [first] = storyPlay.episodes;

  if (first) {
    first.hasTranscript = false;
  }

  const { rendered } = renderRecords({ storyPlays: records([storyPlay]) });

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByTestId(`story-play-toggle-${storyPlayId(1)}`));

  expect(screen.getByText("원하는 커피로 바꿔냈어요.")).toBeVisible();
  expect(screen.queryByTestId("story-play-episode-1")).toBeNull();
});

test("기록이 없으면 빈 화면을 보여 주고 다시 시도를 붙이지 않는다", async () => {
  const { rendered } = renderRecords({ storyPlays: records([]) });

  await rendered;

  expect(screen.getByTestId("story-records-empty")).toBeVisible();
  expect(screen.getByRole("header", { name: "최근 대화" })).toBeVisible();
  expect(screen.getByText("아직 나눈 대화가 없어요.")).toBeVisible();
  expect(screen.queryByText("다시 시도하기")).toBeNull();
});

// 빈 기록과 읽지 못한 것은 다른 일이다. 재시도 버튼이 그 둘을 가른다.
test("불러오지 못하면 다시 시도할 수 있다", async () => {
  const { rendered } = renderRecords({ storyPlays: undefined });

  await rendered;

  expect(screen.getByTestId("story-records-unavailable")).toBeVisible();
  expect(screen.getByText("다시 시도하기")).toBeVisible();
  expect(screen.queryByTestId("story-records-empty")).toBeNull();
  expect(screen.queryByRole("header", { name: "최근 대화" })).toBeNull();
});
