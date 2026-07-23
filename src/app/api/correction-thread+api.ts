import { correctionThreadRequestSchema } from "@/lib/ai-contract";
import { answerCorrectionQuestion } from "@/server/correction-thread";
import { aiFailureResponse, readContractRequest } from "@/server/http";

export async function POST(request: Request): Promise<Response> {
  const parsed = await readContractRequest(
    request,
    correctionThreadRequestSchema,
  );
  if (!parsed.ok) return parsed.response;
  try {
    return Response.json(
      await answerCorrectionQuestion(parsed.data, request.signal),
    );
  } catch (error) {
    return aiFailureResponse("correction-thread", error);
  }
}
