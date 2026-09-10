import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { ExpressionNoteScreen } from "./expression-note-screen";

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 140,
}));

/** 카드 하나가 자기 id를 testID에 담으므로 세운 순서를 이것으로 읽는다. */
const CARD_TEST_ID = /^expression-card-5a4ed000/;

const UTTERANCE: SavedExpression = {
  english: "Next in line, please!",
  entries: null,
  episodeNumber: 1,
  id: "5a4ed000-0000-4000-8000-000000000001",
  kind: "utterance",
  meaning: "다음 분이요!",
  original: null,
  speaker: "Mia",
  storyTitle: "Mia의 카페",
};

const CORRECTION: SavedExpression = {
  english: "I ordered a hot americano.",
  entries: [
    {
      fixed: "ordered",
      original: "order",
      why: "지난 일은 ordered로 말해요.",
    },
  ],
  episodeNumber: 1,
  id: "5a4ed000-0000-4000-8000-000000000002",
  kind: "correction",
  meaning: null,
  original: "I order a hot americano.",
  speaker: null,
  storyTitle: "Mia의 카페",
};

const GUIDANCE: SavedExpression = {
  english: "No worries, but I'm in a bit of a hurry.",
  entries: [
    {
      fixed: "No worries",
      original: "괜찮아요",
      why: "'괜찮아요'는 No worries라고 해요.",
    },
  ],
  episodeNumber: 2,
  id: "5a4ed000-0000-4000-8000-000000000003",
  kind: "guidance",
  meaning: null,
  original: "괜찮아요, 그런데 좀 급해서요.",
  speaker: null,
  storyTitle: "Mia의 카페",
};

function renderNote(
  overrides: Partial<Parameters<typeof ExpressionNoteScreen>[0]> = {}
) {
  const onErase = jest.fn<(id: string) => void>();

  return {
    onErase,
    rendered: renderWithHeroUI(
      <ExpressionNoteScreen
        expressions={[UTTERANCE, CORRECTION, GUIDANCE]}
        isLoading={false}
        isRetrying={false}
        onErase={onErase}
        onRetry={jest.fn()}
        {...overrides}
      />
    ),
  };
}

test("서버가 준 순서 그대로 세운다", async () => {
  const { rendered } = renderNote();
  const { getAllByTestId } = await rendered;

  expect(getAllByTestId(CARD_TEST_ID).map((card) => card.props.testID)).toEqual(
    [
      `expression-card-${UTTERANCE.id}`,
      `expression-card-${CORRECTION.id}`,
      `expression-card-${GUIDANCE.id}`,
    ]
  );
});

test("인물 대사 카드는 인물 이름과 영어, 한국어 뜻 두 줄이다", async () => {
  await renderNote({ expressions: [UTTERANCE] }).rendered;

  expect(screen.getByText("Mia")).toBeOnTheScreen();
  expect(screen.getByText("Mia의 카페 1화")).toBeOnTheScreen();
  expect(screen.getByText(UTTERANCE.english)).toBeOnTheScreen();
  expect(screen.getByText("다음 분이요!")).toBeOnTheScreen();
});

test("배울 표현 카드는 내 표현 표시와 원문, 고친 문장, 이유 세 덩어리다", async () => {
  const { rendered } = renderNote({ expressions: [CORRECTION] });
  const { getByTestId } = await rendered;

  expect(screen.getByText("내 표현")).toBeOnTheScreen();
  expect(getByTestId("expression-card-original")).toBeOnTheScreen();
  expect(getByTestId("expression-card-english")).toBeOnTheScreen();
  expect(screen.getByText("지난 일은 ordered로 말해요.")).toBeOnTheScreen();
  // 인물 대사에만 있는 뜻 줄이 여기에는 없다. 그 차이가 띠와 함께 두 카드를
  // 가른다.
  expect(screen.queryByTestId("expression-card-meaning")).toBeNull();
});

test("원문은 밑줄로, 고친 문장은 그 안내의 형광펜으로 짚는다", async () => {
  const { rendered } = renderNote({ expressions: [CORRECTION] });
  const { getByTestId } = await rendered;
  const marked = (testID: string) =>
    getByTestId(testID)
      .props.children.filter(
        (part: unknown): part is { props: { className: string } } =>
          typeof part === "object" && part !== null
      )
      .map((part: { props: { className: string } }) => part.props.className);

  expect(marked("expression-card-original")).toEqual(["underline"]);
  expect(marked("expression-card-english")).toEqual([
    "bg-learn-surface text-learn",
  ]);
});

test("한국어 안내는 다른 색의 형광펜을 쓴다", async () => {
  const { rendered } = renderNote({ expressions: [GUIDANCE] });
  const { getByTestId } = await rendered;

  expect(
    getByTestId("expression-card-english")
      .props.children.filter(
        (part: unknown): part is { props: { className: string } } =>
          typeof part === "object" && part !== null
      )
      .map((part: { props: { className: string } }) => part.props.className)
  ).toEqual(["bg-expression-surface text-expression"]);
});

test("밀어서 드러난 삭제를 누르면 그 항목만 지운다", async () => {
  const { onErase, rendered } = renderNote();

  await rendered;
  await userEvent.press(
    screen.getByTestId(`expression-erase-${CORRECTION.id}`)
  );

  expect(onErase).toHaveBeenCalledWith(CORRECTION.id);
});

test("삭제의 접근성 이름은 삭제다", async () => {
  const { rendered } = renderNote({ expressions: [UTTERANCE] });
  const { getAllByRole } = await rendered;

  expect(getAllByRole("button", { name: "삭제" })).toHaveLength(1);
});

test("담은 것이 없으면 책갈피 한 줄만 보이고 버튼은 없다", async () => {
  const { rendered } = renderNote({ expressions: [] });

  await rendered;

  expect(screen.getByTestId("expression-note-empty")).toBeOnTheScreen();
  expect(screen.getByText("아직 저장한 표현이 없어요.")).toBeOnTheScreen();
  expect(screen.queryByRole("button")).toBeNull();
});

test("불러오지 못하면 제목과 다시 시도하기가 본문에 선다", async () => {
  const { rendered } = renderNote({ expressions: undefined });

  await rendered;

  expect(screen.getByText("표현 노트를 불러오지 못했어요.")).toBeOnTheScreen();
  expect(screen.getByText("다시 시도하기")).toBeOnTheScreen();
});

test("불러오는 중은 빈 목록으로 보여 주지 않는다", async () => {
  const { rendered } = renderNote({ expressions: undefined, isLoading: true });

  await rendered;

  expect(screen.queryByTestId("expression-note-empty")).toBeNull();
  expect(screen.queryByTestId("expression-note-unavailable")).toBeNull();
});

test("다시 부르는 동안 버튼에 진행 표시가 있고 다시 눌리지 않는다", async () => {
  const { rendered } = renderNote({
    expressions: undefined,
    isRetrying: true,
  });

  await rendered;

  expect(
    screen.getByRole("button", { name: "다시 시도하기" }).props
      .accessibilityState
  ).toMatchObject({ busy: true, disabled: true });
});
