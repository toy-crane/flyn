import { beforeEach, expect, jest, test } from "@jest/globals";
import { screen, userEvent, within } from "@testing-library/react-native";
import { Alert, type AlertButton } from "react-native";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { ExpressionNoteScreen } from "./expression-note-screen";

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 140,
}));

/** 카드 하나가 자기 id를 testID에 담으므로 세운 순서를 이것으로 읽는다. */
const CARD_TEST_ID = /^expression-card-5a4ed000-0000-4000-8000-\d{12}$/;

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
  meaning: "저는 뜨거운 아메리카노를 시켰어요.",
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

/** 그 카드의 영어 문장에서 형광펜이 입은 옷. 짚은 자리가 없으면 빈 목록이다. */
function markClassNames(testID: string): string[] {
  return screen
    .getByTestId(testID)
    .props.children.filter(
      (part: unknown): part is { props: { className: string } } =>
        typeof part === "object" && part !== null
    )
    .map((part: { props: { className: string } }) => part.props.className);
}

/** 확인창은 네이티브가 그리므로 화면에 없다. 부른 인자를 대신 읽는다. */
function lastAlert() {
  const alert = jest.mocked(Alert.alert).mock.lastCall;

  if (alert === undefined) {
    throw new Error("No alert was opened.");
  }

  return { buttons: (alert[2] ?? []) as AlertButton[], title: alert[0] };
}

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
});

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

test("세 종류가 모두 출처, 영어, 한국어 세 칸이고 인물 이름과 칩이 없다", async () => {
  await renderNote().rendered;

  expect(screen.getAllByText("Mia의 카페 · 1화")).toHaveLength(2);
  expect(screen.getByText("Mia의 카페 · 2화")).toBeOnTheScreen();
  expect(screen.queryByText("Mia")).toBeNull();
  expect(screen.queryByText("내 표현")).toBeNull();

  for (const expression of [UTTERANCE, CORRECTION]) {
    const card = within(screen.getByTestId(`expression-card-${expression.id}`));

    expect(card.getByText(expression.english)).toBeOnTheScreen();
    expect(card.getByText(expression.meaning ?? "")).toBeOnTheScreen();
  }
});

test("뜻이 없는 옛 항목은 한국어 줄만 빈다", async () => {
  await renderNote({ expressions: [GUIDANCE] }).rendered;

  expect(
    screen.getByTestId(`expression-card-${GUIDANCE.id}-english`)
  ).toBeOnTheScreen();
  expect(
    screen.queryByTestId(`expression-card-${GUIDANCE.id}-meaning`)
  ).toBeNull();
});

test("인물 대사에는 형광펜이 없고 교정과 안내는 채널의 색을 쓴다", async () => {
  await renderNote().rendered;

  expect(markClassNames(`expression-card-${UTTERANCE.id}-english`)).toEqual([]);
  expect(markClassNames(`expression-card-${CORRECTION.id}-english`)).toEqual([
    "bg-learn-surface text-learn",
  ]);
  expect(markClassNames(`expression-card-${GUIDANCE.id}-english`)).toEqual([
    "bg-expression-surface text-expression",
  ]);
});

test("교정 카드를 누르면 내가 쓴 문장과 이유가 그 자리에서 펼쳐진다", async () => {
  await renderNote({ expressions: [CORRECTION] }).rendered;
  const detail = `expression-card-${CORRECTION.id}-detail`;

  expect(screen.queryByTestId(detail)).toBeNull();

  await userEvent.press(
    screen.getByTestId(`expression-card-${CORRECTION.id}-body`)
  );

  expect(screen.getByTestId(detail)).toBeOnTheScreen();
  expect(screen.getByText("내가 쓴 문장")).toBeOnTheScreen();
  expect(markClassNames(`expression-card-${CORRECTION.id}-original`)).toEqual([
    "underline",
  ]);
  expect(screen.getByText("이렇게 쓰는 이유")).toBeOnTheScreen();
  expect(screen.getByText("지난 일은 ordered로 말해요.")).toBeOnTheScreen();
});

test("인물 대사 카드는 눌러도 펼쳐지지 않는다", async () => {
  await renderNote({ expressions: [UTTERANCE] }).rendered;

  await userEvent.press(
    screen.getByTestId(`expression-card-${UTTERANCE.id}-body`)
  );

  expect(
    screen.queryByTestId(`expression-card-${UTTERANCE.id}-detail`)
  ).toBeNull();
});

test("휴지통은 제목만 있는 확인창을 열고 그 자리에서 지우지 않는다", async () => {
  const { onErase, rendered } = renderNote({ expressions: [CORRECTION] });

  await rendered;
  await userEvent.press(
    screen.getByTestId(`expression-erase-${CORRECTION.id}`)
  );

  const { buttons, title } = lastAlert();

  expect(title).toBe("표현을 삭제할까요?");
  expect(jest.mocked(Alert.alert).mock.lastCall?.[1]).toBeUndefined();
  expect(buttons.map((button) => button.text)).toEqual(["취소", "삭제"]);
  expect(onErase).not.toHaveBeenCalled();
});

test("확인창의 삭제만 그 항목을 지운다", async () => {
  const { onErase, rendered } = renderNote({ expressions: [CORRECTION] });

  await rendered;
  await userEvent.press(
    screen.getByTestId(`expression-erase-${CORRECTION.id}`)
  );

  const { buttons } = lastAlert();
  const cancel = buttons.find((button) => button.text === "취소");
  const erase = buttons.find((button) => button.text === "삭제");

  cancel?.onPress?.();

  expect(onErase).not.toHaveBeenCalled();

  erase?.onPress?.();

  expect(onErase).toHaveBeenCalledWith(CORRECTION.id);
});

test("카드를 펼쳐도 아이콘 줄은 카드를 펼치지 않는다", async () => {
  await renderNote({ expressions: [CORRECTION] }).rendered;

  await userEvent.press(
    screen.getByTestId(`expression-erase-${CORRECTION.id}`)
  );

  expect(
    screen.queryByTestId(`expression-card-${CORRECTION.id}-detail`)
  ).toBeNull();
});

test("아이콘 줄의 접근성 이름은 표현 복사와 삭제다", async () => {
  const { rendered } = renderNote({ expressions: [UTTERANCE] });
  const { getAllByRole } = await rendered;

  expect(getAllByRole("button", { name: "표현 복사" })).toHaveLength(1);
  expect(getAllByRole("button", { name: "삭제" })).toHaveLength(1);
});

test("담은 것이 없으면 책갈피 한 줄만 보이고 버튼은 없다", async () => {
  const { rendered } = renderNote({ expressions: [] });

  await rendered;

  expect(screen.getByTestId("expression-note-empty")).toBeOnTheScreen();
  expect(screen.getByText("아직 저장한 표현이 없어요")).toBeOnTheScreen();
  expect(screen.queryByRole("button")).toBeNull();
});

test("불러오지 못하면 제목과 다시 시도하기가 본문에 선다", async () => {
  const { rendered } = renderNote({ expressions: undefined });

  await rendered;

  expect(screen.getByText("표현 노트를 불러오지 못했어요")).toBeOnTheScreen();
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
