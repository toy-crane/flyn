import { scenarioRewriteRequestSchema } from "@/lib/ai-contract";
import { aiFailureResponse, readContractRequest } from "@/server/http";
import { rewriteScenario } from "@/server/scenario";

export async function POST(request: Request): Promise<Response> {
  const parsed = await readContractRequest(
    request,
    scenarioRewriteRequestSchema,
  );
  if (!parsed.ok) return parsed.response;
  try {
    return Response.json(await rewriteScenario(parsed.data, request.signal));
  } catch (error) {
    return aiFailureResponse("scenario-rewrite", error);
  }
}
