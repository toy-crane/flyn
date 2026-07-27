jest.mock("./supabase", () => ({ supabase: { from: jest.fn() } }));

import { supabase } from "./supabase";
import {
  describeProfileGate,
  fetchProfile,
  type Profile,
  saveDisplayName,
} from "./use-profile";

const mockFrom = supabase.from as unknown as jest.Mock;
const USER = "user-1";

const PROFILE: Profile = {
  display_name: "훈",
  email: "me@example.test",
  id: USER,
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
  jest.resetAllMocks();
});

describe("describeProfileGate", () => {
  it("조회 중에는 loading이다", () => {
    expect(query({ isPending: true }).kind).toBe("loading");
  });

  it("display_name이 null이면 온보딩이다", () => {
    expect(query({ data: { ...PROFILE, display_name: null } }).kind).toBe(
      "onboarding"
    );
  });

  it("display_name이 있으면 앱으로 간다", () => {
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
      query({ data: { ...PROFILE, display_name: null }, isError: true }).kind
    ).toBe("onboarding");
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
