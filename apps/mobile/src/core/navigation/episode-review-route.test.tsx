import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import EpisodeReviewRoute from "../../../app/episode/review";

const initialContext = {
  episode: { episodeId: "one", number: 1, title: "카페에서" },
  nextUp: {
    copy: "카드가 튕겨요.",
    episodeId: "two",
    number: 2,
    title: "계산대에서",
  },
  story: { id: "story", title: "우리 동네 카페" },
  storyPlayId: "play",
};
let mockContext = initialContext;
jest.mock("@/features/episode/state/episode-review", () => ({
  useEpisodeReview: () => ({ current: mockContext }),
}));
jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({
    session: { access_token: "token", user: { id: "user" } },
  }),
}));
jest.mock("@/core/theme/app-theme-bridge", () => ({
  useAppTheme: () => ({ background: "#000" }),
}));
jest.mock("@/shared/ui/toolbar-icons", () => ({
  toolbarIcon: (name: string) => name,
}));
jest.mock("@/shared/ai/request-options", () => ({
  aiUrl: (path: string) => `https://example.test${path}`,
}));
jest.mock("expo-router", () => {
  const React = require("react") as typeof import("react");
  const { View, Pressable } =
    require("react-native") as typeof import("react-native");
  const Toolbar = Object.assign(
    ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, {}, children),
    {
      Button: ({
        accessibilityLabel,
        onPress,
      }: {
        accessibilityLabel: string;
        onPress: () => void;
      }) =>
        React.createElement(Pressable, {
          accessibilityLabel,
          accessibilityRole: "button",
          onPress,
        }),
    }
  );
  return {
    Redirect: () => null,
    router: { dismissTo: jest.fn() },
    Stack: { Screen: () => null, Toolbar },
    useLocalSearchParams: () => ({
      episodeId: mockContext.episode.episodeId,
      storyPlayId: mockContext.storyPlayId,
    }),
  };
});
const originalFetch = globalThis.fetch;
const card = {
  correction: {
    entries: [
      {
        fixed: "a latte",
        original: "latte",
        pattern: "article",
        why: "a를 붙여요.",
      },
    ],
    fixed: "I ordered a latte.",
    messageId: "m1",
    original: "I ordered latte.",
    review: {
      example: "I ordered a tea.",
      exampleMeaning: "차를 주문했어요.",
      meaning: "라테를 주문했어요.",
      situation: "주문을 확인할 때",
    },
  },
  messageId: "m1",
  status: "corrected",
};
beforeEach(() => {
  mockContext = initialContext;
  jest.mocked(router.dismissTo).mockClear();
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("목록 조회 중 홈으로 나갈 수 있고 화면을 떠나면 조회를 중단한다", async () => {
  let finish: ((value: Response) => void) | undefined;
  let requestSignal: AbortSignal | null | undefined;
  globalThis.fetch = jest.fn<typeof fetch>(async (_url, options) => {
    requestSignal = options?.signal;
    return await new Promise((resolve) => {
      finish = resolve;
    });
  }) as typeof fetch;
  const user = userEvent.setup();
  const view = await renderWithHeroUI(<EpisodeReviewRoute />);
  await waitFor(() => expect(finish).toBeDefined());
  expect(screen.queryByText("이번 대화에는 안내한 표현이 없어요")).toBeNull();
  await user.press(screen.getByRole("button", { name: "홈으로 이동" }));
  expect(router.dismissTo).toHaveBeenCalledWith("/(tabs)/(home)");
  await view.unmount();
  expect(requestSignal?.aborted).toBe(true);
  await act(() => {
    finish?.(Response.json({ expressionResults: [card] }));
  });
});

test("조회 재시도를 겹치지 않고 오류와 다음 화 이동을 유지한다", async () => {
  let finish: ((value: Response) => void) | undefined;
  let count = 0;
  const mockFetch = jest.fn<typeof fetch>(async () => {
    count += 1;
    if (count <= 2) {
      return new Response(null, { status: 503 });
    }
    return await new Promise((resolve) => {
      finish = resolve;
    });
  });
  globalThis.fetch = mockFetch as typeof fetch;
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeReviewRoute />);
  await screen.findByText("표현을 불러오지 못했어요.", {}, { timeout: 4000 });
  const retry = screen.getByRole("button", { name: "다시 시도하기" });
  await user.press(retry);
  await user.press(retry);
  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect(screen.getByText("표현을 불러오지 못했어요.")).toBeOnTheScreen();
  expect(retry).toBeDisabled();
  expect(screen.getByRole("button", { name: "2화 시작하기" })).toBeEnabled();
  await act(() => {
    finish?.(
      Response.json({
        expressionResults: [card, { messageId: "m2", status: "natural" }],
      })
    );
  });
  await screen.findByText("라테를 주문했어요.");
  await user.press(screen.getByRole("button", { name: "2화 시작하기" }));
  expect(router.dismissTo).toHaveBeenCalledWith({
    params: { episodeId: "two", storyPlayId: "play" },
    pathname: "/episode",
  });
  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect(mockFetch.mock.calls.every(([, options]) => !options?.body)).toBe(
    true
  );
});

test("다른 화로 바뀐 뒤 지난 화의 응답이 도착해도 카드를 섞지 않는다", async () => {
  let finishOld: ((value: Response) => void) | undefined;
  globalThis.fetch = jest.fn<typeof fetch>(async (url) => {
    if (String(url).includes("/one?")) {
      return await new Promise((resolve) => {
        finishOld = resolve;
      });
    }
    return Response.json({ expressionResults: [] });
  }) as typeof fetch;
  const view = await renderWithHeroUI(<EpisodeReviewRoute />);
  await waitFor(() => expect(finishOld).toBeDefined());
  mockContext = {
    ...initialContext,
    episode: { ...initialContext.episode, episodeId: "two", number: 2 },
  };
  await view.rerender(<EpisodeReviewRoute />);
  await screen.findByText("이번 대화에는 안내한 표현이 없어요");
  await act(() => {
    finishOld?.(Response.json({ expressionResults: [card] }));
  });
  expect(screen.queryByText("라테를 주문했어요.")).toBeNull();
  expect(screen.queryByText("기억해 둘 표현")).toBeNull();
});
