jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn((options) => options),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock("./supabase", () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import {
  checkUsernameAvailability,
  describeProfileGate,
  fetchProfile,
  isUsernameAlreadyTaken,
  type Profile,
  saveDisplayName,
  saveUsername,
  useSaveDisplayName,
  useSaveUsername,
} from "./use-profile";

const mockFrom = supabase.from as unknown as jest.Mock;
const mockRpc = supabase.rpc as unknown as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const USER = "user-1";

const PROFILE: Profile = {
  display_name: "훈",
  email: "me@example.test",
  id: USER,
  username: "toycrane",
};

/**
 * supabase-js의 빌더는 메서드를 이어 붙이다 마지막에 await된다. 중간 메서드가
 * 전부 자기를 돌려주면 호출 순서를 흉내 낼 필요가 없고, 두 함수 모두 체인을
 * `throwOnError()`로 닫으므로 거기서 프로미스를 내주면 된다 — 여기서 보는 것은
 * 배선이지 쿼리 문법이 아니다.
 */
function stubQuery(result: Promise<{ data: unknown }>) {
  const calls: Record<string, unknown[]> = {};
  const chain: Record<string, unknown> = {
    throwOnError: () => result,
  };

  for (const method of ["select", "eq", "maybeSingle", "single", "update"]) {
    chain[method] = (...args: unknown[]) => {
      calls[method] = args;
      return chain;
    };
  }

  mockFrom.mockReturnValue(chain);

  return calls;
}

/** react-query 결과의 모양만 흉내 낸다 — 판정이 보는 다섯 값이 전부다. */
function query(overrides: Partial<Parameters<typeof describeProfileGate>[0]>) {
  return describeProfileGate({
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: () => undefined,
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("describeProfileGate", () => {
  it("조회 중에는 loading이다", () => {
    expect(query({ isPending: true }).kind).toBe("loading");
  });

  it("닉네임이 없으면 첫 단계부터 온보딩한다", () => {
    expect(query({ data: { ...PROFILE, display_name: null } })).toEqual({
      kind: "onboarding",
      step: "nickname",
    });
  });

  it("닉네임은 있고 아이디가 없으면 아이디 단계부터 온보딩한다", () => {
    expect(query({ data: { ...PROFILE, username: null } })).toEqual({
      kind: "onboarding",
      step: "username",
    });
  });

  it("닉네임이 없으면 아이디가 있어도 닉네임 단계가 먼저다", () => {
    expect(
      query({ data: { ...PROFILE, display_name: null, username: "already" } })
    ).toEqual({ kind: "onboarding", step: "nickname" });
  });

  it("두 값이 모두 있으면 앱으로 간다", () => {
    expect(query({ data: PROFILE }).kind).toBe("ready");
  });

  // 아래 둘을 온보딩과 섞으면, 네트워크가 끊겼거나 데이터가 깨진 사용자가
  // 이미 정한 이름을 다시 입력하게 된다.
  it("행이 없으면 온보딩이 아니라 무결성 오류다", () => {
    expect(query({ data: null }).kind).toBe("missing");
  });

  it("조회 실패는 온보딩이 아니라 재시도 가능한 오류다", () => {
    expect(query({ isError: true }).kind).toBe("failed");
  });

  /**
   * react-query는 백그라운드 리페치가 실패해도 이전 data를 남긴 채 status만
   * 'error'로 바꾼다. data를 보지 않으면 설정을 여는 순간의 리페치 한 번이
   * 실패했다고 앱 전체가 오류 화면으로 바뀐다 — 알아야 할 것은 이미 캐시에 있다.
   *
   * 이 테스트가 없던 이유가 곧 결함의 절반이었다: query 헬퍼의 data 기본값이
   * undefined라 이 조합을 **구성할 수조차 없었다.**
   */
  it("캐시된 프로필이 있으면 리페치 실패로 오류 화면에 가지 않는다", () => {
    expect(query({ data: PROFILE, isError: true }).kind).toBe("ready");
  });

  it("캐시된 프로필이 온보딩 전이면 리페치가 실패해도 온보딩을 유지한다", () => {
    expect(
      query({ data: { ...PROFILE, username: null }, isError: true })
    ).toEqual({ kind: "onboarding", step: "username" });
  });

  // 행이 없다는 사실이 캐시돼 있으면 그것도 확정된 답이다.
  it("행 없음이 캐시돼 있으면 리페치 실패로 판정을 뒤집지 않는다", () => {
    expect(query({ data: null, isError: true }).kind).toBe("missing");
  });

  it("실패 판정은 재시도 수단을 들고 있다", () => {
    const refetch = jest.fn();
    const gate = query({ isError: true, refetch });

    if (gate.kind !== "failed") {
      throw new Error("failed 판정이어야 한다");
    }

    gate.retry();
    expect(refetch).toHaveBeenCalled();
  });

  // 실패한 조회를 다시 받아오는 동안에도 isError는 참으로 남는다. 이때 loading으로
  // 바뀌면 재시도 버튼이 사라져 사용자가 두 번 누를 수 없다.
  it("재시도 중에도 실패 판정을 유지한다", () => {
    const gate = query({ isError: true, isFetching: true });

    expect(gate).toMatchObject({ kind: "failed", retrying: true });
  });
});

describe("fetchProfile", () => {
  it("행이 없으면 null을 돌려준다", async () => {
    stubQuery(Promise.resolve({ data: null }));

    await expect(fetchProfile(USER)).resolves.toBeNull();
  });

  it("조회 실패는 null로 뭉개지 않고 던진다", async () => {
    stubQuery(Promise.reject(new Error("Network request failed")));

    await expect(fetchProfile(USER)).rejects.toThrow("Network request failed");
  });

  it("자기 행만 본다", async () => {
    const calls = stubQuery(Promise.resolve({ data: PROFILE }));

    await fetchProfile(USER);

    expect(calls.eq).toEqual(["id", USER]);
  });

  it("닉네임과 아이디를 함께 가져온다", async () => {
    const calls = stubQuery(Promise.resolve({ data: PROFILE }));

    await fetchProfile(USER);

    expect(calls.select).toEqual(["id, email, display_name, username"]);
  });
});

describe("saveDisplayName", () => {
  it("앞뒤 공백을 제거해 보낸다", async () => {
    const calls = stubQuery(Promise.resolve({ data: PROFILE }));

    await saveDisplayName(USER, "  한울  ");

    expect(calls.update).toEqual([{ display_name: "한울" }]);
  });

  it("갱신된 행을 돌려준다 — 다시 받아오지 않고 캐시에 넣을 수 있어야 한다", async () => {
    stubQuery(Promise.resolve({ data: PROFILE }));

    await expect(saveDisplayName(USER, "훈")).resolves.toEqual(PROFILE);
  });
});

describe("saveUsername", () => {
  it("소문자로 정규화해 보낸다", async () => {
    const calls = stubQuery(Promise.resolve({ data: PROFILE }));

    await saveUsername(USER, "Toy.Crane");

    expect(calls.update).toEqual([{ username: "toy.crane" }]);
  });

  it("갱신된 전체 프로필을 돌려준다", async () => {
    stubQuery(Promise.resolve({ data: PROFILE }));

    await expect(saveUsername(USER, "toycrane")).resolves.toEqual(PROFILE);
  });

  it("유니크 위반은 화면이 구분할 수 있는 코드를 보존한다", async () => {
    const conflict = { code: "23505" };
    stubQuery(Promise.reject(conflict));

    await expect(saveUsername(USER, "taken")).rejects.toBe(conflict);
    expect(isUsernameAlreadyTaken(conflict)).toBe(true);
    expect(isUsernameAlreadyTaken(new Error("network"))).toBe(false);
  });
});

describe("checkUsernameAvailability", () => {
  it("불리언 RPC 결과를 돌려준다", async () => {
    const throwOnError = jest.fn().mockResolvedValue({ data: true });
    mockRpc.mockReturnValue({ throwOnError });

    await expect(checkUsernameAvailability("toycrane")).resolves.toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("is_username_available", {
      candidate_username: "toycrane",
    });
  });
});

describe("프로필 저장 캐시", () => {
  it.each([
    ["닉네임", useSaveDisplayName],
    ["아이디", useSaveUsername],
  ])("%s 저장은 갱신된 전체 프로필을 직접 넣는다", (_label, useSave) => {
    const setQueryData = jest.fn();
    mockUseQueryClient.mockReturnValue({ setQueryData });

    const mutation = useSave(USER) as unknown as {
      onSuccess: (profile: Profile) => void;
    };
    mutation.onSuccess(PROFILE);

    expect(setQueryData).toHaveBeenCalledWith(["profile", USER], PROFILE);
  });
});
