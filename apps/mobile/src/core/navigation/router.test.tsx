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

// Home now talks to the AI API, so it is stubbed here like every other screen:
// these tests are about which route renders, not about what the screen does.
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

jest.mock("@/screens/stories/stories-screen", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    StoriesScreen: () =>
      React.createElement(View, { accessibilityLabel: "Stories placeholder" }),
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

// The avatar button moved into HomeScreen's own toolbar, so the press-to-open
// wiring is covered in home-screen.test; this layer keeps proving the
// /settings route itself renders as a sheet over the tabs (공개 경로 테스트).

test("공개 경로 이동이 각 네이티브 탭의 화면을 표시한다", async () => {
  const router = renderRouter("./app", { initialUrl: "/" });
  await router;

  await act(() => {
    expoRouter.navigate("/stories");
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe("/stories");
    expect(screen.getByLabelText("Stories placeholder")).toBeOnTheScreen();
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

  await act(() => {
    expoRouter.navigate("/settings");
  });

  await waitFor(() => {
    expect(router.getPathname()).toBe("/settings");
    expect(screen.getByLabelText("Settings placeholder")).toBeOnTheScreen();
  });
});
