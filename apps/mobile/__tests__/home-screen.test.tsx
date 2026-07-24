import { render, screen, waitFor } from "@testing-library/react-native";

import HomeScreen from "@/app/index";

const STATUS_TEXT = /status/;

describe("<HomeScreen />", () => {
  test("shows the health check result once the API responds", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), { status: 200 })
      );

    await render(<HomeScreen />);

    expect(screen.getByText("flyn")).toBeTruthy();

    await waitFor(() =>
      expect(screen.getByTestId("health-status")).toHaveTextContent(STATUS_TEXT)
    );

    fetchMock.mockRestore();
  });
});
