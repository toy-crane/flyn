import { beforeEach, expect, jest, test } from "@jest/globals";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import Constants from "expo-constants";
import type { PropsWithChildren } from "react";
import { AccessibilityInfo, Alert, Linking, Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  createFakeSession,
  createProfileRow,
  resetFakeSupabase,
} from "@/shared/test/fake-supabase";
import {
  createTestQueryClient,
  renderWithHeroUI,
} from "@/shared/test/render-with-heroui";
import { SettingsScreen } from "./settings-screen";

/** The colours the root layout would hand this screen. */
const BACKGROUND = "#f4f4f6";
const DANGER = "#dc2626";
const MUTED = "#6b7280";
const SURFACE = "#ffffff";
const APP_VERSION = Constants.expoConfig?.version ?? "Unknown";

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("@/shared/supabase/client", () => ({
  getSupabaseClient: () =>
    (
      require("@/shared/test/fake-supabase") as typeof import("@/shared/test/fake-supabase")
    ).getFakeSupabase().client,
}));

jest.mock("@/shared/ui/action-progress", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  // The platform indicator itself is native. What a test can check is that it
  // appeared, so the stand-in is a node carrying the same testID.
  return {
    ActionProgress: ({ testID }: { testID?: string }) =>
      React.createElement(View, { testID }),
  };
});

jest.mock("@expo/ui", () => {
  const React = require("react") as typeof import("react");
  const {
    Pressable,
    Text: NativeText,
    View,
  } = require("react-native") as typeof import("react-native");
  const Container = ({
    children,
    style,
    testID,
  }: PropsWithChildren<{
    style?: import("react-native").ViewStyle;
    testID?: string;
  }>) => React.createElement(View, { style, testID }, children);
  const FieldGroup = Object.assign(Container, {
    Section: Container,
    SectionFooter: Container,
    SectionHeader: Container,
  });

  return {
    FieldGroup,
    Host: Container,
    /*
      A node of its own so a test can assert which symbol a row carries, and
      empty so it stays out of the row's accessible name — which is what
      `accessibilityHidden` does to the real one.
    */
    Icon: ({ name }: { name: string }) =>
      React.createElement(View, { testID: `icon-${name}` }),
    // A native list row takes a press anywhere across it and reads its own text
    // as its accessible name, so the stand-in does the same.
    ListItem: ({
      children,
      leading,
      onPress,
      testID,
      trailing,
    }: PropsWithChildren<{
      leading?: React.ReactNode;
      onPress?: () => void;
      testID?: string;
      trailing?: React.ReactNode;
    }>) =>
      React.createElement(
        Pressable,
        { accessibilityRole: "button", onPress, testID },
        leading,
        children,
        trailing
      ),
    // Hosts plain React Native children inside the native tree, which is exactly
    // what a View does here.
    RNHostView: Container,
    Row: ({
      children,
      onPress,
      testID,
    }: PropsWithChildren<{ onPress?: () => void; testID?: string }>) =>
      onPress
        ? React.createElement(
            Pressable,
            { accessibilityRole: "button", onPress, testID },
            children
          )
        : React.createElement(View, { testID }, children),
    Spacer: Container,
    Text: ({
      children,
      testID,
      textStyle,
    }: PropsWithChildren<{
      testID?: string;
      textStyle?: import("react-native").TextStyle;
    }>) =>
      React.createElement(NativeText, { style: textStyle, testID }, children),
  };
});

const mockUseAuthSession = jest.mocked(useAuthSession);

beforeEach(() => {
  resetFakeSupabase({ session: createFakeSession() });
  mockUseAuthSession.mockReturnValue({
    session: createFakeSession(),
    status: "signedIn",
  });
});

function renderSettings({
  onOpenProfile = () => {
    // Most tests are about something else on this screen.
  },
  onOpenThemeMode = () => {
    // Same.
  },
  queryClient = createTestQueryClient(),
  themePreference = "system" as const,
}: {
  onOpenProfile?: () => void;
  onOpenThemeMode?: () => void;
  queryClient?: QueryClient;
  themePreference?: "dark" | "light" | "system";
} = {}) {
  return renderWithHeroUI(
    <QueryClientProvider client={queryClient}>
      <SettingsScreen
        background={BACKGROUND}
        danger={DANGER}
        muted={MUTED}
        onOpenProfile={onOpenProfile}
        onOpenThemeMode={onOpenThemeMode}
        surface={SURFACE}
        themePreference={themePreference}
      />
    </QueryClientProvider>
  );
}

test("로그아웃은 현재 기기 세션만 끝낸다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });

  await renderSettings();

  fireEvent.press(screen.getByRole("button", { name: "로그아웃" }));

  await waitFor(() => {
    expect(fake.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});

test("로그아웃이 끝나기 전에는 같은 버튼을 다시 실행하지 않는다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  let release = () => {
    // Replaced by the pending implementation below.
  };

  fake.auth.signOut.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ error: null });
      })
  );

  await renderSettings();

  await act(() => {
    fireEvent.press(screen.getByRole("button", { name: "로그아웃" }));
  });

  // The button keeps its name for the whole action; only the indicator appears.
  expect(await screen.findByTestId("sign-out-progress")).toBeOnTheScreen();
  expect(screen.queryByText("로그아웃 중")).toBeNull();

  const pending = screen.getByRole("button", { name: "로그아웃" });

  await act(() => {
    fireEvent.press(pending);
    fireEvent.press(pending);
  });

  await act(() => {
    release();
  });

  expect(fake.auth.signOut).toHaveBeenCalledTimes(1);
});

test("Android는 로그아웃이 시작되면 진행 중임을 화면 읽기에 알린다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  const platform = jest.replaceProperty(Platform, "OS", "android");
  let release = () => {
    // Replaced by the pending implementation below.
  };

  fake.auth.signOut.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ error: null });
      })
  );

  try {
    await renderSettings();

    expect(announce).not.toHaveBeenCalled();

    await act(() => {
      fireEvent.press(screen.getByRole("button", { name: "로그아웃" }));
    });

    expect(announce).toHaveBeenCalledWith("로그아웃 진행 중");

    await act(() => {
      release();
    });
  } finally {
    platform.restore();
    announce.mockRestore();
  }
});

test("로그아웃이 실패해도 이전 사용자의 캐시는 남기지 않는다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const queryClient = createTestQueryClient();

  fake.auth.signOut.mockResolvedValueOnce({
    error: new Error("Network request failed"),
  } as never);

  await renderSettings({ queryClient });

  queryClient.setQueryData(["notes"], ["이전 사용자의 데이터"]);

  await act(() => {
    fireEvent.press(screen.getByRole("button", { name: "로그아웃" }));
  });

  // The cache is emptied whatever else failed, so the next person to sign in on
  // this device cannot read what the previous one left behind.
  await waitFor(() => {
    expect(queryClient.getQueryData(["notes"])).toBeUndefined();
  });

  expect(await screen.findByTestId("sign-out-error")).toBeOnTheScreen();
});

test("현재 공개 프로필을 화면 위에 보여 준다", async () => {
  resetFakeSupabase({
    profile: createProfileRow({
      display_name: "김민서",
      username: "minseokim",
    }),
    session: createFakeSession(),
  });

  await renderSettings();

  // The header is on screen before the profile read answers, so waiting for the
  // element is not the same as waiting for the values in it.
  await waitFor(() => {
    expect(screen.getByTestId("settings-profile-name")).toHaveTextContent(
      "김민서"
    );
  });
  // No `@` in front: the app has no mentions and no profile addresses, so the id
  // is shown exactly as it is stored and typed.
  expect(screen.getByTestId("settings-profile-username")).toHaveTextContent(
    "minseokim"
  );
  expect(screen.queryByText("@minseokim")).toBeNull();
});

test("프로필 사진과 프로필 행이 같은 화면을 연다", async () => {
  const onOpenProfile = jest.fn();
  const user = userEvent.setup();

  await renderSettings({ onOpenProfile });

  await user.press(await screen.findByTestId("settings-profile-photo"));
  await user.press(screen.getByTestId("profile-row"));

  // Both entry points, one destination: a photo menu opening straight from
  // Settings would split saving the picture from saving the rest of the profile.
  expect(onOpenProfile).toHaveBeenCalledTimes(2);
});

test("로그인한 계정의 이메일을 계정 섹션에서 보여 준다", async () => {
  await renderSettings();

  // Three sign-in methods lead to the same app, and the nickname above says who
  // a person is to other people rather than which login they arrived on.
  expect(
    within(screen.getByTestId("account-email-row")).getByText(
      createFakeSession().user.email ?? ""
    )
  ).toBeOnTheScreen();
});

test("이메일이 없는 세션에는 없다고 밝힌다", async () => {
  const session = createFakeSession();

  mockUseAuthSession.mockReturnValue({
    session: { ...session, user: { ...session.user, email: undefined } },
    status: "signedIn",
  });

  await renderSettings();

  expect(
    within(screen.getByTestId("account-email-row")).getByText(
      "이메일 정보 없음"
    )
  ).toBeOnTheScreen();
});

test("계정 삭제는 화면 맨 아래 이름 없는 그룹에 혼자 선다", async () => {
  await renderSettings();

  const sections = screen.getByTestId("settings-field-group").props.children;

  // Nothing follows it and nothing shares the group. That placement, the empty
  // title and the red word are what warn before the press; the confirmation
  // carries the rest.
  expect(sections.at(-1).props.testID).toBe("account-deletion-section");
  expect(sections.at(-1).props.title).toBeUndefined();
  expect(
    within(screen.getByTestId("delete-account-row")).getByText("계정 삭제")
  ).toBeOnTheScreen();
});

test("설정에서 빨간 글자는 계정 삭제 하나뿐이다", async () => {
  await renderSettings();

  // 로그아웃 also ends something, but it can be undone by signing in again.
  // Two red rows would take weight from the one that cannot.
  expect(screen.getByText("계정 삭제").props.style).toEqual({ color: DANGER });
  expect(screen.getByText("로그아웃").props.style).toBeUndefined();
});

test("아무 일도 하지 않던 알림과 햅틱 스위치는 없다", async () => {
  await renderSettings();

  // They held state and nothing else. A control that does not do what it says
  // is worse than an absent one.
  expect(screen.queryByText("알림")).toBeNull();
  expect(screen.queryByText("햅틱 반응")).toBeNull();
  expect(screen.queryByTestId("notifications-switch")).toBeNull();
  expect(screen.queryByTestId("haptics-switch")).toBeNull();
});

test("화면 모드 행이 현재 값을 보여 주고 전용 화면을 연다", async () => {
  const onOpenThemeMode = jest.fn();
  const user = userEvent.setup();

  await renderSettings({ onOpenThemeMode, themePreference: "dark" });

  // The value is on the row, so what the mode is now needs no press to read.
  expect(
    within(screen.getByTestId("theme-mode-row")).getByText("다크")
  ).toBeOnTheScreen();

  await user.press(screen.getByTestId("theme-mode-row"));

  expect(onOpenThemeMode).toHaveBeenCalledTimes(1);
});

test("앱 밖으로 나가는 세 행은 각자의 주소를 시스템에 넘긴다", async () => {
  const openURL = jest
    .spyOn(Linking, "openURL")
    .mockResolvedValue(true as never);
  const user = userEvent.setup();

  try {
    await renderSettings();

    await user.press(screen.getByTestId("terms-row"));
    await user.press(screen.getByTestId("privacy-row"));
    await user.press(screen.getByTestId("support-row"));

    expect(openURL).toHaveBeenNthCalledWith(1, "https://example.com/terms");
    expect(openURL).toHaveBeenNthCalledWith(2, "https://example.com/privacy");
    expect(openURL).toHaveBeenNthCalledWith(3, "mailto:support@example.com");
  } finally {
    openURL.mockRestore();
  }
});

test("메일 앱을 열지 못하면 지원 섹션에서 그렇게 말한다", async () => {
  const openURL = jest
    .spyOn(Linking, "openURL")
    .mockRejectedValue(new Error("No handler"));
  const user = userEvent.setup();

  try {
    await renderSettings();

    await user.press(screen.getByTestId("support-row"));

    // A device with no mail app rejects `mailto:`, and without this the row
    // would look like one that does nothing when pressed.
    expect(await screen.findByTestId("support-mail-error")).toHaveTextContent(
      "메일 앱을 열지 못했습니다."
    );
  } finally {
    openURL.mockRestore();
  }
});

test("섹션이 확정된 순서로 서고 각자의 행만 담는다", async () => {
  await renderSettings();

  const sections = screen.getByTestId("settings-field-group").props.children;

  expect(
    sections.map(
      (section: { props: { testID?: string } }) => section.props.testID
    )
  ).toEqual([
    undefined,
    "account-section",
    "preferences-section",
    "support-section",
    "app-info-section",
    "account-deletion-section",
  ]);
  const appInfo = within(screen.getByTestId("app-info-section"));

  expect(
    within(screen.getByTestId("account-section")).getByText("이메일")
  ).toBeOnTheScreen();
  expect(
    within(screen.getByTestId("preferences-section")).getByText("화면 모드")
  ).toBeOnTheScreen();
  expect(
    within(screen.getByTestId("support-section")).getByText("문의하기")
  ).toBeOnTheScreen();
  expect(appInfo.getByText("이용약관")).toBeOnTheScreen();
  expect(appInfo.getByText("개인정보 처리방침")).toBeOnTheScreen();
});

test("iOS 설정 텍스트는 네이티브 기본 색상을 그대로 쓴다", async () => {
  const view = await renderSettings();

  expect(view.getByText("버전").props.style).toBeUndefined();
});

test("버전 행은 값만 보여 주고 누를 수 없다", async () => {
  await renderSettings();

  const versionRow = screen.getByTestId("version-row");

  expect(within(versionRow).getByText(APP_VERSION)).toBeOnTheScreen();
  expect(versionRow.props.accessibilityRole).toBeUndefined();
});

test("Android 설정은 헤더 높이만큼 여백을 더하지 않는다", async () => {
  const platform = jest.replaceProperty(Platform, "OS", "android");

  try {
    const view = await renderSettings();

    // The Android app bar is opaque now, so the form starts under it rather
    // than behind it and no screen adds a top inset of its own.
    expect(view.getByTestId("settings-field-group").props.style).toEqual({
      backgroundColor: BACKGROUND,
    });
  } finally {
    platform.restore();
  }
});

/**
 * Stands in for the platform dialog 계정 삭제 raises.
 *
 * Deletion only ever starts from inside it, so a test that cannot answer the
 * dialog cannot reach the request either.
 */
function captureDeletionDialog() {
  let buttons: import("react-native").AlertButton[] = [];
  const alert = jest
    .spyOn(Alert, "alert")
    .mockImplementation((_title, _message, given) => {
      buttons = given ?? [];
    });

  return {
    alert,
    press(text: string) {
      const button = buttons.find((candidate) => candidate.text === text);

      if (!button) {
        throw new Error(`${text} 확인창 버튼이 없습니다.`);
      }

      return button.onPress?.();
    },
  };
}

async function openDeletionDialog() {
  await act(() => {
    fireEvent.press(screen.getByTestId("delete-account-row"));
  });
}

test("계정 삭제는 화면을 옮기지 않고 그 자리에서 확인창을 연다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const dialog = captureDeletionDialog();

  await renderSettings();

  // No standing note under the row. Its last place, the spacing and the red
  // word are the warning; the dialog names what cannot be undone.
  expect(screen.queryByTestId("account-deletion-notice")).toBeNull();

  await openDeletionDialog();

  expect(dialog.alert).toHaveBeenCalledWith(
    "계정을 삭제할까요?",
    "지금 삭제하면 되돌릴 수 없습니다. 다시 가입해도 이전 정보는 돌아오지 않습니다.",
    expect.arrayContaining([
      expect.objectContaining({ style: "cancel", text: "취소" }),
      expect.objectContaining({ style: "destructive", text: "계정 삭제" }),
    ])
  );
  expect(fake.functions.invoke).not.toHaveBeenCalled();

  dialog.press("취소");

  expect(fake.functions.invoke).not.toHaveBeenCalled();
  dialog.alert.mockRestore();
});

test("확인 뒤 한 번만 삭제하고 기기 로그인과 사용자 캐시를 지운다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const queryClient = createTestQueryClient();
  const dialog = captureDeletionDialog();
  let finishDeletion = () => {
    // Replaced by the pending call below.
  };

  fake.functions.invoke.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishDeletion = () =>
          resolve({ data: { deleted: true }, error: null });
      })
  );

  await renderSettings({ queryClient });
  queryClient.setQueryData(["notes"], ["현재 사용자의 데이터"]);

  await openDeletionDialog();
  await act(() => {
    dialog.press("계정 삭제");
  });

  // The row keeps its name for the whole action; only the indicator appears.
  expect(
    await screen.findByTestId("delete-account-progress")
  ).toBeOnTheScreen();
  expect(screen.getByText("계정 삭제")).toBeOnTheScreen();
  expect(screen.queryByText("계정 삭제 중")).toBeNull();

  // The row is showing progress, so pressing it again offers no second dialog
  // and sends no second request.
  await openDeletionDialog();
  expect(dialog.alert).toHaveBeenCalledTimes(1);

  await act(async () => {
    finishDeletion();
    await Promise.resolve();
  });

  await waitFor(() => {
    expect(fake.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  expect(fake.functions.invoke).toHaveBeenCalledTimes(1);
  expect(queryClient.getQueryData(["notes"])).toBeUndefined();
  dialog.alert.mockRestore();
});

test("Android는 삭제가 시작되면 진행 중임을 화면 읽기에 알린다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const dialog = captureDeletionDialog();
  const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  const platform = jest.replaceProperty(Platform, "OS", "android");
  let finishDeletion = () => {
    // Replaced by the pending call below.
  };

  fake.functions.invoke.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishDeletion = () =>
          resolve({ data: { deleted: true }, error: null });
      })
  );

  try {
    await renderSettings();

    await openDeletionDialog();
    await act(() => {
      dialog.press("계정 삭제");
    });

    // The row cannot hold the state on Android, so the announcement carries the
    // action's own name rather than 진행 중 alone.
    expect(announce).toHaveBeenCalledWith("계정 삭제 진행 중");

    await act(async () => {
      finishDeletion();
      await Promise.resolve();
    });
  } finally {
    platform.restore();
    announce.mockRestore();
    dialog.alert.mockRestore();
  }
});

test("삭제가 실패하면 같은 그룹의 푸터에 안내가 서고 다시 시도할 수 있다", async () => {
  const fake = resetFakeSupabase({ session: createFakeSession() });
  const queryClient = createTestQueryClient();
  const dialog = captureDeletionDialog();

  fake.functions.invoke.mockResolvedValueOnce({
    data: null,
    error: new Error("Network request failed"),
  } as never);

  await renderSettings({ queryClient });
  queryClient.setQueryData(["notes"], ["현재 사용자의 데이터"]);

  await openDeletionDialog();
  await act(async () => {
    await dialog.press("계정 삭제");
  });

  // The account outlived the attempt, so the session and the screen stay put
  // and the same row can send it again.
  expect(await screen.findByTestId("account-deletion-error")).toHaveTextContent(
    "계정 삭제를 끝내지 못했습니다. 다시 시도해 주세요."
  );
  expect(fake.auth.signOut).not.toHaveBeenCalled();
  expect(queryClient.getQueryData(["notes"])).toEqual(["현재 사용자의 데이터"]);

  await openDeletionDialog();
  await act(async () => {
    await dialog.press("계정 삭제");
  });

  expect(fake.functions.invoke).toHaveBeenCalledTimes(2);
  expect(fake.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(queryClient.getQueryData(["notes"])).toBeUndefined();
  dialog.alert.mockRestore();
});
