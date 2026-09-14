import { afterEach, expect, jest, test } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { openURL } from "expo-linking";
import type { ReactNode } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { readVersionPolicy } from "./read-version-policy";
import { useAppVersionGate } from "./use-app-version-gate";

jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.1.9" }));
jest.mock("expo-updates", () => ({ channel: "internal" }));
jest.mock("expo-linking", () => ({ openURL: jest.fn() }));
jest.mock("./read-version-policy", () => ({ readVersionPolicy: jest.fn() }));

const INSTALL_URL = "https://testflight.apple.com/join/example";
const mockedRead = jest.mocked(readVersionPolicy);
const mockedOpen = jest.mocked(openURL);

function renderGate() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Number.POSITIVE_INFINITY, retry: false },
    },
  });
  return renderHook(() => useAppVersionGate(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

function watchAppState() {
  let notify: ((state: AppStateStatus) => void) | undefined;
  const original = AppState.addEventListener;
  AppState.addEventListener = ((_event, callback) => {
    notify = callback;
    return { remove: jest.fn() };
  }) as typeof AppState.addEventListener;
  return {
    restore() {
      AppState.addEventListener = original;
    },
    async send(state: AppStateStatus) {
      await act(async () => notify?.(state));
    },
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test("시작 확인이 끝날 때까지 기다리고 낮은 설치 버전을 막으며 앱을 다시 열면 NULL을 반영한다", async () => {
  let resolveFirst:
    | ((policy: { minimum_version: string; install_url: string }) => void)
    | undefined;
  mockedRead
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    )
    .mockResolvedValueOnce({ install_url: INSTALL_URL, minimum_version: null });
  const appState = watchAppState();
  try {
    const gate = await renderGate();
    expect(gate.result.current.status).toBe("checking");
    await act(async () =>
      resolveFirst?.({ install_url: INSTALL_URL, minimum_version: "1.2.0" })
    );
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    expect(gate.result.current.installUrl).toBe(INSTALL_URL);

    await gate.unmount();
    const reopened = await renderGate();
    await waitFor(() => expect(reopened.result.current.status).toBe("allowed"));
    expect(mockedRead).toHaveBeenCalledTimes(2);
    await reopened.unmount();
  } finally {
    appState.restore();
  }
});

test("차단 중 설치 화면 복귀 확인이 실패해도 차단을 유지하고, 일반 복귀는 5분 안에 다시 읽지 않는다", async () => {
  mockedRead
    .mockResolvedValueOnce({
      install_url: INSTALL_URL,
      minimum_version: "1.2.0",
    })
    .mockRejectedValueOnce(new Error("offline"));
  mockedOpen.mockResolvedValue(true);
  const appState = watchAppState();
  let now = 10_000;
  jest.spyOn(Date, "now").mockImplementation(() => now);
  try {
    const gate = await renderGate();
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    now += 60_000;
    await appState.send("background");
    await appState.send("active");
    expect(mockedRead).toHaveBeenCalledTimes(1);

    await act(async () => gate.result.current.openInstall());
    await appState.send("background");
    await appState.send("active");
    await waitFor(() => expect(gate.result.current.checkError).toBe(true));
    expect(gate.result.current.status).toBe("blocked");
    expect(gate.result.current.checkError).toBe(true);
    gate.unmount();
  } finally {
    appState.restore();
  }
});

test("설치 화면에서 돌아오면 5분을 기다리지 않고 다시 확인한다", async () => {
  mockedRead
    .mockResolvedValueOnce({
      install_url: INSTALL_URL,
      minimum_version: "1.2.0",
    })
    .mockResolvedValueOnce({
      install_url: INSTALL_URL,
      minimum_version: "1.2.0",
    });
  mockedOpen.mockResolvedValue(true);
  const appState = watchAppState();
  try {
    const gate = await renderGate();
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    await act(async () => gate.result.current.openInstall());
    expect(mockedOpen).toHaveBeenCalledWith(INSTALL_URL);
    await appState.send("background");
    await appState.send("active");
    await waitFor(() => expect(mockedRead).toHaveBeenCalledTimes(2));
    expect(mockedRead).toHaveBeenCalledTimes(2);
    expect(gate.result.current.status).toBe("blocked");
    gate.unmount();
  } finally {
    appState.restore();
  }
});

test("5분 뒤 앱으로 돌아오면 새 정책을 읽어 차단한다", async () => {
  mockedRead
    .mockResolvedValueOnce({ install_url: null, minimum_version: null })
    .mockResolvedValueOnce({
      install_url: INSTALL_URL,
      minimum_version: "1.2.0",
    });
  const appState = watchAppState();
  let now = 10_000;
  jest.spyOn(Date, "now").mockImplementation(() => now);
  try {
    const gate = await renderGate();
    await waitFor(() => expect(gate.result.current.status).toBe("allowed"));
    now += 5 * 60 * 1000;
    await appState.send("background");
    await appState.send("active");
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    expect(mockedRead).toHaveBeenCalledTimes(2);
    gate.unmount();
  } finally {
    appState.restore();
  }
});

test("설치 화면을 열지 못해도 차단을 유지하고 오류를 알린다", async () => {
  mockedRead.mockResolvedValueOnce({
    install_url: INSTALL_URL,
    minimum_version: "1.2.0",
  });
  mockedOpen.mockRejectedValueOnce(new Error("no handler"));
  const appState = watchAppState();
  try {
    const gate = await renderGate();
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    await act(async () => gate.result.current.openInstall());
    expect(gate.result.current.openError).toBe(true);
    expect(gate.result.current.status).toBe("blocked");
    gate.unmount();
  } finally {
    appState.restore();
  }
});

test("설치 화면 복귀 확인 중 연속 복귀해도 정책 요청은 한 번만 보낸다", async () => {
  let resolveRetry:
    | ((policy: {
        install_url: string | null;
        minimum_version: string | null;
      }) => void)
    | undefined;
  mockedRead
    .mockResolvedValueOnce({
      install_url: INSTALL_URL,
      minimum_version: "1.2.0",
    })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRetry = resolve;
        })
    );
  mockedOpen.mockResolvedValue(true);
  const appState = watchAppState();
  try {
    const gate = await renderGate();
    await waitFor(() => expect(gate.result.current.status).toBe("blocked"));
    await act(async () => gate.result.current.openInstall());
    await appState.send("background");
    await appState.send("active");
    await appState.send("background");
    await appState.send("active");
    expect(mockedRead).toHaveBeenCalledTimes(2);
    await act(async () =>
      resolveRetry?.({ install_url: null, minimum_version: null })
    );
    await waitFor(() => expect(gate.result.current.status).toBe("allowed"));
    gate.unmount();
  } finally {
    appState.restore();
  }
});

test("시작 조회가 5초를 넘으면 앱을 계속 열 수 있다", async () => {
  mockedRead.mockImplementationOnce(() => new Promise(() => undefined));
  const appState = watchAppState();
  jest.useFakeTimers();
  try {
    const gate = await renderGate();
    expect(gate.result.current.status).toBe("checking");
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5001);
    });
    expect(gate.result.current.status).toBe("allowed");
    gate.unmount();
  } finally {
    appState.restore();
    jest.useRealTimers();
  }
});
