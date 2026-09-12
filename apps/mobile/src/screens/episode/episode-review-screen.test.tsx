import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import type { ExpressionResult } from "@/features/episode/api/episode-correction";
import type { SavedExpressionRef } from "@/features/episode/api/saved-expression";
import { EpisodeSavedExpressionsProvider } from "@/features/episode/state/saved-expressions";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeReviewScreen } from "./episode-review-screen";

const START_EPISODE = /화 시작하기/;

const context = {
  episode: {
    episodeId: "one",
    number: 1,
    preview: "",
    situation: "주문을 바꿔 보세요",
    situationEmoji: "☕",
    title: "잘못 나온 커피",
  },
  nextUp: {
    copy: "카드가 자꾸 튕겨요.",
    episodeId: "two",
    number: 2,
    title: "계산대에서",
  },
  story: { id: "story", title: "우리 동네 카페" },
  storyPlayId: "play",
};
const ready: ExpressionResult = {
  correction: {
    entries: [
      {
        fixed: "a latte",
        original: "latte",
        pattern: "article",
        why: "한 잔을 말할 때 a를 붙여요.",
      },
    ],
    fixed: "I ordered a latte.",
    messageId: "m1",
    original: "I ordered latte.",
    review: {
      example: "I ordered a sandwich.",
      exampleMeaning: "샌드위치를 주문했어요.",
      meaning: "라테를 주문했어요.",
      situation: "주문한 것을 다시 말할 때",
    },
  },
  messageId: "m1",
  status: "corrected",
};
const base = {
  context,
  isLoading: false,
  isRetrying: false,
  onContinue: jest.fn(),
  onRetry: jest.fn(),
};

test("준비된 표현만 개수 없이 세우고 눌러야 원문과 이유가 열린다", async () => {
  const user = userEvent.setup();
  await renderWithHeroUI(
    <EpisodeReviewScreen
      {...base}
      results={[
        ready,
        { messageId: "m2", status: "natural" },
        { messageId: "m3", status: "unclear" },
      ]}
    />
  );
  expect(screen.getByText("기억해 둘 표현")).toBeOnTheScreen();
  expect(screen.queryByText("1개")).toBeNull();
  expect(screen.getByText("주문한 것을 다시 말할 때")).toBeOnTheScreen();
  expect(screen.getByText("라테를 주문했어요.")).toBeOnTheScreen();
  expect(screen.queryByText("안 본 표현")).toBeNull();
  expect(screen.queryByText("I ordered latte.")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "내 대화와 다른 예문" })
  ).toBeNull();

  await user.press(screen.getByTestId("expression-card-m1-body"));

  expect(screen.getByText("내가 쓴 문장")).toBeOnTheScreen();
  expect(screen.getByText("I ordered latte.")).toBeOnTheScreen();
  expect(screen.getByText("이렇게 쓰는 이유")).toBeOnTheScreen();
  expect(screen.getByText("한 잔을 말할 때 a를 붙여요.")).toBeOnTheScreen();
  // 서버는 예문을 그대로 만들고 저장한다. 이 화면에서만 빠진다.
  expect(screen.queryByText("다른 상황에서")).toBeNull();
  expect(screen.queryByText("I ordered a sandwich.")).toBeNull();
  expect(screen.queryByText("샌드위치를 주문했어요.")).toBeNull();
});

test("카드 아래 오른쪽에 복사와 책갈피가 서고 담긴 것은 채워져 온다", async () => {
  // 저장소는 대화와 이 화면 위 층에 있다. 실제 앱에서는 에피소드 레이아웃이
  // 그 층을 세운다.
  const review = (saved?: SavedExpressionRef[]) => (
    <EpisodeSavedExpressionsProvider accessToken={undefined}>
      <EpisodeReviewScreen
        {...base}
        results={[ready]}
        savedExpressions={saved}
      />
    </EpisodeSavedExpressionsProvider>
  );
  const view = await renderWithHeroUI(review());

  expect(screen.getByRole("button", { name: "표현 복사" })).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "표현 저장" })).toBeOnTheScreen();

  // 대화에서 먼저 담은 표현은 서버가 아는 자리로 실려 와 채워진 채로 선다.
  await view.rerender(
    review([
      { id: "saved-1", kind: "correction", messageId: "m1", utteranceAt: null },
    ])
  );

  expect(screen.getByRole("button", { name: "저장 취소" })).toBeOnTheScreen();
});

test("카드가 없으면 제목과 개수, 개별 재시도 없이 중립적인 빈 상태를 보여 준다", async () => {
  await renderWithHeroUI(<EpisodeReviewScreen {...base} results={[]} />);
  expect(
    screen.getByText("이번 대화에는 안내한 표현이 없어요")
  ).toBeOnTheScreen();
  expect(screen.queryByText("기억해 둘 표현")).toBeNull();
  expect(screen.queryByText("0개")).toBeNull();
  expect(screen.queryByText("표현을 확인하지 못했어요")).toBeNull();
  expect(screen.queryByLabelText("표현 다시 확인")).toBeNull();
  expect(screen.getByRole("button", { name: "2화 시작하기" })).toBeEnabled();
});

test("조회 중에는 빈 결과로 단정하지 않고 하단 이동을 유지한다", async () => {
  await renderWithHeroUI(<EpisodeReviewScreen {...base} isLoading />);
  expect(screen.queryByText("이번 대화에는 안내한 표현이 없어요")).toBeNull();
  expect(screen.queryByText("기억해 둘 표현")).toBeNull();
  expect(screen.getByRole("button", { name: "2화 시작하기" })).toBeEnabled();
});

test("조회 재시도 중에도 오류 안내와 이동은 유지하고 재조회 버튼만 잠근다", async () => {
  await renderWithHeroUI(<EpisodeReviewScreen {...base} isRetrying />);
  expect(screen.getByText("표현을 불러오지 못했어요")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "다시 시도하기" })).toHaveProp(
    "accessibilityState",
    { busy: true, disabled: true }
  );
  expect(screen.getByRole("button", { name: "2화 시작하기" })).toBeEnabled();
});

test("끝난 다음 화는 다시 보고 마지막 화는 대화 기록으로 이동한다", async () => {
  const onContinue = jest.fn();
  const user = userEvent.setup();
  const view = await renderWithHeroUI(
    <EpisodeReviewScreen
      {...base}
      context={{ ...context, nextUp: { ...context.nextUp, isCompleted: true } }}
      onContinue={onContinue}
      results={[]}
    />
  );
  await user.press(screen.getByRole("button", { name: "2화 다시 보기" }));
  expect(onContinue).toHaveBeenCalledTimes(1);
  await view.rerender(
    <EpisodeReviewScreen
      {...base}
      context={{
        ...context,
        nextUp: { copy: "", episodeId: null, number: null, title: "" },
      }}
      results={[]}
    />
  );
  expect(screen.getByText("마지막 이야기까지 함께했어요")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "대화 기록 보기" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: START_EPISODE })).toBeNull();
});
