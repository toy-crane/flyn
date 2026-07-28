jest.mock("../supabase", () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

import { DISPLAY_NAME_MAX } from "../display-name";
import { supabase } from "../supabase";
import {
  fetchNameCandidate,
  forgetProviderName,
  rememberProviderName,
} from "./name-candidate";

const mockGetSession = supabase.auth.getSession as unknown as jest.Mock;

function withMetadata(metadata: Record<string, unknown> | null) {
  mockGetSession.mockResolvedValue({
    data: {
      session: metadata === null ? null : { user: { user_metadata: metadata } },
    },
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  // 모듈 스코프에 남는 값이라 테스트 간에 새지 않게 비운다.
  forgetProviderName();
});

describe("fetchNameCandidate", () => {
  // Apple은 fullName을 최초 로그인 1회만 주므로 그때 full_name으로 넣어 둔다.
  it("Apple이 남긴 full_name을 후보로 쓴다", async () => {
    withMetadata({ full_name: "김한울" });

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  // Google의 signInWithIdToken은 name을 채운다.
  it("full_name이 없으면 name을 본다", async () => {
    withMetadata({ name: "한울 김" });

    await expect(fetchNameCandidate()).resolves.toBe("한울 김");
  });

  it("full_name이 name보다 우선한다", async () => {
    withMetadata({ full_name: "김한울", name: "hanul" });

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  // 이메일 OTP 경로는 provider 이름이 없으므로 빈 입력칸으로 시작한다.
  it("이름을 주는 provider가 없으면 빈 문자열이다", async () => {
    withMetadata({ email: "me@example.test" });

    await expect(fetchNameCandidate()).resolves.toBe("");
  });

  it("앞뒤 공백을 떼고 돌려준다", async () => {
    withMetadata({ full_name: "  김한울  " });

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  // 길이는 입력칸이 정한다 — 여기서 또 재면 규칙이 두 곳으로 갈린다.
  it("긴 후보를 길이만으로 버리지 않는다", async () => {
    const long = "가".repeat(DISPLAY_NAME_MAX + 1);
    withMetadata({ full_name: long });

    await expect(fetchNameCandidate()).resolves.toBe(long);
  });

  it("보이지 않는 문자뿐인 후보는 없는 것으로 친다", async () => {
    withMetadata({ full_name: "\u200b\u3000" });

    await expect(fetchNameCandidate()).resolves.toBe("");
  });

  it("문자열이 아닌 값은 무시한다", async () => {
    withMetadata({ full_name: { given: "한울" } });

    await expect(fetchNameCandidate()).resolves.toBe("");
  });

  // 이름 후보 하나 때문에 온보딩을 막지 않는다.
  it("세션을 읽지 못해도 던지지 않는다", async () => {
    mockGetSession.mockRejectedValue(new Error("storage unavailable"));

    await expect(fetchNameCandidate()).resolves.toBe("");
  });

  // full_name이 ''일 때 ??를 쓰면 멀쩡한 name이 가려진다. Apple ID 토큰에
  // 이름 클레임이 없으면 GoTrue가 실제로 ''를 쓴다.
  it("빈 full_name이 name을 가리지 않는다", async () => {
    withMetadata({ full_name: "", name: "한울 김" });

    await expect(fetchNameCandidate()).resolves.toBe("한울 김");
  });
});

/**
 * Apple 이름은 updateUser로 서버에 올린 뒤 세션에서 되읽는 구조였는데,
 * signInWithIdToken이 이미 SIGNED_IN을 쏜 뒤라 온보딩이 먼저 읽을 수 있었다.
 * 기기가 아는 값을 먼저 보게 해서 그 경합을 없앤다.
 */
describe("기기가 기억한 이름", () => {
  it("세션 메타데이터가 아직 비어 있어도 후보를 준다", async () => {
    withMetadata({});
    rememberProviderName("김한울");

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  it("세션 메타데이터보다 먼저 본다", async () => {
    withMetadata({ full_name: "늦게 도착한 값" });
    rememberProviderName("김한울");

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  // 안 비우면 B의 온보딩에 A의 이름이 미리 채워진다.
  it("로그아웃하면 비워져 다음 사용자에게 새지 않는다", async () => {
    withMetadata({});
    rememberProviderName("김한울");
    forgetProviderName();

    await expect(fetchNameCandidate()).resolves.toBe("");
  });
});
