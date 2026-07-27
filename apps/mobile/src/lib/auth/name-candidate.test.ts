jest.mock("../supabase", () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

import { DISPLAY_NAME_MAX } from "../display-name";
import { supabase } from "../supabase";
import { fetchNameCandidate } from "./name-candidate";

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

  // 이메일 OTP 경로 — 빈 입력칸으로 시작하는 것이 §3이 정한 동작이다.
  it("이름을 주는 provider가 없으면 빈 문자열이다", async () => {
    withMetadata({ email: "me@example.test" });

    await expect(fetchNameCandidate()).resolves.toBe("");
  });

  it("앞뒤 공백을 떼고 돌려준다", async () => {
    withMetadata({ full_name: "  김한울  " });

    await expect(fetchNameCandidate()).resolves.toBe("김한울");
  });

  // 잘라서 채우면 사용자가 자기 이름이 잘린 줄 모르고 제출하고, 그대로 채우면
  // 버튼이 잠긴 채 이유를 알 수 없다.
  it("규칙을 통과하지 못하는 후보는 없는 것으로 친다", async () => {
    withMetadata({ full_name: "가".repeat(DISPLAY_NAME_MAX + 1) });

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
});
