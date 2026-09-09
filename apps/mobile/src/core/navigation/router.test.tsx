import { beforeEach, expect, jest, test } from "@jest/globals";
import { router as expoRouter } from "expo-router";
import {
  act,
  renderRouter,
  screen,
  waitFor,
} from "expo-router/testing-library";

import {
  createFakeSession,
  resetFakeSupabase,
} from "@/shared/test/fake-supabase";

// 실제 라우터로 이동과 복귀를 확인한다. 본문 내용은 각 화면 테스트가 확인한다.
jest.mock("@/screens/home/home-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    HomeScreen: () =>
      React.createElement(View, { accessibilityLabel: "Home placeholder" }),
  };
});

// Every route below the root layout is behind the session guard, so these tests
// start from a signed-in app. The guard itself is covered in auth-routing.test.
jest.mock("@/shared/supabase/client", () => ({
  getSupabaseClient: () =>
    (
      require("@/shared/test/fake-supabase") as typeof import("@/shared/test/fake-supabase")
    ).getFakeSupabase().client,
}));

beforeEach(() => {
  resetFakeSupabase({ session: createFakeSession() });
});

jest.mock("@/screens/browse/browse-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    BrowseScreen: () =>
      React.createElement(View, { accessibilityLabel: "Browse placeholder" }),
  };
});

jest.mock("@/screens/stories/recent-stories-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    RecentStoriesScreen: () =>
      React.createElement(View, { accessibilityLabel: "Recent placeholder" }),
  };
});

jest.mock("@/screens/stories/story-records-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    StoryRecordsScreen: () =>
      React.createElement(View, { accessibilityLabel: "Records placeholder" }),
  };
});

jest.mock("@/screens/stories/story-detail-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    StoryDetailScreen: () =>
      React.createElement(View, {
        accessibilityLabel: "Story detail placeholder",
      }),
  };
});

jest.mock("@/screens/settings/settings-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    SettingsScreen: () =>
      React.createElement(View, { accessibilityLabel: "Settings placeholder" }),
  };
});

test("/에서 Home 탭의 첫 화면을 표시한다", async () => {
  const router = renderRouter("./app", { initialUrl: "/" });
  await router;

  // Opening the app waits for the session and then the profile, so the first
  // frame is deliberately neither screen.
  await waitFor(() => {
    expect(screen.getByLabelText("Home placeholder")).toBeOnTheScreen();
  });

  expect(router.getPathname()).toBe("/");
});

test("공통 대화 기록을 탐색에서 열고 닫으면 탐색으로 돌아간다", async () => {
  const rendered = renderRouter("./app", { initialUrl: "/browse" });
  await rendered;
  await waitFor(() => {
    expect(screen.getByLabelText("Browse placeholder")).toBeOnTheScreen();
  });
  await act(() => {
    expoRouter.push({
      params: { storyId: "10000000-0000-4000-8000-000000000001" },
      pathname: "/records/[storyId]",
    });
  });
  await waitFor(() => {
    expect(screen.getByLabelText("Records placeholder")).toBeOnTheScreen();
  });
  await act(() => expoRouter.back());
  await waitFor(() => expect(rendered.getPathname()).toBe("/browse"));
});

// The avatar button moved into HomeScreen's own toolbar, so the press-to-open
// wiring is covered in home-screen.test; this layer keeps proving the
// /settings route itself renders above the tabs (공개 경로 테스트).

test("공개 경로 이동이 각 네이티브 탭의 화면을 표시한다", async () => {
  const router = renderRouter("./app", { initialUrl: "/" });
  await router;

  await act(() => {
    expoRouter.navigate("/browse");
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe("/browse");
    expect(screen.getByLabelText("Browse placeholder")).toBeOnTheScreen();
  });

  await act(() => {
    expoRouter.navigate({
      params: { storyId: "10000000-0000-4000-8000-000000000001" },
      pathname: "/story/[storyId]",
    });
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe(
      "/story/10000000-0000-4000-8000-000000000001"
    );
    expect(screen.getByLabelText("Story detail placeholder")).toBeOnTheScreen();
  });

  // 기존 상세 경로에서도 기록을 열 수 있다.
  await act(() => {
    expoRouter.navigate({
      params: { storyId: "10000000-0000-4000-8000-000000000001" },
      pathname: "/story/[storyId]/records",
    });
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe(
      "/story/10000000-0000-4000-8000-000000000001/records"
    );
    expect(screen.getByLabelText("Records placeholder")).toBeOnTheScreen();
  });

  await act(() => {
    expoRouter.navigate("/stories");
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe("/stories");
    expect(screen.getByLabelText("Recent placeholder")).toBeOnTheScreen();
  });

  // 스토리 목록에서 사용하던 기록 URL도 유지한다.
  await act(() => {
    expoRouter.navigate({
      params: { storyId: "10000000-0000-4000-8000-000000000001" },
      pathname: "/records/[storyId]",
    });
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe(
      "/records/10000000-0000-4000-8000-000000000001"
    );
    expect(screen.getByLabelText("Records placeholder")).toBeOnTheScreen();
  });

  await act(() => {
    expoRouter.navigate("/settings");
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe("/settings");
    expect(screen.getByLabelText("Settings placeholder")).toBeOnTheScreen();
  });
});

const storyId = "10000000-0000-4000-8000-000000000001";

test.each([
  { entry: "/browse", records: false },
  { entry: "/browse", records: true },
  { entry: "/stories", records: true },
] as const)(
  "$entry에서 기록=$records 경로로 대화를 열고 다음 화를 거쳐도 들어온 순서로 돌아간다",
  async ({ entry, records }) => {
    const rendered = renderRouter("./app", { initialUrl: entry });
    await rendered;
    await waitFor(() => expect(rendered.getPathname()).toBe(entry));
    const returnPaths: string[] = [entry];

    if (entry === "/browse") {
      await act(() => {
        expoRouter.push({ params: { storyId }, pathname: "/story/[storyId]" });
      });
      const detail = `/story/${storyId}`;
      await waitFor(() => expect(rendered.getPathname()).toBe(detail));
      expect(rendered.getSegments()).not.toContain("(tabs)");
      returnPaths.unshift(detail);
    }

    if (records) {
      const pathname =
        entry === "/browse" ? "/story/[storyId]/records" : "/records/[storyId]";
      await act(() => expoRouter.push({ params: { storyId }, pathname }));
      const recordPath =
        entry === "/browse"
          ? `/story/${storyId}/records`
          : `/records/${storyId}`;
      await waitFor(() => expect(rendered.getPathname()).toBe(recordPath));
      expect(rendered.getSegments()).not.toContain("(tabs)");
      returnPaths.unshift(recordPath);
    }

    await act(() => expoRouter.push("/episode"));
    await waitFor(() => expect(rendered.getPathname()).toBe("/episode"));
    await act(() => {
      expoRouter.replace({
        params: { episodeId: "next-episode" },
        pathname: "/episode",
      });
    });
    await waitFor(() =>
      expect(rendered.getSearchParams()).toMatchObject({
        episodeId: "next-episode",
      })
    );

    for (const expected of returnPaths) {
      // biome-ignore lint/performance/noAwaitInLoops: 뒤로 가기는 앞선 화면 전환이 끝난 뒤 실행한다.
      await act(() => expoRouter.back());
      await waitFor(() => expect(rendered.getPathname()).toBe(expected));
    }
    expect(rendered.getSegments()).toContain("(tabs)");
  }
);
