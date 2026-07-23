import { scenarioGenerationRequestSchema } from "@/lib/ai-contract";
import { aiFailureResponse, readContractRequest } from "@/server/http";
import { generateScenarios } from "@/server/scenario";

export async function POST(request: Request): Promise<Response> {
  const parsed = await readContractRequest(
    request,
    scenarioGenerationRequestSchema,
  );
  if (!parsed.ok) return parsed.response;
  try {
    return Response.json(await generateScenarios(parsed.data, request.signal));
  } catch (error) {
    return aiFailureResponse("scenario-generate", error);
  }
}
