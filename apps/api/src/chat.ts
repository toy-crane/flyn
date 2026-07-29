import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import {
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isTextUIPart,
  type ModelMessage,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

export const NEW_CHAT_TITLE = "새 채팅";

const SYSTEM_INSTRUCTIONS =
  "간결하고 유용하게 답하세요. 사용자가 쓴 언어와 같은 언어로 답하세요.";
const MAX_USER_MESSAGE_LENGTH = 4000;
const MAX_MESSAGE_ID_LENGTH = 128;
const FIRST_LINE_BREAK = /\r?\n/u;
const STREAM_HEADERS = {
  "Content-Encoding": "none",
  "Content-Type": "application/octet-stream",
};

export type ChatRole = "assistant" | "user";
export type ChatMessageStatus = "complete" | "stopped";

export interface ChatRoom {
  id: string;
  title: string;
  userId: string;
}

export interface ChatMessage {
  chatRoomId: string;
  content: string;
  createdAt: string;
  id: string;
  role: ChatRole;
  status: ChatMessageStatus;
}

export interface ChatRepository {
  deleteStoppedAssistantMessage: (
    roomId: string,
    messageId: string
  ) => Promise<void>;
  findMessage: (
    roomId: string,
    messageId: string
  ) => Promise<ChatMessage | null>;
  findOwnedRoom: (roomId: string, userId: string) => Promise<ChatRoom | null>;
  insertAssistantMessage: (message: ChatMessage) => Promise<void>;
  insertUserMessage: (message: ChatMessage) => Promise<void>;
  listMessages: (roomId: string) => Promise<ChatMessage[]>;
  updateRoomTitle: (roomId: string, title: string) => Promise<void>;
}

interface ChatModelGenerateOptions {
  assistantMessageId: string;
  messages: ChatMessage[];
  onFinish: (result: { isAborted: boolean; text: string }) => Promise<void>;
  signal: AbortSignal;
}

interface ChatModelReplayOptions {
  assistantMessageId: string;
  status: ChatMessageStatus;
  text: string;
}

export interface ChatModel {
  generate: (options: ChatModelGenerateOptions) => Promise<Response>;
  replay: (options: ChatModelReplayOptions) => Promise<Response> | Response;
}

export interface ChatDependencies {
  createRepository: (context: SupabaseContext<Database>) => ChatRepository;
  model: ChatModel;
}

interface ChatRequest {
  content: string;
  id: string;
}

export class ChatHttpError extends Error {
  readonly status: 400 | 404 | 409 | 500;
  readonly retryable: boolean;

  constructor(
    status: 400 | 404 | 409 | 500,
    message: string,
    retryable = false,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "ChatHttpError";
    this.status = status;
    this.retryable = retryable;
  }
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

export function parseChatRequest(input: unknown): ChatRequest {
  if (
    typeof input !== "object" ||
    input === null ||
    !("id" in input) ||
    !("content" in input)
  ) {
    throw new ChatHttpError(400, "메시지 형식이 올바르지 않습니다.");
  }

  const { content, id } = input;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    codePointLength(id) > MAX_MESSAGE_ID_LENGTH ||
    typeof content !== "string"
  ) {
    throw new ChatHttpError(400, "메시지 형식이 올바르지 않습니다.");
  }

  const normalizedContent = content.trim();

  if (
    normalizedContent.length === 0 ||
    codePointLength(normalizedContent) > MAX_USER_MESSAGE_LENGTH
  ) {
    throw new ChatHttpError(400, "메시지 본문이 올바르지 않습니다.");
  }

  return { content: normalizedContent, id };
}

export function titleFromFirstMessage(content: string) {
  const firstLine = content.split(FIRST_LINE_BREAK, 1)[0]?.trim() ?? "";
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

  return Array.from(segmenter.segment(firstLine))
    .slice(0, 40)
    .map(({ segment }) => segment)
    .join("");
}

async function assistantMessageIdFor(roomId: string, userMessageId: string) {
  const bytes = new TextEncoder().encode(`${roomId}:${userMessageId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `assistant-${hex}`;
}

function withStreamingHeaders(response: Response) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(STREAM_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export async function respondToChatMessage({
  context,
  dependencies,
  input,
  requestSignal,
  roomId,
  userId,
}: {
  context: SupabaseContext<Database>;
  dependencies: ChatDependencies;
  input: unknown;
  requestSignal: AbortSignal;
  roomId: string;
  userId: string;
}) {
  const request = parseChatRequest(input);
  const repository = dependencies.createRepository(context);
  const room = await repository.findOwnedRoom(roomId, userId);

  if (!room) {
    throw new ChatHttpError(404, "채팅방을 찾을 수 없습니다.");
  }

  let userMessage = await repository.findMessage(roomId, request.id);

  if (
    userMessage &&
    (userMessage.role !== "user" || userMessage.content !== request.content)
  ) {
    throw new ChatHttpError(409, "같은 메시지 ID의 본문이 다릅니다.");
  }

  if (!userMessage) {
    await repository.insertUserMessage({
      chatRoomId: roomId,
      content: request.content,
      createdAt: new Date().toISOString(),
      id: request.id,
      role: "user",
      status: "complete",
    });

    // 동시에 들어온 같은 요청 중 하나가 먼저 insert했을 수 있다. 저장된 값을
    // 다시 읽어 본문까지 같아야 멱등 재요청으로 취급한다.
    userMessage = await repository.findMessage(roomId, request.id);

    if (
      userMessage?.role !== "user" ||
      userMessage.content !== request.content
    ) {
      throw new ChatHttpError(409, "같은 메시지 ID의 본문이 다릅니다.");
    }
  }

  let messages = await repository.listMessages(roomId);
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (
    room.title === NEW_CHAT_TITLE &&
    firstUserMessage?.id === userMessage.id
  ) {
    const title = titleFromFirstMessage(userMessage.content);
    if (title) {
      await repository.updateRoomTitle(roomId, title);
    }
  }

  const assistantMessageId = await assistantMessageIdFor(
    roomId,
    userMessage.id
  );
  const existingAssistant = await repository.findMessage(
    roomId,
    assistantMessageId
  );

  if (existingAssistant) {
    if (existingAssistant.role !== "assistant") {
      throw new ChatHttpError(409, "응답 메시지 ID가 충돌했습니다.");
    }

    if (existingAssistant.status === "complete") {
      return withStreamingHeaders(
        await dependencies.model.replay({
          assistantMessageId,
          status: existingAssistant.status,
          text: existingAssistant.content,
        })
      );
    }

    await repository.deleteStoppedAssistantMessage(roomId, assistantMessageId);
    messages = messages.filter((message) => message.id !== assistantMessageId);
  }

  try {
    const response = await dependencies.model.generate({
      assistantMessageId,
      messages,
      onFinish: async ({ isAborted, text }) => {
        if (text.length === 0) {
          return;
        }

        await repository.insertAssistantMessage({
          chatRoomId: roomId,
          content: text,
          createdAt: new Date().toISOString(),
          id: assistantMessageId,
          role: "assistant",
          status: isAborted ? "stopped" : "complete",
        });
      },
      signal: requestSignal,
    });

    return withStreamingHeaders(response);
  } catch (error) {
    console.error("[chat] gateway start failed", {
      message: error instanceof Error ? error.message : String(error),
      roomId,
    });
    // biome-ignore lint/style/useErrorCause: ChatHttpError의 네 번째 인자가 super의 cause로 전달된다.
    throw new ChatHttpError(500, "AI 응답을 시작하지 못했습니다.", true, error);
  }
}

class SupabaseChatRepository implements ChatRepository {
  private readonly client: SupabaseContext<Database>["supabaseAdmin"];

  constructor(client: SupabaseContext<Database>["supabaseAdmin"]) {
    this.client = client;
  }

  async deleteStoppedAssistantMessage(roomId: string, messageId: string) {
    const { error } = await this.client
      .from("chat_messages")
      .delete()
      .eq("chat_room_id", roomId)
      .eq("id", messageId)
      .eq("role", "assistant")
      .eq("status", "stopped");

    if (error) {
      throw error;
    }
  }

  async findOwnedRoom(roomId: string, userId: string) {
    const { data, error } = await this.client
      .from("chat_rooms")
      .select("id, title, user_id")
      .eq("id", roomId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? { id: data.id, title: data.title, userId: data.user_id }
      : null;
  }

  async findMessage(roomId: string, messageId: string) {
    const { data, error } = await this.client
      .from("chat_messages")
      .select("id, chat_room_id, role, content, status, created_at")
      .eq("chat_room_id", roomId)
      .eq("id", messageId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapDatabaseMessage(data) : null;
  }

  async insertUserMessage(message: ChatMessage) {
    const { error } = await this.client.from("chat_messages").upsert(
      {
        chat_room_id: message.chatRoomId,
        content: message.content,
        created_at: message.createdAt,
        id: message.id,
        role: message.role,
        status: message.status,
      },
      {
        ignoreDuplicates: true,
        onConflict: "chat_room_id,id",
      }
    );

    if (error) {
      throw error;
    }
  }

  async listMessages(roomId: string) {
    const { data, error } = await this.client
      .from("chat_messages")
      .select("id, chat_room_id, role, content, status, created_at")
      .eq("chat_room_id", roomId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapDatabaseMessage);
  }

  async updateRoomTitle(roomId: string, title: string) {
    const { error } = await this.client
      .from("chat_rooms")
      .update({ title })
      .eq("id", roomId)
      .eq("title", NEW_CHAT_TITLE);

    if (error) {
      throw error;
    }
  }

  async insertAssistantMessage(message: ChatMessage) {
    const { error } = await this.client.from("chat_messages").upsert(
      {
        chat_room_id: message.chatRoomId,
        content: message.content,
        created_at: message.createdAt,
        id: message.id,
        role: message.role,
        status: message.status,
      },
      {
        ignoreDuplicates: true,
        onConflict: "chat_room_id,id",
      }
    );

    if (error) {
      throw error;
    }
  }
}

function mapDatabaseMessage(
  row: Database["public"]["Tables"]["chat_messages"]["Row"]
): ChatMessage {
  return {
    chatRoomId: row.chat_room_id,
    content: row.content,
    createdAt: row.created_at,
    id: row.id,
    role: row.role as ChatRole,
    status: row.status as ChatMessageStatus,
  };
}

function toModelMessages(messages: ChatMessage[]): ModelMessage[] {
  return messages.map(({ content, role }) => ({ content, role }));
}

function toUiMessages(messages: ChatMessage[]): UIMessage[] {
  return messages.map(({ content, id, role }) => ({
    id,
    parts: [{ text: content, type: "text" }],
    role,
  }));
}

class GatewayChatModel implements ChatModel {
  generate({
    assistantMessageId,
    messages,
    onFinish,
    signal,
  }: ChatModelGenerateOptions) {
    const model = process.env.AI_MODEL?.trim();

    if (!model) {
      throw new Error("AI_MODEL is not configured");
    }

    const result = streamText({
      abortSignal: signal,
      instructions: SYSTEM_INSTRUCTIONS,
      messages: toModelMessages(messages),
      model,
    });
    const stream = toUIMessageStream({
      generateMessageId: () => assistantMessageId,
      onEnd: async ({ finishReason, isAborted, responseMessage }) => {
        const text = responseMessage.parts
          .filter(isTextUIPart)
          .map((part) => part.text)
          .join("");

        await onFinish({
          isAborted: isAborted || finishReason === "error",
          text,
        });
      },
      onError: (error) => {
        console.error("[chat] gateway stream failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        return "AI 응답을 생성하지 못했습니다.";
      },
      originalMessages: toUiMessages(messages),
      stream: result.stream,
    });

    return Promise.resolve(
      createUIMessageStreamResponse({
        consumeSseStream: consumeStream,
        headers: STREAM_HEADERS,
        stream,
      })
    );
  }

  replay({ assistantMessageId, text }: ChatModelReplayOptions) {
    const textPartId = `${assistantMessageId}-text`;
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ messageId: assistantMessageId, type: "start" });
        writer.write({ id: textPartId, type: "text-start" });
        writer.write({ delta: text, id: textPartId, type: "text-delta" });
        writer.write({ id: textPartId, type: "text-end" });
        writer.write({ finishReason: "stop", type: "finish" });
      },
    });

    return createUIMessageStreamResponse({
      consumeSseStream: consumeStream,
      headers: STREAM_HEADERS,
      stream,
    });
  }
}

export function createProductionChatDependencies(): ChatDependencies {
  return {
    createRepository: (context) =>
      new SupabaseChatRepository(context.supabaseAdmin),
    model: new GatewayChatModel(),
  };
}
