import { beforeAll, describe, expect, test } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import {
  readLocalStack,
  type SignedInUser,
  signInWithEmailCode,
  uniqueTestEmail,
} from "../../../scripts/integration/local-supabase";
import { createApp } from "../src/app";

let user: SignedInUser;
let stranger: SignedInUser;
let episodeId: string;
let storyPlayId: string;
let playId: string;
let messageId: string;
const meaning = "다음 손님, 오세요!";

beforeAll(async () => {
  const stack = await readLocalStack();
  user = await signInWithEmailCode(stack, uniqueTestEmail("meaning"));
  stranger = await signInWithEmailCode(
    stack,
    uniqueTestEmail("meaning-stranger")
  );
  const story = await user.client
    .from("stories")
    .select("id")
    .eq("slug", "mia-cafe")
    .single();
  if (story.error) {
    throw story.error;
  }
  const episode = await user.client
    .from("episodes")
    .select("id")
    .eq("story_id", story.data.id)
    .eq("number", 1)
    .single();
  if (episode.error) {
    throw episode.error;
  }
  episodeId = episode.data.id;
  const run = await user.client
    .from("story_plays")
    .insert({ story_id: story.data.id })
    .select("id")
    .single();
  if (run.error) {
    throw run.error;
  }
  storyPlayId = run.data.id;
  const play = await user.client
    .from("episode_plays")
    .insert({ episode_id: episodeId, story_play_id: storyPlayId })
    .select("id")
    .single();
  if (play.error) {
    throw play.error;
  }
  playId = play.data.id;
  messageId = await addScene();
}, 60_000);

async function addScene() {
  const id = crypto.randomUUID();
  const added = await user.client.from("episode_messages").insert({
    episode_play_id: playId,
    id,
    parts: [
      { data: { name: "Mia" }, type: "data-speaker" },
      { text: "Next in line, please!", type: "text" },
    ],
    role: "assistant",
  });
  if (added.error) {
    throw added.error;
  }
  return id;
}

function modelFor(text = meaning, delay = 0) {
  return new MockLanguageModelV4({
    doGenerate: async () => {
      if (delay) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      return {
        content: [{ text: JSON.stringify({ meaning: text }), type: "text" }],
        finishReason: { raw: undefined, unified: "stop" },
        usage: {
          inputTokens: { cacheRead: 0, cacheWrite: 0, noCache: 1, total: 1 },
          outputTokens: { reasoning: 0, text: 1, total: 1 },
        },
        warnings: [],
      };
    },
  });
}
function appFor(model = modelFor(), person = user) {
  return createApp({
    authMiddleware: async (c, next) => {
      c.set("supabaseContext", { supabase: person.client });
      await next();
    },
    model,
  });
}
function request(
  app: ReturnType<typeof createApp>,
  path: string,
  extra: object = {},
  id = messageId
) {
  return app.request(`/ai/episode/${path}`, {
    body: JSON.stringify({
      dialogueIndex: 0,
      episodeId,
      messageId: id,
      storyPlayId,
      ...extra,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("대사 뜻의 실제 API와 저장 수명", () => {
  test("번역과 담기가 겹쳐도 뜻을 한 번만 만들고 다시 열면 함께 돌아온다", async () => {
    const model = modelFor(meaning, 150);
    const app = appFor(model);
    const [translated, saved] = await Promise.all([
      request(app, "utterance-meanings"),
      request(app, "saved-expressions", { kind: "dialogue" }),
    ]);
    expect(translated.status).toBe(200);
    expect(saved.status).toBe(200);
    expect(model.doGenerateCalls).toHaveLength(1);
    expect((await translated.json()).meaning).toBe(meaning);
    const note = await user.client
      .from("expressions")
      .select("meaning")
      .eq("message_id", messageId)
      .single();
    expect(note.data?.meaning).toBe(meaning);
    const restored = await app.request(
      `/ai/episode/${episodeId}?storyPlayId=${storyPlayId}`
    );
    expect((await restored.json()).utteranceMeanings).toContainEqual({
      dialogueIndex: 0,
      meaning,
      messageId,
    });
    expect(
      (await request(app, "utterance-meanings", { meaning: "다른 뜻" })).status
    ).toBe(200);
    expect(model.doGenerateCalls).toHaveLength(1);
  });
  test("다른 계정의 대사는 읽거나 번역하지 못한다", async () => {
    const model = modelFor();
    expect(
      (await request(appFor(model, stranger), "utterance-meanings")).status
    ).toBe(404);
    expect(model.doGenerateCalls).toHaveLength(0);
    const rows = await stranger.client
      .from("expressions")
      .select("*")
      .eq("message_id", messageId);
    expect(rows.data).toEqual([]);
  });
  test("예전에 담은 대사의 뜻을 모델 없이 가져온다", async () => {
    const id = await addScene();
    const prepared = await request(
      appFor(modelFor("다음 분이요!")),
      "saved-expressions",
      { kind: "dialogue" },
      id
    );
    expect(prepared.status).toBe(200);
    const model = modelFor();
    const response = await request(appFor(model), "utterance-meanings", {}, id);
    expect(response.status).toBe(200);
    expect((await response.json()).meaning).toBe("다음 분이요!");
    expect(model.doGenerateCalls).toHaveLength(0);
  });
  test("실패한 선점은 비우고 재시도하며 완료한 뜻은 직접 덮어쓰지 못한다", async () => {
    const id = await addScene();
    expect(
      (await request(appFor(modelFor("")), "utterance-meanings", {}, id)).status
    ).toBe(500);
    expect(
      (await user.client.from("expressions").select("*").eq("message_id", id))
        .data
    ).toEqual([]);
    expect((await request(appFor(), "utterance-meanings", {}, id)).status).toBe(
      200
    );
    const changed = await user.client
      .from("expressions")
      .update({ meaning: "바뀐 뜻" })
      .eq("message_id", id)
      .select("meaning");
    expect(changed.error?.code).toBe("42501");
  });
  test("만료된 선점을 회수하면 앞 요청의 실패가 새 선점을 지우지 않는다", async () => {
    const id = await addScene();
    let failOld!: () => void;
    const stopped = new Promise<void>((resolve) => {
      failOld = resolve;
    });
    const oldModel = new MockLanguageModelV4({
      doGenerate: async () => {
        await stopped;
        throw new Error("older generation failed");
      },
    });
    const oldRequest = request(appFor(oldModel), "utterance-meanings", {}, id);
    const read = () =>
      user.client
        .from("expressions")
        .select("claim_token")
        .eq("message_id", id)
        .maybeSingle();
    let token: string | null | undefined;
    for (let i = 0; i < 100 && !token; i += 1) {
      // biome-ignore lint/performance/noAwaitInLoops: 선점이 만들어지는 순서를 관찰한다.
      token = (await read()).data?.claim_token;
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    expect(token).toBeDefined();
    // 만료 시각은 DB가 소유한다. 실제 30초 선점 수명이 지난 뒤 재시도한다.
    await new Promise((resolve) => setTimeout(resolve, 30_100));
    const nextRequest = request(
      appFor(modelFor("새로 남긴 뜻이에요.", 200)),
      "utterance-meanings",
      {},
      id
    );
    let nextToken = token;
    for (let i = 0; i < 100 && nextToken === token; i += 1) {
      // biome-ignore lint/performance/noAwaitInLoops: 회수가 완료될 때까지 순서대로 관찰한다.
      nextToken = (await read()).data?.claim_token;
      if (nextToken === token) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    expect(nextToken).not.toBe(token);
    failOld();
    expect((await oldRequest).status).toBe(500);
    expect((await read()).data?.claim_token).toBe(nextToken);
    const response = await nextRequest;
    expect(response.status).toBe(200);
    expect((await response.json()).meaning).toBe("새로 남긴 뜻이에요.");
  }, 45_000);
  test("번역 생성 중 원본을 삭제하면 늦은 응답이 표현을 되살리지 않는다", async () => {
    const id = await addScene();
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const model = new MockLanguageModelV4({
      doGenerate: async () => {
        started.resolve();
        await release.promise;
        return {
          content: [{ text: JSON.stringify({ meaning }), type: "text" }],
          finishReason: { raw: undefined, unified: "stop" },
          usage: {
            inputTokens: { cacheRead: 0, cacheWrite: 0, noCache: 1, total: 1 },
            outputTokens: { reasoning: 0, text: 1, total: 1 },
          },
          warnings: [],
        };
      },
    });
    const pending = request(
      appFor(model),
      "saved-expressions",
      { kind: "dialogue" },
      id
    );
    await started.promise;
    try {
      const removed = await user.client
        .from("episode_messages")
        .delete()
        .eq("id", id);
      expect(removed.error).toBeNull();
    } finally {
      release.resolve();
    }
    expect((await pending).status).toBe(500);
    const remaining = await user.client
      .from("expressions")
      .select("id")
      .eq("message_id", id);
    expect(remaining.error).toBeNull();
    expect(remaining.data).toEqual([]);
    const orphan = await user.client
      .from("expressions")
      .select("id")
      .is("message_id", null);
    expect(orphan.error).toBeNull();
    expect(orphan.data).toEqual([]);
  });
  test("장면을 버리면 뜻이 사라지고 담아 둔 표현은 남는다", async () => {
    const removed = await user.client
      .from("episode_messages")
      .delete()
      .eq("id", messageId);
    if (removed.error) {
      throw removed.error;
    }
    expect(
      (
        await user.client
          .from("expressions")
          .select("*")
          .eq("message_id", messageId)
      ).data
    ).toEqual([]);
    const note = await user.client
      .from("expressions")
      .select("meaning, message_id")
      .eq("meaning", meaning);
    expect(note.data).toContainEqual({ meaning, message_id: null });
  });
});
