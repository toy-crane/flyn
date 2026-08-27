import { afterEach, expect, jest, test } from "@jest/globals";
import type { UIMessage } from "ai";

import { saveStoppedEpisodeSession } from "./episode-session";

jest.mock("@/shared/ai/request-options", () => ({
  aiUrl: (path: string) => `http://127.0.0.1:3900${path}`,
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("중지한 장면과 그때의 요청 상태를 PUT으로 보낸다", async () => {
  const messages: UIMessage[] = [
    {
      id: "user-1",
      parts: [{ text: "Please try again.", type: "text" }],
      role: "user",
    },
  ];
  const controller = new AbortController();
  const request = jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValue({ ok: true } as Response);

  await saveStoppedEpisodeSession(
    "token-1",
    "11000000-0000-4000-8000-000000000001",
    messages,
    "replace",
    controller.signal
  );

  expect(request).toHaveBeenCalledWith(
    "http://127.0.0.1:3900/ai/episode/11000000-0000-4000-8000-000000000001",
    {
      body: JSON.stringify({ messages, mode: "replace" }),
      headers: {
        Authorization: "Bearer token-1",
        "content-type": "application/json",
      },
      method: "PUT",
      signal: controller.signal,
    }
  );
});

test("중지 저장이 거절되면 호출자에게 실패를 알린다", async () => {
  jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValue({ ok: false, status: 401 } as Response);

  await expect(
    saveStoppedEpisodeSession(
      "expired",
      "11000000-0000-4000-8000-000000000001",
      [],
      "preserve",
      new AbortController().signal
    )
  ).rejects.toThrow("Saving the stopped episode failed with 401");
});
