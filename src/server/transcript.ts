/**
 * Renders a story transcript for a prompt. The judge and the narrator must see
 * the same conversation in the same shape — a difference between the two is
 * exactly the kind of drift the judgment harness cannot detect.
 */
import type { StoryTurnRequest } from "@/lib/ai-contract";

export function renderTranscript(
  messages: StoryTurnRequest["messages"],
): string {
  if (messages.length === 0) return "(아직 대화 없음 — 첫 턴)";
  return messages
    .map((message) =>
      message.speaker === "ai"
        ? message.beats
            .map(
              (beat) =>
                `AI [${beat.kind === "narration" ? "내레이션" : "대사"}]: ${beat.text}`,
            )
            .join("\n")
        : `학습자: ${message.text}`,
    )
    .join("\n");
}
