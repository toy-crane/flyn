jest.mock("./use-profile", () => ({
  checkUsernameAvailability: jest.fn(),
}));

import { act, renderHook } from "@testing-library/react-native";
import { checkUsernameAvailability } from "./use-profile";
import { useUsernameAvailability } from "./use-username-availability";

const mockCheck = checkUsernameAvailability as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

it("규칙에 맞지 않으면 검사하지 않고 invalid다", async () => {
  const { result } = await renderHook(() => useUsernameAvailability("abc"));

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });

  expect(result.current).toBe("invalid");
  expect(mockCheck).not.toHaveBeenCalled();
});

it("유효한 값은 즉시 checking이고 300ms 뒤 결과를 반영한다", async () => {
  mockCheck.mockResolvedValue(true);
  const { result } = await renderHook(() =>
    useUsernameAvailability("toycrane")
  );

  expect(result.current).toBe("checking");

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });

  expect(mockCheck).toHaveBeenCalledWith("toycrane");
  expect(result.current).toBe("available");
});

it("이미 쓰는 값은 taken이다", async () => {
  mockCheck.mockResolvedValue(false);
  const { result } = await renderHook(() =>
    useUsernameAvailability("toycrane")
  );

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });

  expect(result.current).toBe("taken");
});

it("검사 요청 실패는 저장을 허용할 unknown이다", async () => {
  mockCheck.mockRejectedValue(new Error("network"));
  const { result } = await renderHook(() =>
    useUsernameAvailability("toycrane")
  );

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });

  expect(result.current).toBe("unknown");
});

it("먼저 보낸 검사의 늦은 결과는 새 값을 덮지 않는다", async () => {
  let resolveOld: ((value: boolean) => void) | undefined;
  mockCheck
    .mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveOld = resolve;
      })
    )
    .mockResolvedValueOnce(true);

  let value = "old.name";
  const { rerender, result } = await renderHook(() =>
    useUsernameAvailability(value)
  );

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });
  value = "new.name";
  await rerender({});

  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });
  expect(result.current).toBe("available");

  await act(async () => {
    resolveOld?.(false);
    await Promise.resolve();
  });

  expect(result.current).toBe("available");
});
