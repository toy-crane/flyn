import { createUIMessageStreamResponse } from "ai";

import { storyTurnRequestSchema } from "@/lib/ai-contract";
import { readContractRequest } from "@/server/http";
import { streamStoryTurn } from "@/server/story-turn";

export async function POST(request: Request): Promise<Response> {
  const parsed = await readContractRequest(request, storyTurnRequestSchema);
  if (!parsed.ok) return parsed.response;
  // Failures after this point surface as an error part in the stream — the
  // response head is already on the wire.
  return createUIMessageStreamResponse({
    stream: streamStoryTurn(parsed.data, request.signal),
  });
}
