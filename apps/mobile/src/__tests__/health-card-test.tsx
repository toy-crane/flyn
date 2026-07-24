import { render } from "@testing-library/react-native";

import { HealthCard } from "@/components/health-card";

describe("<HealthCard />", () => {
  test("정상 응답이면 서비스 이름을 보여준다", async () => {
    const { getByText } = await render(
      <HealthCard
        state={{
          health: {
            service: "flyn-api",
            status: "ok",
            time: "2026-07-24T00:00:00.000Z",
          },
          kind: "ok",
        }}
      />
    );

    getByText("API ok");
    getByText("flyn-api · 2026-07-24T00:00:00.000Z");
  });

  test("실패하면 에러 메시지를 보여준다", async () => {
    const { getByText } = await render(
      <HealthCard state={{ kind: "error", message: "HTTP 503" }} />
    );

    getByText("API 연결 실패");
    getByText("HTTP 503");
  });
});
