/**
 * Shared plumbing for the thin API route handlers: contract-validated request
 * parsing and an AI-failure response that never echoes internals (키·요청
 * 헤더가 응답이나 로그로 새지 않는다).
 */
import type { z } from "zod";

export async function readContractRequest<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<
  { ok: true; data: z.output<Schema> } | { ok: false; response: Response }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "invalid-json" }, { status: 400 }),
    };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "invalid-request",
          issues: parsed.error.issues.map((issue) => issue.path.join(".")),
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

/** Logs name+message only (no error object dump) and answers a generic 500. */
export function aiFailureResponse(route: string, error: unknown): Response {
  const summary =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[${route}] AI call failed — ${summary}`);
  return Response.json({ error: "ai-failed" }, { status: 500 });
}
