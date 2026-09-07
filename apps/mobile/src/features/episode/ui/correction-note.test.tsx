import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { CorrectionNote } from "./correction-note";

const ONE_EXPRESSION: EpisodeCorrection = {
  entries: [
    {
      fixed: "the wrong coffee",
      original: "wrong coffee",
      pattern: "article-the-specific",
      why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
    },
  ],
  fixed: "I think you gave me the wrong coffee.",
  messageId: "m1",
  original: "I think this is wrong coffee.",
};

const TWO_EXPRESSIONS: EpisodeCorrection = {
  entries: [
    {
      fixed: "want to change",
      original: "want change",
      pattern: "to-infinitive-after-want",
      why: "동사 두 개를 이어 쓸 때는 사이에 to를 넣어요.",
    },
    {
      fixed: "an iced americano",
      original: "iced americano",
      pattern: "article-a-count-noun",
      why: "음료 한 잔을 말할 때는 an을 붙여요.",
    },
  ],
  fixed: "Yes. I want to change to an iced americano.",
  messageId: "m2",
  original: "Yes. I want change to iced americano.",
};

function renderNote(correction: EpisodeCorrection) {
  const onAsk = jest.fn();

  return {
    onAsk,
    rendered: renderWithHeroUI(
      <CorrectionNote correction={correction} onAsk={onAsk} />
    ),
  };
}

// 자동으로 보이는 것은 고친 문장 한 줄까지다. 이유는 탭 뒤로 미룬다.
test("탭하기 전에는 고친 문장 한 줄만 보인다", async () => {
  const { rendered } = renderNote(ONE_EXPRESSION);
  await rendered;

  expect(screen.getByTestId("correction-line-fixed")).toHaveTextContent(
    "I think you gave me the wrong coffee."
  );
  expect(screen.queryByTestId("correction-card")).toBeNull();
  expect(screen.queryByText(ONE_EXPRESSION.entries[0].why)).toBeNull();
});

test("한 줄을 탭하면 그 자리에서 카드로 펼쳐지고 접기로 되돌아간다", async () => {
  const user = userEvent.setup();
  const { rendered } = renderNote(ONE_EXPRESSION);
  await rendered;

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));

  expect(screen.getByTestId("correction-card")).toBeOnTheScreen();
  expect(screen.getByText(ONE_EXPRESSION.entries[0].why)).toBeOnTheScreen();
  expect(screen.queryByTestId("correction-line")).toBeNull();

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 접기"));

  expect(screen.getByTestId("correction-line")).toBeOnTheScreen();
  expect(screen.queryByTestId("correction-card")).toBeNull();
});

// 한 메시지에 표현이 여럿이어도 고친 문장은 하나다. 나뉘는 것은 카드 안이다.
test("배울 표현이 둘이면 카드가 항목 둘로 나뉜다", async () => {
  const user = userEvent.setup();
  const { rendered } = renderNote(TWO_EXPRESSIONS);
  await rendered;

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));

  expect(screen.getByText("더 자연스러운 영어 표현 2개")).toBeOnTheScreen();
  expect(screen.getAllByTestId("correction-entry")).toHaveLength(2);
  expect(screen.getByText(TWO_EXPRESSIONS.entries[0].why)).toBeOnTheScreen();
  expect(screen.getByText(TWO_EXPRESSIONS.entries[1].why)).toBeOnTheScreen();
});

test("표현이 하나면 세는 말 없이 라벨만 쓴다", async () => {
  const user = userEvent.setup();
  const { rendered } = renderNote(ONE_EXPRESSION);
  await rendered;

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));

  expect(screen.getByText("더 자연스러운 영어 표현")).toBeOnTheScreen();
});

test("카드에는 AI에게 물어보기만 남고 다시 보내기와 전송 표시는 없다", async () => {
  const user = userEvent.setup();
  const { rendered } = renderNote(ONE_EXPRESSION);
  await rendered;
  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));
  expect(screen.queryByText("다시 보내기")).toBeNull();
  expect(screen.queryByText("고쳐서 다시 보냈어요")).toBeNull();
  expect(
    screen.getByRole("button", { name: "AI에게 물어보기" })
  ).toBeOnTheScreen();
});

// 시트를 닫으면 카드가 그대로 열려 있어야 한다. 여는 쪽은 접지 않는다.
test("AI에게 물어보기를 누르면 카드를 열어 둔 채 그 교정을 넘긴다", async () => {
  const user = userEvent.setup();
  const { onAsk, rendered } = renderNote(ONE_EXPRESSION);
  await rendered;

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));
  await user.press(screen.getByTestId("correction-ask"));

  expect(onAsk).toHaveBeenCalledWith(ONE_EXPRESSION);
  expect(screen.getByTestId("correction-card")).toBeOnTheScreen();
});

test("한국어 안내도 같은 카드로 열리고 상황에 맞는 제목과 설명을 보여 준다", async () => {
  const user = userEvent.setup();
  const { rendered } = renderNote({
    entries: [
      {
        fixed: "head home",
        original: "집에 가고",
        pattern: "head-home",
        why: "‘집에 가다’는 head home이라고 해요.",
      },
    ],
    fixed: "I want to head home.",
    messageId: "korean",
    original: "집에 가고 싶어.",
  });
  await rendered;
  await user.press(screen.getByLabelText("이럴 때 쓰는 영어 표현 보기"));
  expect(screen.getByText("이럴 때 쓰는 영어 표현")).toBeOnTheScreen();
  expect(
    screen.getByText("‘집에 가다’는 head home이라고 해요.")
  ).toBeOnTheScreen();
  expect(screen.queryByText("더 자연스러운 영어 표현")).toBeNull();
  await user.press(screen.getByLabelText("이럴 때 쓰는 영어 표현 접기"));
  expect(screen.queryByTestId("correction-card")).toBeNull();
});
