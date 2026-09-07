import { describe, expect, test } from "bun:test";
import { serve } from "bun";
import { selectLanHost, selectSessionLanHost, verifyLanServers } from "./lan";

describe("LAN 주소 선택", () => {
  test("LAN 연결을 잃어도 가상 기기 실행은 loopback으로 계속할 수 있다", () => {
    expect(
      selectSessionLanHost([], false, undefined, "192.168.0.10")
    ).toBeUndefined();
    expect(() => selectSessionLanHost([], true)).toThrow("후보 없음");
    expect(
      selectSessionLanHost(
        [{ address: "192.168.0.11", name: "en0" }],
        false,
        undefined,
        "192.168.0.10"
      )
    ).toBe("192.168.0.11");
  });
  test("일반 LAN 인터페이스가 하나면 VPN과 loopback을 제외하고 선택한다", () => {
    expect(
      selectLanHost([
        { address: "127.0.0.1", name: "lo0" },
        { address: "10.2.0.5", name: "utun3" },
        { address: "192.168.0.10", name: "en0" },
      ])
    ).toBe("192.168.0.10");
  });
  test("여러 주소에서는 명시한 Mac 주소만 선택하고 다른 주소는 거절한다", () => {
    const addresses = [
      { address: "192.168.0.10", name: "en0" },
      { address: "192.168.1.10", name: "en1" },
    ];
    expect(() => selectLanHost(addresses)).toThrow("--host");
    expect(selectLanHost(addresses, "192.168.1.10")).toBe("192.168.1.10");
    for (const host of [
      "127.0.0.1",
      "0.0.0.0",
      "192.168.0.99",
      "192.168.0.10:3000",
      "https://example.com",
    ]) {
      expect(() => selectLanHost(addresses, host)).toThrow("--host");
    }
    expect(() => selectLanHost([])).toThrow("후보 없음");
  });
});

test("LAN 응답 확인은 실패한 서버를 구분한다", async () => {
  let unavailable = false;
  const server = serve({
    fetch(request) {
      const failed =
        unavailable && new URL(request.url).pathname === "/auth/v1/health";
      return new Response("", { status: failed ? 503 : 200 });
    },
    hostname: "127.0.0.1",
    port: 0,
  });
  try {
    const { port } = server;
    if (!port) {
      throw new Error("테스트 서버 포트를 배정하지 못했습니다.");
    }
    await expect(
      verifyLanServers("127.0.0.1", port, port, port)
    ).resolves.toBeUndefined();
    unavailable = true;
    await expect(
      verifyLanServers("127.0.0.1", port, port, port)
    ).rejects.toThrow("Supabase의 LAN 주소");
  } finally {
    server.stop(true);
  }
});
