/**
 * Model routing for the AI engine. Every call goes through the Vercel AI
 * Gateway — plain `provider/model` strings, with the SDK reading
 * `AI_GATEWAY_API_KEY` from the environment. One entry per call so the
 * master plan's fallback (a higher model for judgment only) stays a
 * one-line change.
 */
export const AI_MODEL = {
  scenario: "anthropic/claude-sonnet-5",
  turnAnalysis: "anthropic/claude-sonnet-5",
  narrator: "anthropic/claude-sonnet-5",
  correctionThread: "anthropic/claude-sonnet-5",
} as const;
