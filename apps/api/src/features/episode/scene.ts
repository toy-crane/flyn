import {
  jsonSchema,
  Output,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { EPISODE_ENDINGS } from "./episode";
import type { EpisodeScript } from "./story";

export interface EpisodeScene {
  dialogue: { speaker: string; text: string }[];
  ending: {
    kind: (typeof EPISODE_ENDINGS)[number];
    outcome: string;
    choice: string;
    relationship: string;
    question: string;
    level: string;
  } | null;
}

function hasKeys(
  value: unknown,
  keys: readonly string[]
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => key in value)
  );
}

function isEpisodeScene(
  value: unknown,
  script: EpisodeScript
): value is EpisodeScene {
  if (
    !(hasKeys(value, ["dialogue", "ending"]) && Array.isArray(value.dialogue))
  ) {
    return false;
  }
  if (
    !value.dialogue.every(
      (line) =>
        hasKeys(line, ["speaker", "text"]) &&
        script.cast.some(({ name }) => name === line.speaker) &&
        typeof line.text === "string" &&
        line.text.length > 0
    )
  ) {
    return false;
  }
  if (!value.dialogue.some((line) => line.text.trim().length > 0)) {
    return false;
  }
  const { ending } = value;
  return (
    ending === null ||
    (hasKeys(ending, [
      "kind",
      "outcome",
      "choice",
      "relationship",
      "question",
      "level",
    ]) &&
      EPISODE_ENDINGS.some((kind) => kind === ending.kind) &&
      [
        ending.outcome,
        ending.choice,
        ending.relationship,
        ending.question,
        ending.level,
      ].every((text) => typeof text === "string" && text.trim().length > 0))
  );
}

export function episodeSceneOutput(script: EpisodeScript) {
  return Output.object({
    schema: jsonSchema<EpisodeScene>(
      {
        additionalProperties: false,
        properties: {
          dialogue: {
            items: {
              additionalProperties: false,
              properties: {
                speaker: {
                  enum: script.cast.map(({ name }) => name),
                  type: "string",
                },
                text: { minLength: 1, type: "string" },
              },
              required: ["speaker", "text"],
              type: "object",
            },
            minItems: 1,
            type: "array",
          },
          ending: {
            anyOf: [
              { type: "null" },
              {
                additionalProperties: false,
                properties: {
                  choice: { minLength: 1, type: "string" },
                  kind: { enum: [...EPISODE_ENDINGS], type: "string" },
                  level: { minLength: 1, type: "string" },
                  outcome: { minLength: 1, type: "string" },
                  question: { minLength: 1, type: "string" },
                  relationship: { minLength: 1, type: "string" },
                },
                required: [
                  "kind",
                  "outcome",
                  "choice",
                  "relationship",
                  "question",
                  "level",
                ],
                type: "object",
              },
            ],
          },
        },
        required: ["dialogue", "ending"],
        type: "object",
      },
      {
        validate: (value) =>
          isEpisodeScene(value, script)
            ? { success: true, value }
            : { error: new Error("Invalid episode scene."), success: false },
      }
    ),
  });
}

/** SDK가 복원한 부분 객체에서 늘어난 대사만 기존 message part로 보낸다. */
export async function streamEpisodeScene(
  result: {
    partialOutputStream: AsyncIterable<{
      dialogue?: ({ speaker?: string; text?: string } | undefined)[];
    }>;
    output: PromiseLike<EpisodeScene>;
  },
  writer: UIMessageStreamWriter,
  script: EpisodeScript
): Promise<{ ending: EpisodeScene["ending"]; parts: UIMessage["parts"] }> {
  const parts: UIMessage["parts"] = [];
  const received: string[] = [];
  let segment = 0;
  let speaker: string | undefined;
  let spokenIndex = -1;
  function appendLine(
    line: { speaker?: string; text?: string } | undefined,
    index: number
  ) {
    if (typeof line?.speaker !== "string" || typeof line.text !== "string") {
      return;
    }
    if (!script.cast.some(({ name }) => name === line.speaker)) {
      throw new Error("Scene speaker is not in this episode.");
    }
    const previous = received[index] ?? "";
    const delta = line.text.slice(previous.length);
    if (!(delta && line.text.trim())) {
      return;
    }
    const isSameSpeaker = speaker === line.speaker;
    if (!isSameSpeaker) {
      if (segment > 0) {
        writer.write({ id: `scene-${segment}`, type: "text-end" });
      }
      segment += 1;
      ({ speaker } = line);
      const part = {
        data: { name: speaker },
        id: `speaker-${segment}`,
        type: "data-speaker" as const,
      };
      parts.push(part, { state: "done", text: "", type: "text" });
      writer.write(part);
      writer.write({ id: `scene-${segment}`, type: "text-start" });
    }
    const text = (isSameSpeaker && spokenIndex !== index ? "\n" : "") + delta;
    const last = parts.at(-1);
    if (last?.type === "text") {
      last.text += text;
    }
    writer.write({ delta: text, id: `scene-${segment}`, type: "text-delta" });
    received[index] = line.text;
    spokenIndex = index;
  }
  for await (const partial of result.partialOutputStream) {
    for (const [index, line] of (partial.dialogue ?? []).entries()) {
      appendLine(line, index);
    }
  }
  const { ending } = await result.output;
  if (segment > 0) {
    writer.write({ id: `scene-${segment}`, type: "text-end" });
  }
  return { ending, parts };
}
