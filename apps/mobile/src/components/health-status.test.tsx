import { act, render, screen } from "@testing-library/react-native";
import { HealthStatus } from "./health-status";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

/** 렌더 후 대기 중인 fetch 프로미스까지 act 안에서 정리한다. */
async function renderSettled() {
  await act(async () => {
    render(<HealthStatus />);
    await Promise.resolve();
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("HealthStatus", () => {
  it("renders the service and status once the API answers", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ service: "flyn-api", status: "ok" }));

    await renderSettled();

    expect(screen.getByText("flyn-api · ok")).toBeTruthy();
  });

  it("surfaces the reason when the API is unreachable", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Network request failed"));

    await renderSettled();

    expect(screen.getByText("Network request failed")).toBeTruthy();
  });
});
