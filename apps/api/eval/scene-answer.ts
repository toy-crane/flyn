import { type ModelMessage, streamText } from "ai";
import {
  episodeSystemPrompt,
  type StoryMemory,
} from "../src/features/episode/episode";
import {
  episodeSceneOutput,
  streamEpisodeScene,
} from "../src/features/episode/scene";
import type { EpisodeScript } from "../src/features/episode/story";
import { resolveModelId } from "../src/shared/model-id";
import { speakerModelText } from "../src/shared/scene-stream";

/** 운영과 같은 구조화 스트림과 part 변환을 실제 모델로 평가한다. */
export async function sceneAnswer(
  script: EpisodeScript,
  messages: ModelMessage[],
  memories: readonly StoryMemory[] = []
) {
  const started = performance.now();
  const deltas: { elapsedMs: number; text: string }[] = [];
  const result = streamText({
    abortSignal: AbortSignal.timeout(120_000),
    messages,
    model: resolveModelId(),
    output: episodeSceneOutput(script),
    system: episodeSystemPrompt(script, memories),
  });
  const { parts } = await streamEpisodeScene(
    result,
    {
      merge() {
        throw new Error("평가는 다른 스트림을 합치지 않는다.");
      },
      onError: undefined,
      write(chunk) {
        if (chunk.type === "text-delta") {
          deltas.push({
            elapsedMs: Math.round(performance.now() - started),
            text: chunk.delta,
          });
        }
      },
    },
    script
  );
  return {
    deltas,
    elapsedMs: Math.round(performance.now() - started),
    scene: await result.output,
    text: parts
      .map((part) => {
        if (part.type === "text") {
          return part.text;
        }
        if (part.type === "data-speaker") {
          return speakerModelText(part.data);
        }
        return "";
      })
      .join(""),
  };
}
