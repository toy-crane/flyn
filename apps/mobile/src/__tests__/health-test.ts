import { API_BASE_URL, fetchHealth } from "@/lib/health";

describe("fetchHealth", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("헬스체크 응답을 파싱해 돌려준다", async () => {
    const payload = {
      service: "flyn-api",
      status: "ok",
      time: "2026-07-24T00:00:00.000Z",
    };
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json(payload));

    await expect(fetchHealth()).resolves.toEqual(payload);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/health`,
      expect.anything()
    );
  });

  test("2xx가 아니면 상태 코드를 담아 던진다", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("nope", { status: 503 }));

    await expect(fetchHealth()).rejects.toThrow("HTTP 503");
  });
});
