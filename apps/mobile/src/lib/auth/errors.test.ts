import { classifyAuthError, describeAuthError } from "./errors";

describe("classifyAuthError", () => {
  it("RN fetch 실패를 네트워크로 본다", () => {
    expect(classifyAuthError("Network request failed")).toBe("network");
  });

  it("GoTrue 레이트리밋 문구를 알아본다", () => {
    expect(
      classifyAuthError(
        "For security purposes, you can only request this after 47 seconds."
      )
    ).toBe("rateLimited");
    expect(classifyAuthError("Email rate limit exceeded")).toBe("rateLimited");
  });

  it("만료·불일치 토큰을 코드 오류로 본다", () => {
    expect(classifyAuthError("Token has expired or is invalid")).toBe(
      "invalidCode"
    );
  });

  it("레이트리밋이 코드 오류보다 먼저 잡힌다", () => {
    // 두 패턴이 함께 걸리는 문구. 순서가 뒤집히면 "코드를 확인하라"는 엉뚱한 안내가 간다.
    expect(
      classifyAuthError("For security purposes, this token has expired")
    ).toBe("rateLimited");
  });

  it("모르는 문구는 unknown이다", () => {
    expect(classifyAuthError("boom")).toBe("unknown");
  });
});

describe("describeAuthError", () => {
  it("원문을 사용자 문구에 섞지 않는다", () => {
    const raw = "AuthApiError: Token has expired or is invalid";
    const info = describeAuthError(raw);

    expect(info.message).not.toContain("AuthApiError");
    expect(info.message).not.toContain("Token");
  });

  it("레이트리밋의 남은 초를 뽑아 문구에 넣는다", () => {
    const info = describeAuthError(
      "For security purposes, you can only request this after 47 seconds."
    );

    expect(info.retryAfterSeconds).toBe(47);
    expect(info.message).toContain("47초");
  });

  it("초를 알 수 없으면 숫자 없이 안내한다", () => {
    const info = describeAuthError("Email rate limit exceeded");

    expect(info.retryAfterSeconds).toBeUndefined();
    expect(info.message).toContain("잠시 후");
  });

  it("모르는 실패에도 할 일을 알려준다", () => {
    const info = describeAuthError("boom");

    expect(info.kind).toBe("unknown");
    expect(info.message.length).toBeGreaterThan(0);
  });
});
