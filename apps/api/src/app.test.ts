import { describe, expect, test } from "bun:test";
import { inspect } from "node:util";

import { APICallError, type LanguageModelV4StreamPart } from "@ai-sdk/provider";
import { withSupabase } from "@supabase/server/adapters/hono";
import { MockLanguageModelV4, simulateReadableStream } from "ai/test";
import { encode as encodePng } from "fast-png";
import type { MiddlewareHandler } from "hono";
import finalCorrectionEvaluation from "../eval/results/correction-candidate-1789228066622.json";

import deployedApp, { createApp } from "./app";

const EPISODE_PATH = "/ai/episode";

test("Vercel 진입점이 health 요청에 응답한다", async () => {
  const response = await deployedApp.request("/health");
  expect(response.status).toBe(200);
});

/**
 * A real Supabase project is not reachable from a unit test, so the URL is the
 * one piece of environment the middleware still needs to get as far as reading
 * credentials. Everything after that — missing header, unverifiable token — is
 * the real check running.
 */
function createUserAuthMiddleware(): MiddlewareHandler {
  return withSupabase({
    auth: "user",
    env: { url: "http://localhost:54321" },
  });
}

const STORY_ID = "10000000-0000-4000-8000-000000000001";
/** 테스트가 이어가는 회차. 새로 시작하는 요청만 이 값을 싣지 않는다. */
const STORY_PLAY_ID = "1a000000-0000-4000-8000-000000000001";
/** 새 회차가 생길 때 가짜 데이터베이스가 붙이는 id. */
const NEW_RUN_ID = "1a000000-0000-4000-8000-00000000000f";
const EPISODE_IDS = [1, 2, 3, 4, 5].map(
  (number) => `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`
);

function episodeId(number: number): string {
  const id = EPISODE_IDS[number - 1];

  if (!id) {
    throw new Error(`Episode ${number} is not in the test story.`);
  }

  return id;
}

const STORY_ROW = {
  completion_copy: "다섯 번의 사건을 영어로 지나왔어요.",
  completion_title: "첫 이야기를 끝냈어요",
  cover_blurhash: "LAME]I7y8w{e009uBC,t1j%f_1My",
  cover_emoji: "☕",
  cover_image_path: null,
  created_at: "2026-01-01T00:00:00.000Z",
  hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
  id: STORY_ID,
  intro: "매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.",
  owner_id: null,
  position: 1,
  slug: "mia-cafe",
  target_language: "en",
  title: "Mia의 카페",
};

/** 부른 사람이 만든 스토리. 자리와 열쇠가 없고 주인이 있다. */
const MADE_STORY_ID = "10000000-0000-4000-8000-0000000000f1";
/** 저장이 끝난 뒤 앱이 바로 여는 1화. */
const MADE_EPISODE_ID = "11000000-0000-4000-8000-0000000000f1";

const MADE_STORY_ROW = {
  completion_copy: "호텔부터 미팅까지 영어로 지나왔어요.",
  completion_title: "출장을 마쳤어요",
  cover_blurhash: null,
  cover_emoji: "🧳",
  cover_image_path: null,
  created_at: "2026-09-10T00:00:00.000Z",
  hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
  id: MADE_STORY_ID,
  intro: "첫 해외 출장으로 떠난 베를린에서 보내는 일주일.",
  owner_id: "user-1",
  position: null,
  slug: null,
  target_language: "en",
  title: "베를린 출장 일주일",
};

const TEST_EPISODES = [
  {
    cast_names: ["Mia"],
    id: episodeId(1),
    number: 1,
    opening:
      "카페 카운터 앞이다.\nMia: Next in line, please!\n직원은 벌써 뒤에 선 손님을 부른다.",
    preview: "주문과 다른 커피가 나왔어요.",
    situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
    situation_emoji: "☕",
    stage: "사용자는 잘못 나온 커피를 바꿔야 한다.",
    title: "카페에서 생긴 일",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(2),
    number: 2,
    opening:
      "다음 날 아침, 같은 카페다.\nMia: Hmm, it says declined. Do you want to try it again?",
    preview: "카드가 자꾸 튕겨요.",
    situation: "다른 방법을 찾아 계산을 끝내 보세요",
    situation_emoji: "💳",
    stage: "사용자는 다른 방법으로 결제를 끝내야 한다.",
    title: "계산이 꼬인 아침",
  },
  {
    cast_names: ["Mia", "Owen"],
    id: episodeId(3),
    number: 3,
    opening: "Owen: Oh, is this yours?",
    preview: "창가 자리에 다른 사람이 앉아 있어요.",
    situation: "맡아 둔 자리를 되찾아 보세요",
    situation_emoji: "🪑",
    stage: "사용자는 맡아 둔 자리를 정리해야 한다.",
    title: "자리를 맡아 둔 사이에",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(4),
    number: 4,
    opening: "Mia: Try this one. Be honest, okay?",
    preview: "Mia가 새 메뉴의 감상을 물어요.",
    situation: "맛에 대한 생각을 솔직하게 전해 보세요",
    situation_emoji: "🥤",
    stage: "사용자는 새 음료의 감상을 전해야 한다.",
    title: "이름 없는 신메뉴",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(5),
    number: 5,
    opening: "Mia: Today is my last shift here.",
    preview: "오늘이 Mia의 마지막 근무예요.",
    situation: "문 닫기 전에 하고 싶은 말을 건네 보세요",
    situation_emoji: "👋",
    stage: "사용자는 마지막 인사를 건네야 한다.",
    title: "마지막 잔",
  },
].map((episode) => ({
  ending_compromise: "일부만 해결했을 때",
  ending_failure: "해결하지 못했을 때",
  ending_success: "원하는 결과를 얻었을 때",
  story_id: STORY_ID,
  ...episode,
}));

/**
 * 스토리가 소유한 인물. 화가 바뀌어도 같은 설명을 쓴다.
 *
 * `position`이 이름표 색의 번호이자 스토리 안의 순서다. 실제 각본처럼 Mia가 1,
 * Owen이 2로 서서 어느 화에서 읽어도 같은 번호가 나온다.
 */
const CHARACTER_ID = (position: number) =>
  `cccccccc-cccc-4ccc-8ccc-cccccccccc0${position}`;

const TEST_CHARACTERS = [
  {
    id: CHARACTER_ID(1),
    name: "Mia",
    persona:
      "20대 후반의 바리스타. 바쁘지만 손님이 곤란하면 방법을 같이 찾는다.",
    position: 1,
    story_id: STORY_ID,
  },
  {
    id: CHARACTER_ID(2),
    name: "Owen",
    persona: "30대 초반의 회사원. 예의는 있지만 급하면 재촉한다.",
    position: 2,
    story_id: STORY_ID,
  },
];

/** 어느 화에 누가 서는지. `at`이 그 화의 목록에서의 자리다. */
const TEST_EPISODE_CHARACTERS = TEST_EPISODES.flatMap((episode) =>
  episode.cast_names.map((name, index) => ({
    at: index + 1,
    character_id: CHARACTER_ID(
      TEST_CHARACTERS.find((person) => person.name === name)?.position ?? 1
    ),
    episode_id: episode.id,
    story_id: STORY_ID,
  }))
);

/** A finished play as the database hands it back. */
interface FinishedRow {
  ending_kind: string;
  ending_outcome: string;
  episode: number;
  episode_id?: string;
  memory_choice?: string | null;
  memory_question?: string | null;
  memory_relationship?: string | null;
}

/** One stored message, the way `episode_messages` holds it. */
interface MessageRow {
  created_at: string;
  id: string;
  parts: unknown[];
  play_id: string;
  role: string;
}

/**
 * 넣는 차례대로 커지는 시각. 데이터베이스의 `clock_timestamp()` 자리다.
 *
 * 실제 시계를 쓰지 않는 것은 한 테스트가 밀리초 안에 여러 행을 넣기 때문이다.
 * 여기서 차례를 잃으면 정렬이 무의미해져 순서 결함을 잡지 못한다.
 */
let storedClock = 0;

function nextCreatedAt(): string {
  storedClock += 1;

  return new Date(Date.UTC(2026, 7, 29, 0, 0, storedClock)).toISOString();
}

/**
 * The story progress a signed-in request finds, and what it wrote.
 *
 * `recorded` is the whole point: the episode route is supposed to leave the
 * ending in the account before the app is told the scene is over, and a test
 * that only read the response could not tell the difference. `messages` is the
 * other half — the server now saves message rows itself, so what lands there is
 * what a reopened episode shows.
 */
/** 담아 둔 표현 한 줄, `saved_expressions`가 들고 있는 모양대로. */
interface SavedRow {
  created_at: string;
  english: string;
  entries: { fixed: string; original: string; why: string }[] | null;
  episode_id: string;
  id: string;
  kind: string;
  meaning: string | null;
  message_id: string | null;
  original: string | null;
  speaker: string | null;
  utterance_at: number | null;
}
/** 회차 한 줄, `story_plays`가 들고 있는 모양대로. */
interface StoryPlayRow {
  id: string;
  last_user_message_at: string | null;
  started_at: string;
  story_id: string;
}

interface SeasonState {
  /** 교정을 남기는 문장만 실패시킨다. 장면 저장은 그대로 성공한다. */
  correctionSaveError?: string;
  expressionResults: Record<string, unknown>[];
  finished: FinishedRow[];
  /** `set_story_cover`가 받은 표지 요청. */
  madeCoverRequests?: Record<string, unknown>[];
  /**
   * 부른 사람이 만든 스토리. 이것을 부르는 테스트에만 보인다.
   *
   * 기본으로 두면 공식 목록만 세는 다른 테스트가 함께 흔들린다.
   */
  madeStories?: Record<string, unknown>[];
  /** `create_story`가 받은 저장 요청. 무엇을 저장하려 했는지를 여기서 본다. */
  madeStoryRequests?: Record<string, unknown>[];
  messages: MessageRow[];
  recordAccepted?: boolean;
  recordError?: string;
  recorded: Record<string, unknown>[];
  runs: StoryPlayRow[];
  saved: SavedRow[];
  saveError?: string;
  /** 표지 파일이 올라간 자리. */
  uploadedCovers?: { bytes: Uint8Array; path: string }[];
}

/** 이미 진행 중인 회차 하나. 이어가는 테스트가 기본으로 쓴다. */
function startedStoryPlay(): StoryPlayRow {
  return {
    id: STORY_PLAY_ID,
    last_user_message_at: "2026-08-29T00:05:00.000Z",
    started_at: "2026-08-29T00:00:00.000Z",
    story_id: STORY_ID,
  };
}

function createSeasonState(finished: FinishedRow[] = []): SeasonState {
  return {
    expressionResults: [],
    finished,
    messages: [],
    recorded: [],
    runs: [startedStoryPlay()],
    saved: [],
  };
}

/** 아직 아무 회차도 없는 계정. 새 대화를 시작하는 경로가 쓴다. */
function createEmptyState(): SeasonState {
  const state = createSeasonState();

  state.runs = [];

  return state;
}

/** Every episode of the story, ended. */
function finishedSeason(): FinishedRow[] {
  return [1, 2, 3, 4, 5].map((episode) => ({
    ending_kind: "성공",
    ending_outcome: `${episode}화를 끝냈다.`,
    episode,
  }));
}

/** The play id an episode's rows hang from. One play per episode here. */
function playIdOf(episodeIdentifier: string): string {
  return `play-${episodeIdentifier}`;
}

type Row = Record<string, unknown>;

/**
 * Stands in for a request whose token and current user both still exist,
 * reaching a database that holds `state`.
 *
 * The builder covers exactly the calls the episode feature makes: reading the
 * catalog, reading a play, opening one, reading and appending messages, and
 * dropping the tail a retry replaces. Anything else is left out on purpose, so
 * a new query has to be taught here rather than passing silently.
 */
function signedInWith(
  state: SeasonState,
  /** 인물 행이 아직 없는 DB. 콘텐츠가 API보다 늦게 올라간 사이를 흉내 낸다. */
  fixtures: { withoutCharacters?: boolean } = {}
): MiddlewareHandler {
  const openedPlays = new Set<string>();
  /** 이번 요청이 연 플레이가 어느 회차에 붙었는지. */
  const openedStoryPlays = new Map<string, string>();

  function finishedRows(): Row[] {
    return state.finished.map(({ episode, ...row }) => {
      const identifier = row.episode_id ?? episodeId(episode);

      return {
        ...row,
        episode_id: identifier,
        finished_at: `2026-08-29T00:0${episode}:00.000Z`,
        id: playIdOf(identifier),
        started_at: `2026-08-29T00:0${episode}:00.000Z`,
        // 진행은 회차 안에서만 읽힌다. 가짜도 그 열을 달아 주어야 회차로 거르는
        // 조회가 실제와 같은 답을 낸다.
        story_play_id: state.runs.at(0)?.id ?? STORY_PLAY_ID,
      };
    });
  }

  function playRows(): Row[] {
    const finished = finishedRows();
    const known = new Set([
      ...openedPlays,
      ...state.messages.map((message) => message.play_id),
    ]);
    const open = [...known]
      .filter((id) => !finished.some((play) => play.id === id))
      .map((id) => ({
        ending_kind: null,
        ending_outcome: null,
        episode_id: id.slice("play-".length),
        finished_at: null,
        id,
        started_at: "2026-08-29T00:10:00.000Z",
        story_play_id:
          openedStoryPlays.get(id) ?? state.runs.at(0)?.id ?? STORY_PLAY_ID,
      }));

    return [...finished, ...open];
  }

  const client = {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: "user-1" } },
          error: null,
        }),
    },
    from: (table: string) => {
      const equals = new Map<string, unknown>();
      const sorted: { ascending: boolean; column: string }[] = [];
      /** `not(column, "is", null)`이 거르는 열. */
      const present = new Set<string>();
      let within: { column: string; values: unknown[] } | undefined;
      let after: { column: string; value: string } | undefined;
      let nested = false;
      let nestedEpisode = false;
      let nestedPlays = false;
      let wantsCounts = false;
      const value = (row: Row, column: string) => row[column];

      function source(): Row[] {
        if (table === "stories") {
          return [STORY_ROW, ...(state.madeStories ?? [])] as unknown as Row[];
        }

        if (table === "episodes") {
          return TEST_EPISODES as unknown as Row[];
        }

        if (table === "characters") {
          return (fixtures.withoutCharacters
            ? []
            : TEST_CHARACTERS) as unknown as Row[];
        }

        if (table === "episode_characters") {
          return (fixtures.withoutCharacters
            ? []
            : TEST_EPISODE_CHARACTERS) as unknown as Row[];
        }

        if (table === "story_plays") {
          return state.runs as unknown as Row[];
        }

        if (table === "episode_plays") {
          return playRows();
        }

        if (table === "episode_messages") {
          return [...state.messages].sort((left, right) =>
            left.created_at.localeCompare(right.created_at)
          ) as unknown as Row[];
        }

        if (table === "episode_expression_results") {
          const play = new Map(
            state.messages.map((message) => [message.id, message.play_id])
          );
          return state.expressionResults.map((row) => ({
            ...row,
            "episode_messages.play_id": play.get(String(row.message_id)),
          }));
        }

        if (table === "saved_expressions") {
          // 담아 둔 표현도 교정과 같은 자리에 매달린다. 원본을 잃은 항목은 걸
          // 메시지가 없어 이 조회에 오지 않는다.
          const play = new Map(
            state.messages.map((message) => [message.id, message.play_id])
          );

          return [...state.saved]
            .sort((left, right) =>
              left.created_at.localeCompare(right.created_at)
            )
            .map((row) => ({
              ...row,
              "episode_messages.play_id": row.message_id
                ? play.get(row.message_id)
                : undefined,
            })) as unknown as Row[];
        }

        return [];
      }

      function rows(): Row[] {
        const kept = source().filter(
          (row) =>
            [...equals].every(
              ([name, wanted]) => value(row, name) === wanted
            ) &&
            [...present].every(
              (name) =>
                value(row, name) !== null && value(row, name) !== undefined
            ) &&
            (!within || within.values.includes(value(row, within.column))) &&
            (after === undefined ||
              String(value(row, after.column)) > after.value)
        );
        const [by] = sorted;
        // 숫자로 견주면 시각 문자열이 NaN이 되어 정렬이 통째로 무너진다.
        const ordered = by
          ? [...kept].sort((left, right) => {
              const compared = String(value(left, by.column)).localeCompare(
                String(value(right, by.column))
              );

              return by.ascending ? compared : -compared;
            })
          : kept;

        // 중첩 select는 스토리 한 줄에 그 스토리의 화 목록을, 회차 한 줄에 그
        // 회차의 플레이를, 플레이 한 줄에 그 플레이에 남은 메시지 수를 달아 준다.
        if (nested) {
          return ordered.map((row) => ({
            ...row,
            episodes: TEST_EPISODES.filter(
              (episode) => episode.story_id === value(row, "id")
            ),
          }));
        }

        // 표현 노트는 담긴 행에서 에피소드를, 그 에피소드에서 스토리를 타고
        // 제목과 화 번호를 읽는다.
        if (nestedEpisode) {
          return ordered.map((row) => {
            const episode = TEST_EPISODES.find(
              (candidate) => candidate.id === value(row, "episode_id")
            );

            return {
              ...row,
              episodes: {
                number: episode?.number ?? 0,
                stories: { title: STORY_ROW.title },
              },
            };
          });
        }

        if (nestedPlays) {
          return ordered.map((run) => ({
            ...run,
            episode_plays: playRows()
              .filter(
                (play) => value(play, "story_play_id") === value(run, "id")
              )
              .map((play) => ({
                ...play,
                episode_messages: [
                  {
                    count: state.messages.filter(
                      (message) => message.play_id === play.id
                    ).length,
                  },
                ],
              })),
          }));
        }

        if (wantsCounts) {
          return ordered.map((play) => ({
            ...play,
            episode_messages: [
              {
                count: state.messages.filter(
                  (message) => message.play_id === play.id
                ).length,
              },
            ],
          }));
        }

        return ordered;
      }

      /**
       * `await` 한 번으로 끝나는 쓰기와 `.select()`가 붙는 쓰기를 함께 받는다.
       *
       * `await`는 thenable이 아닌 값을 그대로 돌려주므로, 앞의 경우도 이 객체가
       * 그대로 결과가 된다.
       */
      function writeResult(data: Row | null) {
        const failure = state.saveError ? { message: state.saveError } : null;

        return {
          error: failure,
          select: () => ({
            maybeSingle: () => Promise.resolve({ data, error: failure }),
            single: () => Promise.resolve({ data, error: failure }),
          }),
        };
      }

      /*
        빌더 자신이 Promise다.

        PostgREST 빌더는 필터를 더 걸 수도 있고 그대로 await할 수도 있어서,
        가짜도 두 쓰임을 다 받아야 한다. then 속성을 손으로 다는 대신 진짜
        Promise에 메서드를 붙이면, 결과를 읽는 시점이 마이크로태스크로 밀려
        그 앞의 필터 호출이 모두 반영된 뒤에 행을 고른다.
      */
      const builder: object = Object.assign(
        Promise.resolve().then(() => ({ data: rows(), error: null })),
        {
          delete: () => {
            // 지우는 문장은 두 모양으로 온다. 뒤를 잘라 내는 삭제는 `gt`에서 곧바로
            // 끝나고, 담아 둔 표현 하나를 지우는 문장은 필터만 걸고 await한다. 한
            // 번만 지우도록 표시를 남긴다.
            let done = false;

            function remove() {
              if (done) {
                return { error: null };
              }

              done = true;

              const doomed = new Set(rows().map((row) => String(row.id)));

              if (table === "saved_expressions") {
                state.saved = state.saved.filter((row) => !doomed.has(row.id));
              } else {
                state.messages = state.messages.filter(
                  (message) => !doomed.has(message.id)
                );
              }

              return { error: null };
            }

            const removal: object = Object.assign(
              Promise.resolve().then(() => remove()),
              {
                eq: (column: string, wanted: unknown) => {
                  equals.set(column, wanted);

                  return removal;
                },
                gt: (column: string, wanted: string) => {
                  after = { column, value: wanted };

                  return Promise.resolve(remove());
                },
              }
            );

            return removal;
          },
          eq: (column: string, wanted: unknown) => {
            equals.set(column, wanted);

            return builder;
          },
          in: (column: string, values: unknown[]) => {
            within = { column, values };

            return builder;
          },
          insert: (payload: Row | Row[]) => {
            const added = Array.isArray(payload) ? payload : [payload];

            if (table === "saved_expressions") {
              const row = added[0] as unknown as SavedRow;
              // 진짜 유니크 색인은 `(message_id, coalesce(utterance_at, -1))`이고
              // 종류를 열쇠에 넣지 않는다. 한 메시지가 교정과 안내를 둘 다 낳지
              // 못하게 막는 것이 그 규칙이므로 여기서도 종류를 묻지 않는다.
              const taken = state.saved.some(
                (kept) =>
                  kept.message_id !== null &&
                  kept.message_id === row.message_id &&
                  kept.utterance_at === row.utterance_at
              );

              if (taken) {
                const clash = {
                  code: "23505",
                  message:
                    'duplicate key value violates unique constraint "saved_expressions_one_per_source_idx"',
                };

                return {
                  error: clash,
                  select: () => ({
                    maybeSingle: () =>
                      Promise.resolve({ data: null, error: clash }),
                    single: () => Promise.resolve({ data: null, error: clash }),
                  }),
                };
              }

              // 열이 uuid라 가짜도 같은 모양을 낸다. 취소 경로가 경로 조각의
              // 모양을 확인하므로, 짧은 문자열은 실제와 다른 답을 만든다.
              const stored: SavedRow = {
                ...row,
                created_at: nextCreatedAt(),
                id: `5a4ed000-0000-4000-8000-${(state.saved.length + 1)
                  .toString()
                  .padStart(12, "0")}`,
              };

              state.saved.push(stored);

              return writeResult(stored as unknown as Row);
            }

            if (table === "episode_expression_results") {
              if (state.correctionSaveError) {
                return { error: { message: state.correctionSaveError } };
              }
              if (
                added.some((row) =>
                  state.expressionResults.some(
                    (saved) => saved.message_id === row.message_id
                  )
                )
              ) {
                return {
                  error: {
                    code: "23505",
                    message: "duplicate expression result",
                  },
                };
              }
              state.expressionResults.push(...added);
              return writeResult(null);
            }

            if (table === "episode_messages") {
              if (state.saveError) {
                return writeResult(null);
              }

              // 기본키를 흉내낸다. 같은 메시지를 두 번 넣으려는 시도는 거절된다.
              const taken = new Set(
                state.messages.map((message) => message.id)
              );

              for (const row of added) {
                if (taken.has(String(row.id))) {
                  return {
                    error: {
                      message: `duplicate key value violates unique constraint "episode_messages_pkey"`,
                    },
                    select: () => ({
                      maybeSingle: () =>
                        Promise.resolve({ data: null, error: null }),
                    }),
                  };
                }
              }

              state.messages.push(
                ...added.map(
                  (row) =>
                    ({
                      created_at: nextCreatedAt(),
                      ...row,
                    }) as unknown as MessageRow
                )
              );

              return writeResult(null);
            }

            if (table === "story_plays") {
              const run: StoryPlayRow = {
                id: NEW_RUN_ID,
                last_user_message_at: null,
                started_at: nextCreatedAt(),
                story_id: String(added[0]?.story_id),
              };

              state.runs.push(run);

              return writeResult(run as unknown as Row);
            }

            const identifier = String(added[0]?.episode_id);
            const id = playIdOf(identifier);
            const run = String(added[0]?.story_play_id);

            openedPlays.add(id);
            openedStoryPlays.set(id, run);

            return writeResult({
              episode_id: identifier,
              id,
              story_play_id: run,
            });
          },
          // `is(column, null)`은 그 열이 빈 행만 남긴다. 인물 대사가 아닌 항목을
          // 자리 번호 없이 찾는 조회가 쓴다.
          is: (column: string, wanted: unknown) => {
            equals.set(column, wanted);

            return builder;
          },
          maybeSingle: () =>
            Promise.resolve({ data: rows()[0] ?? null, error: null }),
          // `not(column, "is", null)`은 그 열이 채워진 행만 남긴다. 끝난 플레이를
          // 고르는 조회와, 사용자가 말한 적 있는 회차를 고르는 조회가 함께 쓴다.
          not: (column: string) => {
            present.add(column);

            return builder;
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            sorted.push({ ascending: options?.ascending !== false, column });

            return builder;
          },
          select: (projection?: string) => {
            nested = projection?.includes("episodes(") ?? false;
            nestedEpisode = projection?.includes("episodes!inner(") ?? false;
            nestedPlays = projection?.includes("episode_plays(") ?? false;
            wantsCounts = projection?.includes("episode_messages(") ?? false;

            return builder;
          },
          single: () =>
            Promise.resolve({ data: rows()[0] ?? null, error: null }),
        }
      );

      return builder;
    },
    rpc: (name: string, args: Record<string, unknown>) => {
      if (name === "create_story") {
        state.madeStoryRequests?.push(args);

        return Promise.resolve({
          data: [
            {
              first_episode_id: MADE_EPISODE_ID,
              story_id: MADE_STORY_ID,
            },
          ],
          error: null,
        });
      }

      if (name === "set_story_cover") {
        state.madeCoverRequests?.push(args);

        return Promise.resolve({ data: null, error: null });
      }

      if (name !== "finish_episode") {
        throw new Error(`Unexpected rpc call: ${name}`);
      }

      state.recorded.push(args);

      return Promise.resolve({
        data: state.recordAccepted ?? true,
        error: state.recordError ? { message: state.recordError } : null,
      });
    },
    storage: {
      from: () => ({
        upload: (path: string, bytes: Uint8Array) => {
          state.uploadedCovers?.push({ bytes, path });

          return Promise.resolve({ error: null });
        },
      }),
    },
  };

  return (c, next) => {
    c.set("supabaseContext", { supabase: client } as never);

    return next();
  };
}

/**
 * A signed-in request whose account has not finished anything yet.
 *
 * 요청마다 빈 기록을 새로 준다. 서버가 지난 장면을 자기 기록에서 읽으므로, 한
 * 상태를 나눠 쓰면 앞 테스트가 남긴 대화를 다음 테스트가 이어 받는다.
 */
const bypassAuth: MiddlewareHandler = (c, next) =>
  signedInWith(createSeasonState())(c, next);

/** A validly signed token left on a device after its account was deleted. */
const deletedUserAuth: MiddlewareHandler = (c, next) => {
  c.set("supabaseContext", {
    supabase: {
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new Error("User from sub claim in JWT does not exist"),
          }),
      },
    },
  } as never);

  return next();
};

/**
 * 교정 판정이 돌려줄 답.
 *
 * 장면과 같은 모델을 쓰되 부르는 방법이 달라서, 이 답은 `doStream`이 아니라
 * `doGenerate` 자리에 놓인다. 기본값이 "고칠 것 없음"이라 교정을 시험하지 않는
 * 테스트는 예전과 똑같이 돈다.
 */
interface CorrectionAnswer {
  entries: {
    fixed: string;
    original: string;
    pattern: string;
    why: string;
  }[];
  fixed: string;
  review?: {
    situation: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
  } | null;
  status?: "corrected" | "natural" | "unclear";
}

const NO_CORRECTION: CorrectionAnswer = { entries: [], fixed: "" };

/** 확정한 개요 하나. `대화 시작하기`가 이 모양을 보낸다. */
/** 만든 표지가 사는 자리. 부른 사람의 폴더 안이고 이름은 내용의 해시다. */
const MADE_COVER_PATH = /^made\/user-1\/[0-9a-f]{64}\.png$/;

const MADE_OUTLINE = {
  characters: [
    { name: "Lena", position: 1, role: "호텔 프런트 직원." },
    { name: "Markus", position: 2, role: "거래처 담당자." },
  ],
  episodes: [
    {
      cast: ["Lena"],
      number: 1,
      preview: "밤늦게 도착했는데 제 예약이 없대요.",
      title: "예약이 없는 호텔",
    },
  ],
  hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
  setting: "베를린의 호텔 프런트",
  title: "베를린 출장 일주일",
};

/** 형식을 지킨 각본 하나. 모델이 돌려주는 값을 대신한다. */
const WRITTEN_STORY = {
  characters: [{ name: "Lena", persona: "30대 호텔 직원이다.", position: 1 }],
  completionCopy: "호텔부터 미팅까지 영어로 지나왔어요.",
  completionTitle: "출장을 마쳤어요",
  coverEmoji: "🧳",
  episodes: [
    {
      castNames: ["Lena"],
      endingCompromise: "임시 방법을 받았을 때",
      endingFailure: "방을 받지 못했을 때",
      endingSuccess: "방을 배정받았을 때",
      number: 1,
      opening:
        "밤 열한 시, 호텔 프런트 앞에 도착했다.\nLena: I cannot find a reservation under your name.",
      preview: "밤늦게 도착했는데 제 예약이 없대요.",
      situation: "예약을 찾아 방을 받아 보세요",
      situationEmoji: "🏨",
      stage: "상황:\n- 사용자가 말을 해야 이 일이 풀린다.",
      title: "예약이 없는 호텔",
    },
  ],
  intro: "첫 해외 출장으로 떠난 베를린에서 보내는 일주일.",
};

/** 각본을 한 번에 돌려주는 모델. 저장 경로만 시험한다. */
function createWritingModel(answer: unknown = WRITTEN_STORY) {
  return new MockLanguageModelV4({
    doGenerate: () =>
      Promise.resolve({
        content: [{ text: JSON.stringify(answer), type: "text" as const }],
        finishReason: { raw: undefined, unified: "stop" as const },
        usage: {
          inputTokens: {
            cacheRead: undefined,
            cacheWrite: undefined,
            noCache: undefined,
            total: undefined,
          },
          outputTokens: {
            reasoning: undefined,
            text: undefined,
            total: undefined,
          },
        },
        warnings: [],
      }),
  });
}

function createMockModel(
  text: string[],
  correction: CorrectionAnswer = NO_CORRECTION,
  meaning = "다음 분이요!"
): MockLanguageModelV4 {
  const chunks: LanguageModelV4StreamPart[] = [
    { type: "stream-start", warnings: [] },
    { id: "0", type: "text-start" },
    ...text.map((delta) => ({ delta, id: "0", type: "text-delta" as const })),
    { id: "0", type: "text-end" },
    {
      finishReason: { raw: undefined, unified: "stop" },
      type: "finish",
      usage: {
        inputTokens: {
          cacheRead: undefined,
          cacheWrite: undefined,
          noCache: undefined,
          total: undefined,
        },
        outputTokens: {
          reasoning: undefined,
          text: undefined,
          total: undefined,
        },
      },
    },
  ];

  /**
   * 한 모델이 두 판정을 답한다.
   *
   * 교정과 한국어 뜻이 같은 `doGenerate` 자리를 나눠 쓰므로, 무엇을 물었는지는
   * 프롬프트로 가른다. 뜻을 시험하지 않는 테스트는 예전과 똑같이 돈다.
   */
  const answered = (asked: unknown) => {
    const prompt = JSON.stringify(asked ?? "");

    if (prompt.includes("옮길 대사")) {
      return { meaning };
    }

    return {
      review:
        correction.status === "corrected"
          ? {
              example: "I ordered a tea.",
              exampleMeaning: "차를 주문했어요.",
              meaning: "주문한 커피가 아니에요.",
              situation: "주문한 것을 다시 말할 때",
            }
          : null,
      ...correction,
    };
  };

  return new MockLanguageModelV4({
    doGenerate: ({ prompt }) =>
      Promise.resolve({
        content: [
          { text: JSON.stringify(answered(prompt)), type: "text" as const },
        ],
        finishReason: { raw: undefined, unified: "stop" as const },
        usage: {
          inputTokens: {
            cacheRead: undefined,
            cacheWrite: undefined,
            noCache: undefined,
            total: undefined,
          },
          outputTokens: {
            reasoning: undefined,
            text: undefined,
            total: undefined,
          },
        },
        warnings: [],
      }),
    doStream: {
      stream: simulateReadableStream({
        chunkDelayInMs: null,
        chunks,
        initialDelayInMs: null,
      }),
    },
  });
}

/**
 * 앱이 보내는 요청 하나.
 *
 * `messages`로 적어도 실제로 나가는 것은 마지막 하나뿐이다. 앱은 새로 쓴 말만
 * 싣고 지난 장면은 서버가 자기 기록에서 읽으므로, 여기서도 같은 모양으로 줄여
 * 보낸다.
 */
function createEpisodeRequest(
  body: {
    episodeId?: string;
    keepThrough?: string | null;
    message?: unknown;
    messages?: unknown[];
    storyPlayId?: string | null;
    seenPatterns?: string[];
    storyId?: string;
  },
  token?: string
): Request {
  const { messages, storyPlayId, ...rest } = body;
  const sent =
    messages === undefined ? rest : { ...rest, message: messages.at(-1) };
  // 이어가는 요청이 기본이다. `storyPlayId: null`은 회차를 싣지 않는다는 뜻이라, 새
  // 대화를 시작하는 테스트가 그렇게 적는다.
  const payload =
    storyPlayId === null || rest.storyId !== undefined
      ? sent
      : { ...sent, storyPlayId: storyPlayId ?? STORY_PLAY_ID };

  return new Request(`http://localhost${EPISODE_PATH}`, {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    method: "POST",
  });
}

function createRecentRequest(token?: string): Request {
  return new Request(`http://localhost${EPISODE_PATH}/recent`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

/** 저장된 대화 한 화를 회차와 함께 읽는 요청. */
function episodeSessionPath(
  number: number,
  storyPlayId: string = STORY_PLAY_ID
): string {
  return `${EPISODE_PATH}/${episodeId(number)}?storyPlayId=${storyPlayId}`;
}

function createUserMessage(text: string) {
  return {
    id: "m1",
    parts: [{ text, type: "text" }],
    role: "user",
  };
}

/** Polls until the stream-side effect of an abort has had time to land. */
function until(predicate: () => boolean, timeoutMs = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (predicate()) {
        resolve();

        return;
      }

      if (Date.now() > deadline) {
        reject(new Error("Condition did not become true in time"));

        return;
      }

      setTimeout(tick, 10);
    };

    tick();
  });
}

/**
 * A model whose stream never ends on its own, so the only way the call can
 * stop is the abort under test. The signal `doStream` actually received stays
 * readable on `doStreamCalls` afterwards.
 */
function neverEndingModel(): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    doStream: () =>
      Promise.resolve({
        stream: new ReadableStream<LanguageModelV4StreamPart>({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ id: "0", type: "text-start" });
            controller.enqueue({
              delta: "첫 조각",
              id: "0",
              type: "text-delta",
            });
            // Never closes: a finish would end the request without the abort.
          },
        }),
      }),
  });
}

/**
 * Sends an authenticated chat request wired to an AbortController, reads the
 * first body chunk so the stream is really flowing, then aborts.
 */
async function abortMidStream(
  app: ReturnType<typeof createApp>,
  request: Request
): Promise<void> {
  const controller = new AbortController();
  const response = await app.request(
    new Request(request, { signal: controller.signal })
  );

  expect(response.status).toBe(200);

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response has no body to read");
  }

  await reader.read();
  controller.abort();

  // Reading past the abort surfaces the cancellation; the error itself is the
  // expected outcome, not a failure of the test.
  await reader.read().catch(() => undefined);
}

describe("GET /health", () => {
  test("answers without credentials or AI configuration", async () => {
    const response = await createApp({
      authMiddleware: createUserAuthMiddleware(),
    }).request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});

describe("제거한 일반 채팅", () => {
  test("제거한 일반 채팅 경로는 모델을 호출하지 않고 404를 반환한다", async () => {
    const model = createMockModel(["답변"]);
    const app = createApp({ authMiddleware: bypassAuth, model });
    const response = await app.request(
      new Request("http://localhost/ai/chat", {
        body: JSON.stringify({ messages: [createUserMessage("질문")] }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(404);
    expect(model.doStreamCalls).toHaveLength(0);
  });
});

describe("POST /ai/episode", () => {
  test("rejects a request with no access token before calling the model", async () => {
    const model = createMockModel(["Mia: Sorry about that."]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("This is wrong")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 입력하기 전에 상대가 먼저 말한다. 정해 둔 장면이라 기다림도 없고, 다시
  // 들어와도 같은 카페가 열린다.
  test("opens the first scene itself, without calling the model", async () => {
    const model = createMockModel(["Mia: Sorry about that."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(createEpisodeRequest({ messages: [] }));

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(model.doStreamCalls).toHaveLength(0);
    // 대사는 화자가 붙은 영어 한 줄, 상황은 이름 없는 한국어 지문으로 흐른다.
    expect(body).toContain('"name":"Mia"');
    expect(body).toContain('"name":null');
    expect(body).toContain("Next in line, please!");
    expect(body).toContain("카페 카운터");
    expect(body).not.toContain("Mia:");
  });

  test("turns the model's scene into speaker parts and narration", async () => {
    const model = createMockModel([
      "Mia: Oh, I am sorry.\n",
      "직원이 잔을 내려놓는다.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("This is not what I ordered.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain('"type":"data-speaker"');
    expect(body).toContain('"name":"Mia"');
    expect(body).toContain("Oh, I am sorry.");
    expect(body).toContain("직원이 잔을 내려놓는다.");
    expect(body).not.toContain("Mia:");
  });

  // 결말은 사용자의 말이 만든다. 모델이 사건을 닫았다고 쓰면 그 줄은 말풍선이
  // 아니라 에피소드를 닫는 판정으로 내려간다.
  test("closes the episode when the model writes an ending", async () => {
    const model = createMockModel([
      "Mia: Here is your iced americano.\n",
      "성공: 원하던 커피를 새로 받아냈다.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I ordered an iced americano.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(body).toContain('"kind":"성공"');
    expect(body).toContain("원하던 커피를 새로 받아냈다.");
    expect(body).not.toContain("성공:");
  });

  test("leaves a scene that is still running without an ending", async () => {
    const model = createMockModel(["Mia: What did you order?"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("This is wrong.")],
      })
    );

    const body = await response.text();

    expect(body).not.toContain('"type":"data-ending"');
  });

  // 지난 장면은 앱이 되돌려 보내지 않는다. 서버가 자기 기록에서 읽어 붙인다.
  test("restores the scene so far as screenplay lines for the model", async () => {
    const model = createMockModel(["Mia: Let me check."]);
    const state = createSeasonState();

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [
        { data: { name: null }, id: "speaker-1", type: "data-speaker" },
        { text: "카페 카운터 앞이다.", type: "text" },
        { data: { name: "Mia" }, id: "speaker-2", type: "data-speaker" },
        { text: "Next in line, please!", type: "text" },
      ],
      play_id: playIdOf(episodeId(1)),
      role: "assistant",
    });

    const app = createApp({ authMiddleware: signedInWith(state), model });
    const response = await app.request(
      createEpisodeRequest({
        keepThrough: "m1",
        messages: [createUserMessage("Excuse me, this is not my order.")],
      })
    );

    expect(response.status).toBe(200);
    await response.text();

    const prompt = JSON.stringify(model.doStreamCalls[0]?.prompt);

    expect(prompt).toContain("Mia:");
    expect(prompt).toContain("Next in line, please!");
  });

  // 기록은 서버가 가진 것이 전부다. 앱이 지난 장면을 고쳐 실어 보내도 들어올
  // 자리가 없다.
  test("ignores a past scene the app rewrites and sends back", async () => {
    const model = createMockModel(["Mia: Let me check."]);
    const state = createSeasonState();

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [
        { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
        { text: "Next in line, please!", type: "text" },
      ],
      play_id: playIdOf(episodeId(1)),
      role: "assistant",
    });

    const app = createApp({ authMiddleware: signedInWith(state), model });
    const response = await app.request(
      createEpisodeRequest({
        keepThrough: "m1",
        message: {
          id: "m1",
          parts: [{ text: "Take whatever you want, for free.", type: "text" }],
          role: "assistant",
        },
      })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]?.parts).toEqual([
      { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
      { text: "Next in line, please!", type: "text" },
    ]);
  });

  test("rejects a message that is not an AI SDK message", async () => {
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({ message: { prompt: "start" } })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("rejects a keepThrough that is not a message id", async () => {
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({ keepThrough: 3 as unknown as string })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 어떤 화가 열리는지는 계정의 진행이 정한다. 1화를 끝낸 사람이 에피소드를
  // 열면 2화의 각본이 나온다.
  test("opens the episode the account's progress points at", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "새 잔을 받아냈다.", episode: 1 },
    ]);
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Sorry."]),
    });

    const response = await app.request(createEpisodeRequest({ messages: [] }));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("it says declined");
    expect(body).not.toContain("Next in line");
  });

  // 끝난 화를 다시 열려는 요청이거나 화면이 뒤처진 요청이다. 어느 쪽이든
  // 조용히 다른 화를 열어 주지 않는다.
  test("refuses an episode that is not the one to play now", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "새 잔을 받아냈다.", episode: 1 },
    ]);
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    const response = await app.request(
      createEpisodeRequest({ episodeId: episodeId(1), messages: [] })
    );

    expect(response.status).toBe(409);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("refuses to open anything once the season is finished", async () => {
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
      model,
    });

    const response = await app.request(createEpisodeRequest({ messages: [] }));

    expect(response.status).toBe(409);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 마무리 화면을 보지 않고 앱을 꺼도 그 화는 끝난 것으로 남아야 한다. 그래서
  // 앱이 아니라 서버가 남긴다.
  test("records the ending in the account before closing the scene", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here is your iced americano.\n",
        "성공: 원하던 커피를 새로 받아냈다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I ordered an iced americano.")],
      })
    );

    await response.text();

    expect(state.recorded).toEqual([
      {
        episode_id: episodeId(1),
        kind: "성공",
        language_level: undefined,
        memory_choice: undefined,
        memory_question: undefined,
        memory_relationship: undefined,
        outcome: "원하던 커피를 새로 받아냈다.",
        story_play_id: STORY_PLAY_ID,
      },
    ]);
  });

  // 기억은 결말과 같은 한 번의 출력에서 나온다. 그래서 장면과 기억이 서로
  // 어긋날 수 없고, 화면에는 결말만 보인다.
  test("stores the story memory the closing scene wrote, without showing it", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here is your iced americano.\n",
        "성공: 원하던 커피를 새로 받아냈다.\n",
        "선택: 영수증을 보여 주며 침착하게 요구했다.\n",
        "관계: Mia가 실수를 인정했다.\n",
        "질문: 내일도 이 카페에 들를지.\n",
        "수준: 중급 초반. 짧고 분명한 문장을 쓴다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(state.recorded).toEqual([
      {
        episode_id: episodeId(1),
        kind: "성공",
        language_level: "중급 초반. 짧고 분명한 문장을 쓴다.",
        memory_choice: "영수증을 보여 주며 침착하게 요구했다.",
        memory_question: "내일도 이 카페에 들를지.",
        memory_relationship: "Mia가 실수를 인정했다.",
        outcome: "원하던 커피를 새로 받아냈다.",
        story_play_id: STORY_PLAY_ID,
      },
    ]);
    expect(body).toContain("Here is your iced americano.");
    expect(body).not.toContain("영수증을 보여 주며");
    expect(body).not.toContain("중급 초반");
  });

  // 지난 선택이 다음 화에 돌아오는 길은 프롬프트 하나다. 사건은 그대로 두고
  // 대사와 관계와 지문만 달라진다.
  test("carries the memory of finished episodes into the next episode's prompt", async () => {
    const model = createMockModel(["Mia: Morning."]);
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            ending_kind: "성공",
            ending_outcome: "원하던 커피를 새로 받아냈다.",
            episode: 1,
            memory_choice: "영수증을 보여 주며 침착하게 요구했다.",
            memory_question: "내일도 이 카페에 들를지.",
            memory_relationship: "Mia가 실수를 인정했다.",
          },
        ])
      ),
      model,
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("My card failed.")] })
    );

    await response.text();

    const system = model.doStreamCalls[0]?.prompt.find(
      (message) => message.role === "system"
    );
    const text = JSON.stringify(system);

    expect(text).toContain("지난 이야기");
    expect(text).toContain("1화 「카페에서 생긴 일」");
    expect(text).toContain("영수증을 보여 주며 침착하게 요구했다.");
    expect(text).toContain("Mia가 실수를 인정했다.");
  });

  // 인물 설명이 스토리에 한 벌만 있으므로, 어느 화를 열어도 같은 문장이 들어간다.
  // 등장인물을 부르는 문장도 손으로 쓴 무대가 아니라 그 데이터에서 나온다.
  test("names the cast and its personas from the story's own characters", async () => {
    const model = createMockModel(["Mia: Sure."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    await (
      await app.request(
        createEpisodeRequest({
          messages: [createUserMessage("My card failed.")],
        })
      )
    ).text();

    const system = model.doStreamCalls[0]?.prompt.find(
      (message) => message.role === "system"
    );
    const text = String(
      (system as { content?: unknown } | undefined)?.content ?? ""
    );

    expect(text).toContain(
      "등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다."
    );
    expect(text).toContain(
      "- Mia: 20대 후반의 바리스타. 바쁘지만 손님이 곤란하면 방법을 같이 찾는다."
    );
    // 인물 설명, 그 화의 무대, 지난 이야기 순으로 선다.
    expect(text.indexOf("등장인물은")).toBeLessThan(
      text.indexOf("사용자는 잘못 나온 커피를 바꿔야 한다.")
    );
  });

  // 두 인물이 서는 화는 그 화의 목록 차례로 이름을 부른다. 우리말 조사는 앞
  // 이름의 마지막 글자를 따른다.
  test("calls two characters in the order the episode lists them", async () => {
    const model = createMockModel(["Owen: Sorry."]);
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { ending_kind: "성공", ending_outcome: "1화 결과.", episode: 1 },
          { ending_kind: "성공", ending_outcome: "2화 결과.", episode: 2 },
        ])
      ),
      model,
    });

    await (
      await app.request(
        createEpisodeRequest({
          episodeId: episodeId(3),
          messages: [createUserMessage("That is my seat.")],
        })
      )
    ).text();

    const system = model.doStreamCalls[0]?.prompt.find(
      (message) => message.role === "system"
    );
    const text = String(
      (system as { content?: unknown } | undefined)?.content ?? ""
    );

    expect(text).toContain("등장인물은 Mia와 Owen 두 명뿐이다.");
    expect(text).toContain("- Mia: 20대 후반의 바리스타.");
    expect(text).toContain("- Owen: 30대 초반의 회사원.");
  });

  // 콘텐츠는 스키마와 API보다 늦게 운영에 올라간다. 그 사이 인물 행이 없어도
  // 화자 판정이 무너지지 않도록 이전 화자 목록으로 선다. 설명만 빠진다.
  test("falls back to the old speaker list until the characters land", async () => {
    const model = createMockModel(["Mia: Sorry about that."]);
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(), {
        withoutCharacters: true,
      }),
      model,
    });

    const response = await app.request(createEpisodeRequest({ messages: [] }));
    const body = await response.text();

    // 첫 장면은 모델을 부르지 않으므로 화자 판정만 확인한다. 이름표는 서고
    // 줄 머리의 `Mia:`는 화면에 흐르지 않는다.
    expect(body).toContain('"name":"Mia"');
    expect(body).not.toContain("Mia:");
  });

  // 무대는 어느 결말에서 왔든 같다. 기억이 바꾸는 것은 전개뿐이다.
  test("opens the same authored scene no matter how the last episode ended", async () => {
    const openings = await Promise.all(
      ["성공", "실패"].map(async (kind) => {
        const app = createApp({
          authMiddleware: signedInWith(
            createSeasonState([
              {
                ending_kind: kind,
                ending_outcome: `${kind}의 결과.`,
                episode: 1,
                memory_choice: `${kind}으로 끝냈다.`,
                memory_question: "다음은.",
                memory_relationship: "달라졌다.",
              },
            ])
          ),
          model: createMockModel(["Mia: Morning."]),
        });
        const response = await app.request(
          createEpisodeRequest({ messages: [] })
        );

        const body = await response.text();

        // 응답마다 새로 붙는 메시지 아이디는 장면이 아니다.
        return body
          .split("\n")
          .filter((line) => !line.includes('"type":"start"'))
          .join("\n");
      })
    );

    expect(openings[0]).toContain("it says declined");
    expect(openings[0]).toBe(openings[1]);
  });

  // 줄 머리만 쓰고 내용을 다음 줄로 넘긴 기록은 데이터베이스가 거절한다. 그
  // 실패가 결말 기록 전체를 무너뜨리면 사건이 끝났는데도 화면이 닫히지 않는다.
  test("drops a note line that came in empty instead of failing the ending", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "성공: 받아냈다.\n",
        "선택: 분명하게 요구했다.\n",
        "수준:\n",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(state.recorded[0]).toMatchObject({
      language_level: undefined,
      memory_choice: "분명하게 요구했다.",
    });
  });

  // 관찰을 길게 쓰면 열의 길이 제약에 걸린다. 기억이 조금 잘리는 편이 사건이
  // 끝나지 않는 것보다 낫다.
  test("shortens a note line that is too long for the column", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "성공: 받아냈다.\n",
        `선택: ${"가".repeat(400)}`,
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );

    await response.text();

    expect(state.recorded[0]?.memory_choice).toHaveLength(300);
  });

  // 기록 줄이 오지 않아도 그 화는 끝난다. 기억만 비고 다음 화는 열린다.
  test("finishes an episode whose closing scene left no memory", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(state.recorded[0]).toMatchObject({
      episode_id: episodeId(1),
      memory_choice: undefined,
    });
  });

  // 결말이 보인 즉시 표현 돌아보기를 열어도 다음 화 예고가 준비되어 있어야 한다.
  test("종료 표시 전에 다음 화 예고를 보내 즉시 표현 돌아보기를 열 수 있다", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-next-up"');
    expect(body.indexOf('"type":"data-next-up"')).toBeLessThan(
      body.indexOf('"type":"data-ending"')
    );
    expect(body).toContain("계산이 꼬인 아침");
    expect(body).toContain('"number":2');
    expect(body).toContain(`"episodeId":"${episodeId(2)}"`);
  });

  test("sends the story completion instead of a preview after the last episode", async () => {
    const state = createSeasonState(finishedSeason().slice(0, 4));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 제대로 인사를 건넸다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Take care.")] })
    );
    const body = await response.text();

    expect(body).toContain("첫 이야기를 끝냈어요");
    expect(body).toContain('"episodeId":null');
  });

  // 결말을 남기지 못했는데 화면이 끝난 척하면, 사용자는 다음 화를 눌렀다가
  // 같은 화를 다시 만난다. 그럴 바에는 오류를 보고 다시 시도하는 편이 낫다.
  test("leaves the episode open when the ending cannot be recorded", async () => {
    const state = createSeasonState();

    state.recordError = "connection refused";

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here you go.\n",
        "성공: 원하던 커피를 새로 받아냈다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain("Here you go.");
    expect(body).not.toContain('"type":"data-ending"');
    expect(body).toContain('"type":"error"');
  });

  test("does not stream a losing ending from another device", async () => {
    const state = createSeasonState();

    state.recordAccepted = false;

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here you go.\n",
        "실패: 다른 기기보다 늦게 끝났다.",
      ]),
    });
    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain("Here you go.");
    expect(body).not.toContain('"type":"data-ending"');
    expect(body).toContain('"type":"error"');
    // 장면은 결말보다 먼저 남는다. 진 쪽이 남기는 것은 그 장면까지이고, 이미
    // 확정된 결말은 이 요청이 건드리지 못한다.
    expect(state.recorded).toHaveLength(1);
  });
});

/** 카페 1화에서 실제로 나올 법한 교정 하나. */
const WRONG_COFFEE: CorrectionAnswer = {
  entries: [
    {
      fixed: "the wrong coffee",
      original: "wrong coffee",
      pattern: "article-the-specific",
      why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
    },
  ],
  fixed: "I think this is the wrong coffee.",
};

test("표현만 다시 확인하면 문제없음을 명시하고 대화는 바꾸지 않는다", async () => {
  const state = createSeasonState();
  state.messages.push({
    created_at: "2026-09-07T00:00:00.000Z",
    id: "natural-message",
    parts: [{ text: "I want to go home.", type: "text" }],
    play_id: playIdOf(episodeId(1)),
    role: "user",
  });
  const model = createMockModel([], {
    entries: [],
    fixed: "I want to go home.",
    status: "natural",
  });
  const app = createApp({ authMiddleware: signedInWith(state), model });
  const before = structuredClone(state.messages);
  const response = await app.request(
    new Request(`http://localhost${EPISODE_PATH}/correction`, {
      body: JSON.stringify({
        episodeId: episodeId(1),
        messageId: "natural-message",
        storyPlayId: STORY_PLAY_ID,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    })
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    messageId: "natural-message",
    status: "natural",
  });
  expect(state.messages).toEqual(before);
  expect(model.doStreamCalls).toHaveLength(0);
  expect(state.recorded).toHaveLength(0);
});

test("장면 응답은 교정을 기다리지 않고 저장된 사용자 메시지의 확인 시작을 알린다", async () => {
  const state = createSeasonState();
  const model = createMockModel(["Mia: Sure."]);
  const app = createApp({ authMiddleware: signedInWith(state), model });
  const response = await app.request(
    createEpisodeRequest({ messages: [createUserMessage("I wants coffee.")] })
  );
  const body = await response.text();
  expect(body).toContain('"type":"data-expression-ready"');
  expect(body).toContain('"messageId":"m1"');
  expect(body).toContain('"type":"finish"');
  expect(model.doGenerateCalls).toHaveLength(0);
  expect(state.messages.map((row) => row.role)).toEqual(["user", "assistant"]);
});

describe("메시지별 표현 확인 API", () => {
  test("최종 모델 평가의 출력 63건을 서버 검사로 다시 확인한다", async () => {
    expect(finalCorrectionEvaluation.records).toHaveLength(63);
    await Promise.all(
      finalCorrectionEvaluation.records.map(async (record) => {
        const state = createSeasonState();
        state.messages.push(stored(record.sample.original));
        const app = createApp({
          authMiddleware: signedInWith(state),
          model: createMockModel([], record.output as CorrectionAnswer),
        });
        expect((await app.request(request())).status).toBe(200);
        expect(state.expressionResults).toHaveLength(1);
      })
    );
  });
  test.each([
    ["She go and I go", "She goes and I go", "go", "goes"],
    ["She goed and he goed", "She went and he went", "goed", "went"],
    ["He has a apple", "He has an apple", "a apple", "an apple"],
    ["Goed home", "Went home", "Goed", "Went"],
    [
      "She dont\u00a0wants it",
      "She doesnt\u00a0want it",
      "dont\u00a0wants",
      "doesnt\u00a0want",
    ],
    ["I\u00a0goed home", "I\u00a0went home", "I\u00a0goed", "I\u00a0went"],
    ["Your welcome", "You're welcome", "Your", "You're"],
    ["Their coming", "They're coming", "Their", "They're"],
    ["Whose coming", "Who's coming", "Whose", "Who's"],
    [
      "I went to United States",
      "I went to the United States",
      "United States",
      "the United States",
    ],
    ["This is MORE GOOD", "This is BETTER", "MORE GOOD", "BETTER"],
    ["Me am happy", "I am happy", "Me", "I"],
    ["He and me went", "He and I went", "me", "I"],
    ["See you TOMMOROW", "See you TOMORROW", "TOMMOROW", "TOMORROW"],
    ["iPhnoe works", "iPhone works", "iPhnoe", "iPhone"],
    ["This is more good", "This is better", "more good", "better"],
    ["I saw a birds", "I saw birds", "a birds", "birds"],
    ["I goed  home", "I went  home", "goed", "went"],
    ["Its raining", "It's raining", "Its", "It's"],
    ["Well go home", "We'll go home", "Well", "We'll"],
    ["Lets go home", "Let's go home", "Lets", "Let's"],
    ["She dont wants it", "She doesnt want it", "dont wants", "doesnt want"],
    ["She don't want it", "She doesn't want it", "don't", "doesn't"],
    [
      "I goed home, then left",
      "I went home, then left",
      "goed home, then",
      "went home, then",
    ],
  ])(
    "표현 조각이 겹치거나 반복돼도 해당 자리만 고친 결과를 저장한다: %s",
    async (original, fixed, before, after) => {
      const state = createSeasonState();
      state.messages.push(stored(original));
      const app = createApp({
        authMiddleware: signedInWith(state),
        model: createMockModel([], {
          entries: [
            {
              fixed: after,
              original: before,
              pattern: "expression",
              why: "이 표현을 써요.",
            },
          ],
          fixed,
          status: "corrected",
        }),
      });
      expect((await app.request(request())).status).toBe(200);
      expect(state.expressionResults).toHaveLength(1);
    }
  );
  test.each([
    { fixed: "went", original: "goed" },
    { fixed: "went home.", original: "goed home" },
  ])(
    "마침표를 추가한 결과는 항목 안팎 모두 저장하지 않는다: %j",
    async (entry) => {
      const state = createSeasonState();
      state.messages.push(stored("I goed home"));
      const app = createApp({
        authMiddleware: signedInWith(state),
        model: createMockModel([], {
          ...WRONG_COFFEE,
          entries: [
            {
              fixed: entry.fixed,
              original: entry.original,
              pattern: "past-go",
              why: "go의 과거형은 went예요.",
            },
          ],
          fixed: "I went home.",
          status: "corrected",
        }),
      });
      expect((await app.request(request())).status).toBe(500);
      expect(state.expressionResults).toHaveLength(0);
    }
  );
  test.each([
    ["She dont wants it", "She doesn't want it", "dont wants", "doesn't want"],
    ["Thanks sarah", "Thanks Sarah", "sarah", "Sarah"],
    ["Yes  I agree", "Yes I agree", "Yes  I", "Yes I"],
    ["I goed home", "I Went home", "goed", "Went"],
    ["I\u00a0goed home", "I went home", "I\u00a0goed", "I went"],
    [
      "I\u00a0goed home",
      "I went\u00a0home",
      "I\u00a0goed home",
      "I went\u00a0home",
    ],
    ["I\u202fgoed home", "I went home", "I\u202fgoed", "I went"],
    ["I\u3000goed home", "I went home", "I\u3000goed", "I went"],
    ["I\u0085goed home", "I went home", "I\u0085goed", "I went"],
    ["I goed home 😊", "I went home", "goed home 😊", "went home"],
    ["I 😊 goed home", "I 😢 went home", "😊 goed", "😢 went"],
    ["I work 👩‍💻", "I work 👩💻", "👩‍💻", "👩💻"],
    ["I work ☕️", "I work ☕", "☕️", "☕"],
    ["I work 1️⃣", "I work 1", "1️⃣", "1"],
    [
      "I goed to Alexs house",
      "I went to Alex's house",
      "goed to Alexs",
      "went to Alex's",
    ],
    ["I goed (home)", "I went home", "goed (home)", "went home"],
    ["See you TOMMOROW", "See you Tomorrow", "TOMMOROW", "Tomorrow"],
    ["iPhnoe works", "Iphone works", "iPhnoe", "Iphone"],
    [
      "I goed with Wendy",
      "I Went with wendy",
      "goed with Wendy",
      "Went with wendy",
    ],
    ["I goed home", "I wenthome", "goed home", "wenthome"],
    [
      "I goed home, then left",
      "I went, home then left",
      "goed home, then",
      "went, home then",
    ],
  ])(
    "표현 항목에 섞인 표기와 채팅 말투 변경은 저장하지 않는다: %s",
    async (original, fixed, before, after) => {
      const state = createSeasonState();
      state.messages.push(stored(original));
      const app = createApp({
        authMiddleware: signedInWith(state),
        model: createMockModel([], {
          entries: [
            {
              fixed: after,
              original: before,
              pattern: "expression",
              why: "이 표현을 써요.",
            },
          ],
          fixed,
          status: "corrected",
        }),
      });
      expect((await app.request(request())).status).toBe(500);
      expect(state.expressionResults).toHaveLength(0);
    }
  );
  test("완성 문장에 실제로 쓰이지 않은 교정 항목은 저장하지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("I goed home and left"));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], {
        entries: [
          {
            fixed: "went",
            original: "goed",
            pattern: "past-go",
            why: "go의 과거형은 went예요.",
          },
          {
            fixed: "left",
            original: "home",
            pattern: "unrelated",
            why: "이 표현을 써요.",
          },
        ],
        fixed: "I went home and left",
        status: "corrected",
      }),
    });
    expect((await app.request(request())).status).toBe(500);
    expect(state.expressionResults).toHaveLength(0);
  });
  function stored(text: string, id = "m1"): MessageRow {
    return {
      created_at: `2026-09-07T00:00:0${id === "m1" ? "1" : "2"}.000Z`,
      id,
      parts: [{ text, type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    };
  }
  function request(messageId = "m1", identifier = episodeId(1)) {
    return new Request(`http://localhost${EPISODE_PATH}/correction`, {
      body: JSON.stringify({
        episodeId: identifier,
        messageId,
        storyPlayId: STORY_PLAY_ID,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  }
  test("돌아보기의 상황과 뜻, 다른 예문을 같은 표현 확인 응답에 담는다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("I think this is wrong coffee."));
    const review = {
      example: "I think this is the wrong bag.",
      exampleMeaning: "이건 다른 가방인 것 같아요.",
      meaning: "이건 다른 커피인 것 같아요.",
      situation: "주문과 다른 것이 나왔을 때",
    };
    const answer = { ...WRONG_COFFEE, review, status: "corrected" as const };
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], answer),
    });
    const response = await app.request(request());
    expect(response.status).toBe(200);
    const result = (await response.json()) as { correction: unknown };
    expect(result).toMatchObject({
      correction: { review },
      status: "corrected",
    });
    const session = (await (
      await app.request(`http://localhost${episodeSessionPath(1)}`)
    ).json()) as { expressionResults: unknown[]; corrections: unknown[] };
    expect(session.expressionResults).toEqual([result]);
    expect(session.corrections).toEqual([result.correction]);
  });
  test("같은 실수는 메시지마다 교정하고 다시 읽으면 저장된 결과를 반환한다", async () => {
    const state = createSeasonState();
    state.messages.push(
      stored("I think this is wrong coffee."),
      stored("I think this is wrong coffee.", "m2")
    );
    const model = createMockModel([], { ...WRONG_COFFEE, status: "corrected" });
    const app = createApp({ authMiddleware: signedInWith(state), model });
    for (const id of ["m1", "m2", "m1"]) {
      // biome-ignore lint/performance/noAwaitInLoops: 저장 후 같은 메시지를 다시 읽는 순서를 검증한다.
      const response = await app.request(request(id));
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        correction: { entries: WRONG_COFFEE.entries, messageId: id },
        messageId: id,
        status: "corrected",
      });
    }
    expect(state.expressionResults.map((row) => row.message_id)).toEqual([
      "m1",
      "m2",
    ]);
    expect(model.doGenerateCalls).toHaveLength(2);
    expect(model.doStreamCalls).toHaveLength(0);
    expect(JSON.stringify(state.messages)).not.toContain(
      "article-the-specific"
    );
  });
  test.each(["natural", "unclear"] as const)(
    "%s 판정은 다시 열고 재요청해도 저장된 결과를 사용한다",
    async (status) => {
      const state = createSeasonState();
      const original = status === "natural" ? "Thank you." : "asdjkl";
      state.messages.push(stored(original));
      const model = createMockModel([], {
        entries: [],
        fixed: status === "natural" ? original : "",
        status,
      });
      const app = createApp({ authMiddleware: signedInWith(state), model });
      expect(await (await app.request(request())).json()).toEqual({
        messageId: "m1",
        status,
      });
      expect(
        await (await app.request(episodeSessionPath(1))).json()
      ).toMatchObject({
        corrections: [],
        expressionResults: [{ messageId: "m1", status }],
      });
      expect(await (await app.request(request())).json()).toEqual({
        messageId: "m1",
        status,
      });
      expect(model.doGenerateCalls).toHaveLength(1);
    }
  );
  test("겹친 요청은 먼저 저장된 판정과 원문을 그대로 반환한다", async () => {
    const state = createSeasonState();
    const original = "I think this is wrong coffee.";
    state.messages.push(stored(original));
    const started = Promise.withResolvers<void>();
    const finish = Promise.withResolvers<void>();
    const slow = createMockModel([], {
      entries: [],
      fixed: original,
      status: "natural",
    });
    const generate = slow.doGenerate;
    slow.doGenerate = async (options) => {
      started.resolve();
      await finish.promise;
      return generate(options);
    };
    const first = createApp({
      authMiddleware: signedInWith(state),
      model: slow,
    }).request(request());
    await started.promise;
    const secondApp = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], { ...WRONG_COFFEE, status: "corrected" }),
    });
    const winner = await (await secondApp.request(request())).json();
    finish.resolve();
    expect(await (await first).json()).toEqual(winner);
    expect(state.expressionResults).toHaveLength(1);
    expect(state.messages).toHaveLength(1);
  });
  test("한 문장에서 같은 규칙의 다른 자리도 빠짐없이 남긴다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("I want coffee and she wants tea."));
    const entries = [
      {
        fixed: "some coffee",
        original: "coffee",
        pattern: "quantity",
        why: "양을 나타낼 때 some을 써요.",
      },
      {
        fixed: "some tea",
        original: "tea",
        pattern: "quantity",
        why: "양을 나타낼 때 some을 써요.",
      },
    ];
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], {
        entries,
        fixed: "I want some coffee and she wants some tea.",
        status: "corrected",
      }),
    });
    expect(await (await app.request(request())).json()).toMatchObject({
      correction: { entries },
    });
    expect(state.expressionResults).toHaveLength(1);
    expect(state.expressionResults[0]?.entries).toEqual(entries);
  });
  test("한국어의 뜻과 핵심 표현 설명을 저장하고 다시 열어도 유지한다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("오늘은 일찍 집에 가고 싶어."));
    const answer = {
      entries: [
        {
          fixed: "head home",
          original: "집에 가고",
          pattern: "head-home",
          why: "‘집에 가다’는 head home이라고 해요.",
        },
      ],
      fixed: "I'd like to head home early today.",
      status: "corrected" as const,
    };
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], answer),
    });
    const response = await app.request(request());
    expect(response.status).toBe(200);
    const result = (await response.json()) as { correction: unknown };
    expect(result).toMatchObject({
      correction: { entries: answer.entries, fixed: answer.fixed },
      status: "corrected",
    });
    const restored = (await (
      await app.request(`http://localhost${episodeSessionPath(1)}`)
    ).json()) as { corrections: unknown[] };
    expect(restored.corrections).toEqual([result.correction]);
  });
  test.each([
    { entries: [], fixed: "" },
    { entries: [], fixed: "I want coffee.", status: "corrected" },
    {
      entries: WRONG_COFFEE.entries,
      fixed: "I wants coffee.",
      status: "natural",
    },
    {
      entries: [{ ...WRONG_COFFEE.entries[0], original: "absent" }],
      fixed: WRONG_COFFEE.fixed,
      status: "corrected",
    },
  ])(
    "빈 결과나 모순된 출력은 문제없음이 아닌 실패로 반환한다: %j",
    async (answer) => {
      const state = createSeasonState();
      state.messages.push(stored("I wants coffee."));
      const app = createApp({
        authMiddleware: signedInWith(state),
        model: createMockModel([], answer as CorrectionAnswer),
      });
      const response = await app.request(request());
      expect(response.status).toBe(500);
      expect(await response.json()).not.toHaveProperty("status", "natural");
      expect(state.expressionResults).toHaveLength(0);
    }
  );
  test("한국어를 문제없는 영어로 판정한 결과는 거절한다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("집에 가고 싶어."));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], {
        entries: [],
        fixed: "집에 가고 싶어.",
        status: "natural",
      }),
    });
    expect((await app.request(request())).status).toBe(500);
  });
  test("뜻을 알 수 없는 입력은 문제없음과 다른 결과를 반환한다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("asdjklqwe"));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], { entries: [], fixed: "", status: "unclear" }),
    });
    expect(await (await app.request(request())).json()).toEqual({
      messageId: "m1",
      status: "unclear",
    });
  });
  test("실패 뒤 같은 메시지를 재시도해도 대화와 결말은 바뀌지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("I think this is wrong coffee."));
    const model = createMockModel([], { ...WRONG_COFFEE, status: "corrected" });
    const generate = model.doGenerate;
    model.doGenerate = () => Promise.reject(new Error("gateway down"));
    const app = createApp({ authMiddleware: signedInWith(state), model });
    expect((await app.request(request())).status).toBe(500);
    model.doGenerate = generate;
    expect((await app.request(request())).status).toBe(200);
    expect(state.messages).toHaveLength(1);
    expect(state.recorded).toHaveLength(0);
    expect(model.doStreamCalls).toHaveLength(0);
  });
  test("저장에 실패한 결과는 완료로 응답하지 않고 재시도할 수 있다", async () => {
    const state = createSeasonState();
    state.messages.push(stored("I think this is wrong coffee."));
    state.correctionSaveError = "connection refused";
    const model = createMockModel([], { ...WRONG_COFFEE, status: "corrected" });
    const app = createApp({ authMiddleware: signedInWith(state), model });
    expect((await app.request(request())).status).toBe(500);
    expect(state.expressionResults).toHaveLength(0);
    expect(state.messages).toHaveLength(1);
    expect(model.doStreamCalls).toHaveLength(0);
    state.correctionSaveError = undefined;
    expect((await app.request(request())).status).toBe(200);
    expect(state.expressionResults).toHaveLength(1);
  });
  test("없거나 다른 에피소드에 속한 메시지와 캐릭터 대사는 판정하지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push({ ...stored("Hello."), role: "assistant" });
    const model = createMockModel([]);
    const app = createApp({ authMiddleware: signedInWith(state), model });
    expect((await app.request(request())).status).toBe(404);
    expect((await app.request(request("missing"))).status).toBe(404);
    expect((await app.request(request("m1", episodeId(2)))).status).toBe(404);
    expect(model.doGenerateCalls).toHaveLength(0);
  });
});

describe("표현을 담아 두는 API", () => {
  /** 지문 하나와 인물 대사 둘이 든 장면. 자리 번호가 대사만 센다. */
  function scene(id = "s1"): MessageRow {
    return {
      created_at: "2026-09-07T00:00:01.000Z",
      id,
      parts: [
        { data: { name: null }, id: "p0", type: "data-speaker" },
        {
          text: "카운터에 놓인 컵에는 'Iced Latte'가 적혀 있다.",
          type: "text",
        },
        { data: { name: "Mia" }, id: "p1", type: "data-speaker" },
        { text: "Next in line, please!", type: "text" },
        { data: { name: "Mia" }, id: "p2", type: "data-speaker" },
        { text: "Was there something wrong?", type: "text" },
      ],
      play_id: playIdOf(episodeId(1)),
      role: "assistant",
    };
  }
  function wrote(text: string, id = "m1"): MessageRow {
    return {
      created_at: "2026-09-07T00:00:02.000Z",
      id,
      parts: [{ text, type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    };
  }
  function request(body: Record<string, unknown>) {
    return new Request(`http://localhost${EPISODE_PATH}/saved-expressions`, {
      body: JSON.stringify({
        episodeId: episodeId(1),
        storyPlayId: STORY_PLAY_ID,
        ...body,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  }
  function utterance(at: number, messageId = "s1") {
    return request({ kind: "utterance", messageId, utteranceAt: at });
  }
  function learning(messageId = "m1") {
    return request({ kind: "learning", messageId });
  }

  test("인물 대사는 앱이 보낸 글이 아니라 저장된 장면에서 만든다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([], NO_CORRECTION, "다음 분이요!"),
    });

    const response = await app.request(utterance(0));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      kind: "utterance",
      messageId: "s1",
      utteranceAt: 0,
    });
    expect(state.saved).toMatchObject([
      {
        english: "Next in line, please!",
        entries: null,
        episode_id: episodeId(1),
        kind: "utterance",
        meaning: "다음 분이요!",
        original: null,
        speaker: "Mia",
        utterance_at: 0,
      },
    ]);
  });

  test("한 장면의 다른 대사는 각각 따로 담긴다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    expect((await app.request(utterance(0))).status).toBe(200);
    expect((await app.request(utterance(1))).status).toBe(200);

    expect(state.saved.map((row) => row.english)).toEqual([
      "Next in line, please!",
      "Was there something wrong?",
    ]);
  });

  test("같은 대사를 두 번 담아도 항목은 하나다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    const first = (await (await app.request(utterance(0))).json()) as {
      id: string;
    };
    const again = await app.request(utterance(0));

    expect(again.status).toBe(200);
    expect(await again.json()).toMatchObject({ id: first.id });
    expect(state.saved).toHaveLength(1);
  });

  // 유니크 색인의 열쇠에 종류가 없다. 한 메시지가 교정과 안내를 둘 다 낳지
  // 못한다는 규칙이고, 그러니 종류가 다른 요청도 이미 있는 항목으로 끝나야 한다.
  test("같은 메시지는 종류가 달라도 항목을 하나만 갖는다", async () => {
    const state = createSeasonState();
    state.messages.push(wrote("괜찮아요, 그런데 좀 급해서요."));
    state.expressionResults.push({
      entries: [
        {
          fixed: "No worries",
          original: "괜찮아요",
          pattern: "expression-no-worries",
          why: "'괜찮아요'는 No worries라고 해요.",
        },
      ],
      example: "No worries, take your time.",
      example_meaning: "괜찮아요, 천천히 하세요.",
      fixed: "No worries, but I'm in a bit of a hurry.",
      meaning: "괜찮아요, 그런데 좀 급해서요.",
      message_id: "m1",
      situation: "급한 사정을 말할 때",
      status: "corrected",
    });
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    const first = (await (await app.request(learning())).json()) as {
      id: string;
      kind: string;
    };

    expect(first.kind).toBe("guidance");

    // 같은 메시지의 원문이 영어로 바뀐 것처럼 굴어 다른 종류를 요청한다.
    state.messages[0] = wrote("I am in a hurry.");
    const again = await app.request(learning());

    expect(again.status).toBe(200);
    expect(await again.json()).toMatchObject({ id: first.id });
    expect(state.saved).toHaveLength(1);
  });

  test("지문과 없는 자리는 담을 것이 없다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const model = createMockModel([]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    // 대사가 둘뿐이므로 2는 지문이 차지한 자리가 아니라 아예 없는 자리다.
    expect((await app.request(utterance(2))).status).toBe(404);
    expect((await app.request(utterance(0, "missing"))).status).toBe(404);
    expect(state.saved).toEqual([]);
    expect(model.doGenerateCalls).toHaveLength(0);
  });

  test("내 말풍선은 인물 대사로 담을 수 없다", async () => {
    const state = createSeasonState();
    state.messages.push(wrote("I want coffee."));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    expect((await app.request(utterance(0, "m1"))).status).toBe(404);
    expect(state.saved).toEqual([]);
  });

  test("배울 표현은 이미 저장된 교정을 그대로 옮기고 모델을 부르지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push(wrote("I think you gave me wrong coffee."));
    state.expressionResults.push({
      entries: WRONG_COFFEE.entries,
      example: "I ordered a tea.",
      example_meaning: "차를 주문했어요.",
      fixed: WRONG_COFFEE.fixed,
      meaning: "주문한 커피가 아니에요.",
      message_id: "m1",
      situation: "주문한 것을 다시 말할 때",
      status: "corrected",
    });
    const model = createMockModel([]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    const response = await app.request(learning());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      kind: "correction",
      messageId: "m1",
      utteranceAt: null,
    });
    expect(state.saved).toMatchObject([
      {
        english: WRONG_COFFEE.fixed,
        entries: [
          {
            fixed: "the wrong coffee",
            original: "wrong coffee",
            why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
          },
        ],
        kind: "correction",
        // 표현 돌아보기가 이미 만들어 둔 뜻을 그대로 옮겨 담는다.
        meaning: "주문한 커피가 아니에요.",
        original: "I think you gave me wrong coffee.",
        speaker: null,
        utterance_at: null,
      },
    ]);
    expect(model.doGenerateCalls).toHaveLength(0);
  });

  test("한국어로 쓴 메시지의 안내는 다른 종류로 담긴다", async () => {
    const state = createSeasonState();
    state.messages.push(wrote("괜찮아요, 그런데 좀 급해서요."));
    state.expressionResults.push({
      entries: [
        {
          fixed: "No worries",
          original: "괜찮아요",
          pattern: "no-worries",
          why: "‘괜찮아요’는 No worries라고 해요.",
        },
      ],
      example: "No worries, take your time.",
      example_meaning: "괜찮아요, 천천히 하세요.",
      fixed: "No worries, but I'm in a bit of a hurry.",
      meaning: "괜찮아요, 그런데 좀 급해서요.",
      message_id: "m1",
      situation: "급한 사정을 말할 때",
      status: "corrected",
    });
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    expect(await (await app.request(learning())).json()).toMatchObject({
      kind: "guidance",
    });
  });

  test("교정이 붙지 않은 메시지에는 담을 배울 표현이 없다", async () => {
    const state = createSeasonState();
    state.messages.push(wrote("I want coffee."));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    expect((await app.request(learning())).status).toBe(404);
    expect(state.saved).toEqual([]);
  });

  test("다시 연 대화가 담아 둔 자리를 함께 돌려준다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });
    const saved = (await (await app.request(utterance(1))).json()) as {
      id: string;
    };

    const session = (await (
      await app.request(`http://localhost${episodeSessionPath(1)}`)
    ).json()) as { saved: unknown[] };

    expect(session.saved).toEqual([
      {
        id: saved.id,
        kind: "utterance",
        messageId: "s1",
        utteranceAt: 1,
      },
    ]);
  });

  test("취소하면 목록에서 사라진다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });
    const saved = (await (await app.request(utterance(0))).json()) as {
      id: string;
    };

    const response = await app.request(
      new Request(
        `http://localhost${EPISODE_PATH}/saved-expressions/${saved.id}`,
        { method: "DELETE" }
      )
    );

    expect(response.status).toBe(204);
    expect(state.saved).toEqual([]);
  });

  test("모양이 어긋난 id로 취소하면 받지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    const response = await app.request(
      new Request(
        `http://localhost${EPISODE_PATH}/saved-expressions/not-a-uuid`,
        {
          method: "DELETE",
        }
      )
    );

    expect(response.status).toBe(400);
  });

  test("한국어 뜻을 만들지 못하면 담지 않는다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: new MockLanguageModelV4({
        doGenerate: () => Promise.reject(new Error("gateway down")),
      }),
    });

    expect((await app.request(utterance(0))).status).toBe(500);
    expect(state.saved).toEqual([]);
  });

  test.each([
    { kind: "utterance", messageId: "s1" },
    { kind: "utterance", messageId: "s1", utteranceAt: -1 },
    { kind: "utterance", messageId: "s1", utteranceAt: "0" },
    { kind: "note", messageId: "s1" },
    { kind: "learning" },
  ])("모양이 어긋난 요청은 받지 않는다: %j", async (body) => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    expect((await app.request(request(body))).status).toBe(400);
  });

  function note() {
    return new Request(`http://localhost${EPISODE_PATH}/saved-expressions`);
  }

  test("표현 노트는 담은 것을 최근순으로, 종류마다 필요한 값과 함께 돌려준다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    state.messages.push(wrote("I think you gave me wrong coffee."));
    state.expressionResults.push({
      entries: WRONG_COFFEE.entries,
      example: "I ordered a tea.",
      example_meaning: "차를 주문했어요.",
      fixed: WRONG_COFFEE.fixed,
      meaning: "주문한 커피가 아니에요.",
      message_id: "m1",
      situation: "주문한 것을 다시 말할 때",
      status: "corrected",
    });
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    await app.request(utterance(0));
    await app.request(learning());

    const cards = await (await app.request(note())).json();

    expect(cards).toEqual([
      {
        english: WRONG_COFFEE.fixed,
        entries: [
          {
            fixed: "the wrong coffee",
            original: "wrong coffee",
            why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
          },
        ],
        episodeNumber: 1,
        id: expect.any(String),
        kind: "correction",
        meaning: "주문한 커피가 아니에요.",
        original: "I think you gave me wrong coffee.",
        speaker: null,
        storyTitle: STORY_ROW.title,
      },
      {
        english: "Next in line, please!",
        entries: null,
        episodeNumber: 1,
        id: expect.any(String),
        kind: "utterance",
        meaning: expect.any(String),
        original: null,
        speaker: "Mia",
        storyTitle: STORY_ROW.title,
      },
    ]);
  });

  test("원본을 잃은 항목도 표현 노트에는 남는다", async () => {
    const state = createSeasonState();
    state.messages.push(scene());
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([]),
    });

    await app.request(utterance(0));
    // 다시 받기가 그 메시지를 지우면 담긴 행은 참조만 잃는다.
    state.messages.length = 0;
    for (const row of state.saved) {
      row.message_id = null;
    }

    const cards = (await (await app.request(note())).json()) as {
      english: string;
    }[];

    expect(cards).toHaveLength(1);
    expect(cards[0]?.english).toBe("Next in line, please!");
  });
});

describe("POST /ai/episode/ask", () => {
  function createAskRequest(body: unknown, token?: string): Request {
    return new Request(`http://localhost${EPISODE_PATH}/ask`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      method: "POST",
    });
  }

  const ASKED = {
    entries: WRONG_COFFEE.entries,
    fixed: WRONG_COFFEE.fixed,
    original: "I think this is wrong coffee.",
  };

  function createConversationRequest(
    body: Record<string, unknown>,
    token?: string
  ): Request {
    return createAskRequest({ correction: ASKED, ...body }, token);
  }

  test("rejects a request with no access token before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createConversationRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("rejects an access token it cannot verify before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createConversationRequest(
        { messages: [createUserMessage("안녕")] },
        "not-a-real-token"
      )
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("rejects a deleted user before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: deletedUserAuth, model });

    const response = await app.request(
      createConversationRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("returns a UI message stream for an authenticated request", async () => {
    const model = createMockModel(["안녕", "하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createConversationRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");

    const body = await response.text();

    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain("안녕");
    expect(body).toContain("하세요");
    expect(model.doStreamCalls).toHaveLength(1);
  });

  test("restores speaker parts as screenplay lines for the model", async () => {
    const model = createMockModel(["Mia: Welcome back."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createConversationRequest({
        messages: [
          createUserMessage("안녕하세요"),
          {
            id: "m2",
            parts: [
              {
                data: { name: "Mia" },
                id: "speaker-1",
                type: "data-speaker",
              },
              { text: "어서 와, 처음 보는 얼굴이네.", type: "text" },
            ],
            role: "assistant",
          },
          {
            id: "m3",
            parts: [{ text: "네, 처음이에요", type: "text" }],
            role: "user",
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    await response.text();

    // Without this, the model would see last scene's words with no idea who
    // said them.
    const prompt = JSON.stringify(model.doStreamCalls[0]?.prompt);

    expect(prompt).toContain("Mia:");
    expect(prompt).toContain("어서 와, 처음 보는 얼굴이네.");
  });

  test("rejects a malformed body before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createConversationRequest({ messages: [{ role: "user" }] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("keeps the conversation out of the log when the provider fails", async () => {
    const secret = "내-주민등록번호-900101-1234567";
    // The shape the AI SDK actually produces: the error carries the request it
    // sent, so anything that prints the object prints the conversation.
    const model = new MockLanguageModelV4({
      doStream: () =>
        Promise.reject(
          new APICallError({
            message: "Unauthorized",
            requestBodyValues: {
              messages: [{ content: secret, role: "user" }],
            },
            responseBody: '{"error":"bad key"}',
            statusCode: 401,
            url: "https://ai-gateway.example/v1/chat",
          })
        ),
    });
    const app = createApp({ authMiddleware: bypassAuth, model });
    const written: string[] = [];
    const realError = console.error;

    // `inspect`, not `String`: that is what a console does with an object, and
    // it is the step that would expose the error's own properties.
    console.error = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };

    try {
      const response = await app.request(
        createConversationRequest({ messages: [createUserMessage(secret)] })
      );

      await response.text();
    } finally {
      console.error = realError;
    }

    expect(written.join("\n")).not.toContain(secret);
    expect(written.join("\n")).toContain("Request failed on");
  });

  test("rejects a body that is not an AI SDK message list", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createConversationRequest({ prompt: "안녕" })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("passes the request abort through to the model call", async () => {
    const model = neverEndingModel();
    const app = createApp({ authMiddleware: bypassAuth, model });

    await abortMidStream(
      app,
      createConversationRequest({ messages: [createUserMessage("안녕")] })
    );

    // `streamText` may hand the model a derived signal, so the check is that
    // the signal it received fired, not that it is the request's own object.
    await until(() => model.doStreamCalls[0]?.abortSignal?.aborted === true);
  });

  test("logs an abort as method and path only", async () => {
    const secret = "내-주민등록번호-900101-1234567";
    const model = neverEndingModel();
    const app = createApp({ authMiddleware: bypassAuth, model });
    const written: string[] = [];
    const realLog = console.log;
    const realError = console.error;

    console.log = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };
    console.error = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };

    try {
      await abortMidStream(
        app,
        createConversationRequest({ messages: [createUserMessage(secret)] })
      );
      await until(() =>
        written.some((line) => line.includes("Request aborted on"))
      );
    } finally {
      console.log = realLog;
      console.error = realError;
    }

    const log = written.join("\n");

    expect(log).toContain("Request aborted on");
    expect(log).toContain("POST");
    expect(log).toContain(`${EPISODE_PATH}/ask`);
    expect(log).not.toContain(secret);
  });

  test("로그인하지 않은 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createAskRequest({
        correction: ASKED,
        messages: [createUserMessage("the를 왜 붙여요?")],
      })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("교정 없이 온 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({ messages: [createUserMessage("the를 왜 붙여요?")] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("물을 말이 없는 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({ correction: ASKED, messages: [] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 시트의 답은 이 교정과 이 대화 안에서 나온다. 둘 다 모델에게 간다.
  test("교정과 에피소드 스냅샷을 문맥으로 답한다", async () => {
    const model = createMockModel([
      "잘못 나온 그 커피 하나를 짚어 말하기 때문이에요.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({
        correction: ASKED,
        messages: [
          {
            id: "s1",
            parts: [
              { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
              { text: "Next in line, please!", type: "text" },
            ],
            role: "assistant",
          },
          createUserMessage("the를 왜 붙여요?"),
        ],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();
    const [call] = model.doStreamCalls;
    const system = call?.prompt.find((message) => message.role === "system");
    const prompt = JSON.stringify(call?.prompt);

    expect(JSON.stringify(system)).toContain("I think this is wrong coffee.");
    expect(JSON.stringify(system)).toContain(
      "I think this is the wrong coffee."
    );
    expect(prompt).toContain("Next in line, please!");
    expect(body).toContain("잘못 나온 그 커피 하나를 짚어 말하기 때문이에요.");
    // 시트는 장면 파서를 지나지 않는다. 답은 말풍선이 아니라 평범한 답변이다.
    expect(body).not.toContain('"type":"data-speaker"');
  });

  /*
    답의 말투, 글 모양과 범위를 정하는 것은 이 프롬프트뿐이다. 앱은 받은 글을
    그대로 그리고, 규칙이 사라져도 경로는 200으로 답한다. 세 규칙이 실제로
    모델에게 가는지는 여기서만 확인할 수 있다.
  */
  test("답의 말투, 글 모양과 범위를 모델에게 지시한다", async () => {
    const model = createMockModel(["그 커피를 가리키기 때문이에요."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createConversationRequest({
        messages: [createUserMessage("the를 왜 붙여요?")],
      })
    );

    expect(response.status).toBe(200);
    await response.text();

    const system = JSON.stringify(
      model.doStreamCalls[0]?.prompt.find(
        (message) => message.role === "system"
      )
    );

    expect(system).toContain("해요체");
    expect(system).toContain("문단");
    expect(system).toContain("굵은 글씨");
    expect(system).toContain("대화로 돌아");
  });
});

interface RecentViewBody {
  stories: {
    coverEmoji: string;
    coverBlurhash: string | null;
    coverImagePath: string | null;
    hook: string;
    storyId: string;
    title: string;
  }[];
}

interface StoryPlaysViewBody {
  intro: string;
  plays: {
    episodes: {
      episodeId: string;
      hasTranscript: boolean;
      number: number;
      outcome: string;
      title: string;
    }[];
    finished: number;
    next: { episodeId: string; number: number; title: string } | null;
    storyPlayId: string;
    startedAt: string;
  }[];
  storyId: string;
  title: string;
  total: number;
}

describe("GET /ai/episode/recent", () => {
  test("rejects a request with no access token", async () => {
    const app = createApp({ authMiddleware: createUserAuthMiddleware() });

    const response = await app.request(createRecentRequest());

    expect(response.status).toBe(401);
  });

  // 대화한 적 없는 계정. 스토리 탭은 비어 있고 탐색으로 안내한다.
  test("is empty before anything has been said", async () => {
    const app = createApp({ authMiddleware: signedInWith(createEmptyState()) });

    const response = await app.request(createRecentRequest());
    const view = (await response.json()) as RecentViewBody;

    expect(response.status).toBe(200);
    expect(view.stories).toEqual([]);
  });

  // 대화한 스토리가 하나씩 선다. 진행 바는 목록에 없다.
  test("lists a story that has been spoken in, without progress", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(createRecentRequest());
    const view = (await response.json()) as RecentViewBody;

    expect(view.stories).toEqual([
      {
        coverBlurhash: "LAME]I7y8w{e009uBC,t1j%f_1My",
        coverEmoji: "☕",
        coverImagePath: null,
        hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
        storyId: STORY_ID,
        title: "Mia의 카페",
      },
    ]);
  });

  // 같은 스토리를 여러 번 진행해도 목록에는 한 줄만 선다.
  test("shows a story once however many runs it has", async () => {
    const state = createSeasonState();

    state.runs.push({
      id: "1a000000-0000-4000-8000-000000000002",
      last_user_message_at: "2026-08-29T00:09:00.000Z",
      started_at: "2026-08-29T00:08:00.000Z",
      story_id: STORY_ID,
    });

    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(createRecentRequest());
    const view = (await response.json()) as RecentViewBody;

    expect(view.stories).toHaveLength(1);
  });

  // 첫 장면만 열고 나온 회차는 사용자 메시지가 없다. 목록을 만들지 않는다.
  test("leaves out a run nobody has spoken in", async () => {
    const state = createEmptyState();

    state.runs.push({
      id: STORY_PLAY_ID,
      last_user_message_at: null,
      started_at: "2026-08-29T00:00:00.000Z",
      story_id: STORY_ID,
    });

    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(createRecentRequest());
    const view = (await response.json()) as RecentViewBody;

    expect(view.stories).toEqual([]);
  });
});

describe("GET /ai/episode/stories/:storyId/plays", () => {
  test("answers 404 for a story that does not exist", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/10000000-0000-4000-8000-000000000009/plays`
    );

    expect(response.status).toBe(404);
  });

  // 기록이 없는 스토리. 빈 화면이지 실패가 아니다.
  test("is empty when this story has no record", async () => {
    const app = createApp({ authMiddleware: signedInWith(createEmptyState()) });

    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );
    const view = (await response.json()) as StoryPlaysViewBody;

    expect(response.status).toBe(200);
    expect(view.plays).toEqual([]);
    expect(view.title).toBe("Mia의 카페");
    expect(view.total).toBe(5);
  });

  // 카드 하나. 끝낸 화가 목록으로 열리고, 이어갈 화는 그다음 화다.
  test("opens the finished episodes and names the one to continue", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            ending_kind: "성공",
            ending_outcome: "새 잔을 받아냈다.",
            episode: 1,
          },
        ])
      ),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );
    const view = (await response.json()) as StoryPlaysViewBody;
    const [storyPlay] = view.plays;

    expect(storyPlay).toMatchObject({
      finished: 1,
      next: { episodeId: episodeId(2), number: 2, title: "계산이 꼬인 아침" },
      startedAt: "2026-08-29T00:00:00.000Z",
      storyPlayId: STORY_PLAY_ID,
    });
    expect(storyPlay?.episodes).toEqual([
      {
        episodeId: episodeId(1),
        hasTranscript: false,
        number: 1,
        outcome: "새 잔을 받아냈다.",
        title: "카페에서 생긴 일",
      },
    ]);
  });

  // 완주한 회차에는 이어갈 화가 없다.
  test("has nothing left to continue once the run is finished", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );
    const view = (await response.json()) as StoryPlaysViewBody;

    expect(view.plays[0]).toMatchObject({ finished: 5, next: null });
  });

  // 결말 낱말은 서버 안에서만 쓴다. 기록으로 나가는 값에 실리지 않는다.
  test("never sends the ending word to the screen", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            ending_kind: "성공",
            ending_outcome: "새 잔을 받아냈다.",
            episode: 1,
          },
        ])
      ),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );

    expect(await response.text()).not.toContain("성공");
  });

  // 아직 아무 화도 끝내지 않은 회차도 기록에 선다. 진행 바만 비어 있다.
  test("shows a run that has not finished an episode yet", async () => {
    const state = createSeasonState();

    state.messages.push({
      created_at: "2026-08-29T00:05:00.000Z",
      id: "m1",
      parts: [{ text: "Can I change it?", type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );
    const view = (await response.json()) as StoryPlaysViewBody;

    expect(view.plays[0]).toMatchObject({
      episodes: [],
      finished: 0,
      next: { number: 1 },
    });
  });
});

describe("GET /ai/episode/stories", () => {
  // 탐색은 콘텐츠를 소개한다. 어느 회차의 진행도 여기 실리지 않는다.
  test("lists every official story with its hook and cover, and no progress", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            ending_kind: "성공",
            ending_outcome: "새 잔을 받아냈다.",
            episode: 1,
          },
        ])
      ),
    });

    const response = await app.request(`${EPISODE_PATH}/stories`);
    const view = (await response.json()) as {
      stories: {
        coverEmoji: string;
        coverBlurhash: string | null;
        coverImagePath: string | null;
        hook: string;
        mine: boolean;
        storyId: string;
        title: string;
        total: number;
      }[];
    };

    expect(response.status).toBe(200);
    expect(view.stories).toEqual([
      {
        coverBlurhash: "LAME]I7y8w{e009uBC,t1j%f_1My",
        coverEmoji: "☕",
        coverImagePath: null,
        hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
        mine: false,
        storyId: STORY_ID,
        title: "Mia의 카페",
        total: 5,
      },
    ]);
  });

  /*
    탐색의 `내 스토리` 칩이 이 값 하나로 목록을 거른다. 정책이 남의 스토리를
    아예 내려보내지 않으므로, 주인이 있다는 사실이 곧 부른 사람의 것이라는
    뜻이다. 서버가 그 해석을 하고 앱은 참·거짓만 읽는다.
  */
  test("marks a story the caller made so the filter can tell them apart", async () => {
    const state = createSeasonState();

    state.madeStories = [MADE_STORY_ROW];

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(`${EPISODE_PATH}/stories`);
    const view = (await response.json()) as {
      stories: { mine: boolean; storyId: string }[];
    };

    expect(response.status).toBe(200);
    expect(
      Object.fromEntries(
        view.stories.map((story) => [story.storyId, story.mine])
      )
    ).toEqual({
      [MADE_STORY_ID]: true,
      [STORY_ID]: false,
    });
  });
});

describe("GET /ai/episode/stories/:storyId", () => {
  test("answers 404 for a story that does not exist", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/10000000-0000-4000-8000-000000000009`
    );

    expect(response.status).toBe(404);
  });

  // 모든 화가 제목과 상황 설명을 공개한다. 진행 상태와 잠금은 여기 없다.
  test("opens every episode with its title and situation", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            ending_kind: "성공",
            ending_outcome: "새 잔을 받아냈다.",
            episode: 1,
          },
        ])
      ),
    });

    const response = await app.request(`${EPISODE_PATH}/stories/${STORY_ID}`);
    const view = (await response.json()) as {
      episodes: {
        cast: { name: string; position: number }[];
        episodeId: string;
        number: number;
        situation: string;
        situationEmoji: string;
        title: string;
      }[];
      intro: string;
      total: number;
    };

    expect(response.status).toBe(200);
    expect(view.total).toBe(5);
    expect(view.episodes).toHaveLength(5);
    expect(view.episodes[0]).toEqual({
      // 새 회차의 1화는 저장된 대화가 없어 여기서 이름표 색을 가져간다.
      cast: [{ name: "Mia", position: 1 }],
      episodeId: episodeId(1),
      number: 1,
      situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
      situationEmoji: "☕",
      title: "카페에서 생긴 일",
    });
    expect(view.episodes[4]).toEqual({
      cast: [{ name: "Mia", position: 1 }],
      episodeId: episodeId(5),
      number: 5,
      situation: "문 닫기 전에 하고 싶은 말을 건네 보세요",
      situationEmoji: "👋",
      title: "마지막 잔",
    });
  });

  // 회차를 바꿔도 목록은 같다. 상세가 진행을 읽지 않기 때문이다.
  test("shows the same list however far a run has gone", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
    });

    const response = await app.request(`${EPISODE_PATH}/stories/${STORY_ID}`);
    const body = await response.text();
    const view = JSON.parse(body) as {
      episodes: { number: number }[];
    };

    expect(view.episodes.map((episode) => episode.number)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(body).not.toContain("outcome");
    expect(body).not.toContain("새 잔을 받아냈다.");
  });
});

describe("story content database contract", () => {
  test("serves the story list from the database", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(`${EPISODE_PATH}/stories`);

    expect(response.status).toBe(200);
  });

  test("opens a saved episode by its stable id", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(episodeSessionPath(1));

    expect(response.status).toBe(200);
  });

  // 화면은 인물의 순서로 이름표 색을 고른다. 다른 화의 등장인물 목록을 받지
  // 않으므로 스토리 안의 순서를 앱이 스스로 알 수는 없다.
  test("carries each character's name and place in the story", async () => {
    // 지금 진행하는 화만 열리므로 두 화를 각각 그 자리에서 읽는다.
    const [first, third] = await Promise.all(
      [
        { finished: [] as FinishedRow[], number: 1 },
        {
          finished: [1, 2].map((episode) => ({
            ending_kind: "성공",
            ending_outcome: `${episode}화를 끝냈다.`,
            episode,
          })),
          number: 3,
        },
      ].map(async ({ finished, number }) => {
        const app = createApp({
          authMiddleware: signedInWith(createSeasonState(finished)),
        });
        const response = await app.request(episodeSessionPath(number));
        return (await response.json()) as {
          episode: { cast: { name: string; position: number }[] };
        };
      })
    );

    expect(first?.episode.cast).toEqual([{ name: "Mia", position: 1 }]);
    // 같은 인물은 어느 화에서나 같은 번호이고, 목록의 차례는 그 화가 정한다.
    expect(third?.episode.cast).toEqual([
      { name: "Mia", position: 1 },
      { name: "Owen", position: 2 },
    ]);
  });

  // 어느 대화인지 말하지 않은 요청은 읽을 회차를 고를 수 없다.
  test("refuses to open an episode without naming the conversation", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });
    const withoutRun = `${EPISODE_PATH}/${episodeId(1)}`;

    const response = await app.request(withoutRun);

    expect(response.status).toBe(400);
  });

  // 경로에서 오는 값이라 모양조차 보장되지 않는다. uuid가 아닌 화 id는 없는
  // 화이지 서버 오류가 아니다.
  test("answers 404 for an episode id that is not a uuid", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(
      `${EPISODE_PATH}/not-a-uuid?storyPlayId=${STORY_PLAY_ID}`
    );

    expect(response.status).toBe(404);
  });

  test("saves a running scene after a model turn", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: What did you order?"]),
    });

    const response = await app.request(
      createEpisodeRequest({
        episodeId: "11000000-0000-4000-8000-000000000001",
        messages: [createUserMessage("This is wrong.")],
      })
    );

    await response.text();

    expect(state.messages.map((row) => row.role)).toEqual([
      "user",
      "assistant",
    ]);
  });

  // 앱이 보낸 기준 메시지 뒤를 지우고 그 자리에서 다시 시작한다. 다시 받기와
  // 수정이 같은 규칙을 쓴다.
  test("drops the tail a retry replaces", async () => {
    const state = createSeasonState();

    state.messages.push(
      {
        created_at: "2026-08-29T00:00:00.000Z",
        id: "m1",
        parts: [{ text: "This is wrong.", type: "text" }],
        play_id: playIdOf(episodeId(1)),
        role: "user",
      },
      {
        created_at: "2026-08-29T00:00:01.000Z",
        id: "m2",
        parts: [{ text: "Mia: Let me check.", type: "text" }],
        play_id: playIdOf(episodeId(1)),
        role: "assistant",
      }
    );

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Sorry, here is the right one."]),
    });
    const response = await app.request(
      createEpisodeRequest({ episodeId: episodeId(1), keepThrough: "m1" })
    );

    await response.text();

    // 버린 답변은 사라지고 그 자리에 새 장면이 앉는다.
    expect(state.messages.map((row) => row.id)).not.toContain("m2");
    expect(state.messages.map((row) => row.role)).toEqual([
      "user",
      "assistant",
    ]);
    expect(JSON.stringify(state.messages.at(-1)?.parts)).toContain(
      "Sorry, here is the right one."
    );
  });

  test("returns the account's saved active scene for another app launch", async () => {
    const state = createSeasonState();

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [{ text: "This is wrong.", type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(episodeSessionPath(1));
    const session = (await response.json()) as {
      messages: unknown[];
      readOnly: boolean;
    };

    expect(response.status).toBe(200);
    expect(session.messages).toEqual([
      {
        id: "m1",
        parts: [{ text: "This is wrong.", type: "text" }],
        role: "user",
      },
    ]);
    expect(session.readOnly).toBeFalse();
  });

  test("returns a completed transcript as read-only", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "새 잔을 받아냈다.", episode: 1 },
    ]);

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [{ text: "I ordered an iced americano.", type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(episodeSessionPath(1));
    const session = (await response.json()) as {
      ending: { kind: string; outcome: string };
      messages: unknown[];
      nextUp: { number: number | null };
      readOnly: boolean;
    };

    expect(response.status).toBe(200);
    expect(session.messages).toHaveLength(1);
    expect(session.readOnly).toBeTrue();
    // 저장된 대화에 결말 part가 없으므로, 마무리를 그릴 값은 세션이 나른다.
    expect(session.ending).toEqual({
      kind: "성공",
      outcome: "새 잔을 받아냈다.",
    });
    expect(session.nextUp.number).toBe(2);
  });

  test("끝난 다음 화는 다시 보기로 안내하고 스토리 문맥을 함께 반환한다", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "커피를 받았다.", episode: 1 },
      { ending_kind: "성공", ending_outcome: "계산을 마쳤다.", episode: 2 },
    ]);
    state.messages.push({
      created_at: "2026-09-10T00:00:00Z",
      id: "ended-message",
      parts: [{ text: "Thank you.", type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    });
    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(episodeSessionPath(1));
    expect(await response.json()).toMatchObject({
      nextUp: { episodeId: episodeId(2), isCompleted: true },
      story: { id: STORY_ID, title: STORY_ROW.title },
    });
  });

  // 저장된 대화에 교정 part가 없으므로, 다시 연 화면이 배울 표현을 그리려면
  // 세션이 그것을 실어 와야 한다.
  test("returns the corrections saved on this play", async () => {
    const state = createSeasonState();
    const play = playIdOf(episodeId(1));

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [{ text: "I think this is wrong coffee.", type: "text" }],
      play_id: play,
      role: "user",
    });
    state.expressionResults.push({
      entries: [
        {
          fixed: "the wrong coffee",
          original: "wrong coffee",
          pattern: "article-the-specific",
          why: "the를 붙여요.",
        },
        {
          fixed: "gave me",
          original: "is",
          pattern: "give-someone-something",
          why: "누가 무엇을 줬다고 말할 때 give를 써요.",
        },
      ],
      example: "I ordered a tea.",
      example_meaning: "차를 주문했어요.",
      fixed: "I think you gave me the wrong coffee.",
      meaning: "주문한 커피가 아니에요.",
      message_id: "m1",
      situation: "주문한 것을 다시 말할 때",
      status: "corrected",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(episodeSessionPath(1));
    const session = (await response.json()) as {
      corrections: {
        entries: { pattern: string }[];
        fixed: string;
        messageId: string;
        original: string;
      }[];
    };

    expect(response.status).toBe(200);
    // 한 메시지의 항목이 하나로 묶이고, 원문은 그 메시지에서 채워진다.
    expect(session.corrections).toHaveLength(1);
    expect(session.corrections[0]).toMatchObject({
      fixed: "I think you gave me the wrong coffee.",
      messageId: "m1",
      original: "I think this is wrong coffee.",
    });
    expect(
      session.corrections.flatMap((correction) =>
        correction.entries.map((entry) => entry.pattern)
      )
    ).toEqual(["article-the-specific", "give-someone-something"]);
  });

  test("does not offer a transcript for an ending left without messages", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "옛 결말", episode: 1 },
    ]);
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(episodeSessionPath(1));

    expect(response.status).toBe(404);
  });

  // 결말만 남고 대화가 없는 화는 펼쳐도 열 것이 없다. 기록이 그것을 구분한다.
  test("marks only conversations with messages as reviewable in the record", async () => {
    const state = createSeasonState([
      { ending_kind: "성공", ending_outcome: "새 잔을 받아냈다.", episode: 1 },
      { ending_kind: "타협", ending_outcome: "현금으로 냈다.", episode: 2 },
    ]);

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "m1",
      parts: [{ text: "Done", type: "text" }],
      play_id: playIdOf(episodeId(1)),
      role: "user",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(
      `${EPISODE_PATH}/stories/${STORY_ID}/plays`
    );
    const view = (await response.json()) as {
      plays: { episodes: { hasTranscript: boolean }[] }[];
    };
    const [storyPlay] = view.plays;

    expect(storyPlay?.episodes[0]?.hasTranscript).toBeTrue();
    expect(storyPlay?.episodes[1]?.hasTranscript).toBeFalse();
  });

  test("keeps playing when an active-scene save fails", async () => {
    const state = createSeasonState();

    state.saveError = "connection refused";

    const model = createMockModel(["Mia: What did you order?"]);
    const app = createApp({ authMiddleware: signedInWith(state), model });
    const response = await app.request(
      createEpisodeRequest({
        episodeId: episodeId(1),
        messages: [createUserMessage("This is wrong.")],
      })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("What did you order?");
    expect(model.doStreamCalls).toHaveLength(1);
  });

  // 다시 받기와 수정은 둘 다 "여기까지 남긴다"는 메시지 하나로 온다. 앱은 SDK가
  // 잘라 낸 목록의 마지막 id를 싣고, 서버는 그 뒤를 지운다.
  test("drops the answers a retry replaces", async () => {
    const state = createSeasonState();
    const play = `play-${episodeId(1)}`;

    state.messages.push(
      {
        created_at: "2026-08-29T00:00:00.000Z",
        id: "opening",
        parts: [{ text: "Next in line, please!", type: "text" }],
        play_id: play,
        role: "assistant",
      },
      {
        created_at: "2026-08-29T00:00:01.000Z",
        id: "asked",
        parts: [{ text: "This is wrong.", type: "text" }],
        play_id: play,
        role: "user",
      },
      {
        created_at: "2026-08-29T00:00:02.000Z",
        id: "answered",
        parts: [{ text: "What did you order?", type: "text" }],
        play_id: play,
        role: "assistant",
      }
    );

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Let me look again."]),
    });
    const response = await app.request(
      createEpisodeRequest({ keepThrough: "asked" })
    );

    await response.text();

    // 버린 답변은 사라지고 새 답변이 그 자리에 온다.
    expect(state.messages.map((row) => row.id)).toEqual([
      "opening",
      "asked",
      expect.any(String),
    ]);
    expect(state.messages.at(-1)?.parts).not.toEqual([
      { text: "What did you order?", type: "text" },
    ]);
  });

  test("starts the conversation over when nothing is kept", async () => {
    const state = createSeasonState();
    const play = `play-${episodeId(1)}`;

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "opening",
      parts: [{ text: "Next in line, please!", type: "text" }],
      play_id: play,
      role: "assistant",
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(
      createEpisodeRequest({ keepThrough: null })
    );

    await response.text();

    // 남길 것이 없다고 하면 첫 장면부터 다시 연다.
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]?.id).not.toBe("opening");
  });

  test("keeps the record as it is when the app names a message it does not have", async () => {
    const state = createSeasonState();
    const play = `play-${episodeId(1)}`;

    state.messages.push({
      created_at: "2026-08-29T00:00:00.000Z",
      id: "opening",
      parts: [{ text: "Next in line, please!", type: "text" }],
      play_id: play,
      role: "assistant",
    });

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Sure."]),
    });
    const response = await app.request(
      createEpisodeRequest({
        keepThrough: "a-message-the-server-never-saw",
        messages: [createUserMessage("Hello?")],
      })
    );

    await response.text();

    // 앱이 뒤처진 것이지 기록이 틀린 것이 아니다. 지우지 않고 이어 간다.
    expect(state.messages[0]?.id).toBe("opening");
    expect(state.messages).toHaveLength(3);
  });

  // 자리 번호를 "몇 개 저장돼 있나"로 세면, 저장이 한 번 실패한 뒤로 그 플레이의
  // 사용자 메시지가 영영 들어가지 못한다. 실패한 턴이 다음 자리를 앞당기기
  // 때문이다.
  test("keeps saving the next turns after one save fails", async () => {
    const state = createSeasonState();
    const authMiddleware = signedInWith(state);
    // 목 모델은 한 번만 답하므로 턴마다 새로 준다.
    const play = (text: string) =>
      createApp({
        authMiddleware,
        model: createMockModel([`Mia: ${text}`]),
      });

    state.saveError = "connection refused";
    await (
      await play("What did you order?").request(
        createEpisodeRequest({
          episodeId: episodeId(1),
          messages: [createUserMessage("This is wrong.")],
        })
      )
    ).text();

    expect(state.messages).toHaveLength(0);

    state.saveError = undefined;
    await (
      await play("Let me check.").request(
        createEpisodeRequest({
          episodeId: episodeId(1),
          messages: [createUserMessage("I ordered an iced americano.")],
        })
      )
    ).text();

    expect(state.messages.map((row) => row.role)).toEqual([
      "user",
      "assistant",
    ]);
  });

  // 자리 번호에 구멍이 있어도 남기라고 지목한 메시지는 살아남아야 한다.
  test("drops only what follows the message the app named", async () => {
    const state = createSeasonState();
    const play = `play-${episodeId(1)}`;

    // 0번이 빈 기록. 저장이 한 번 실패한 뒤에 생기는 모양이다.
    state.messages.push(
      {
        created_at: "2026-08-29T00:00:01.000Z",
        id: "kept",
        parts: [{ text: "What did you order?", type: "text" }],
        play_id: play,
        role: "assistant",
      },
      {
        created_at: "2026-08-29T00:00:02.000Z",
        id: "replaced",
        parts: [{ text: "Anything else?", type: "text" }],
        play_id: play,
        role: "assistant",
      }
    );

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Let me look again."]),
    });

    await (
      await app.request(createEpisodeRequest({ keepThrough: "kept" }))
    ).text();

    expect(state.messages.map((row) => row.id)).toEqual([
      "kept",
      expect.any(String),
    ]);
  });

  test("keeps the ending when saving the closing scene fails", async () => {
    const state = createSeasonState();

    state.saveError = "connection refused";

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });
    const response = await app.request(
      createEpisodeRequest({
        episodeId: episodeId(1),
        messages: [createUserMessage("This is wrong.")],
      })
    );
    const body = await response.text();

    expect(state.recorded).toHaveLength(1);
    expect(body).toContain('"type":"data-ending"');
    expect(state.messages).toHaveLength(0);
  });

  // 결말이 난 플레이에는 더 이상 메시지를 넣을 수 없다. 그래서 닫는 장면은
  // 결말보다 먼저 저장한다.
  test("saves the closing scene before it records the ending", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here you go.\n",
        "성공: 원하던 커피를 새로 받아냈다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({
        episodeId: episodeId(1),
        messages: [createUserMessage("This is wrong.")],
      })
    );

    await response.text();

    // 사용자 메시지와 닫는 장면이 남고, 결말은 그 뒤에 기록된다. 저장된 장면에는
    // 결말 part가 없다.
    expect(state.messages.map((row) => row.role)).toEqual([
      "user",
      "assistant",
    ]);
    expect(state.recorded).toHaveLength(1);
    expect(state.messages.at(-1)?.parts).toEqual([
      { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
      { state: "done", text: "Here you go.", type: "text" },
    ]);
  });
});

/*
  새 대화가 시작되는 자리.

  회차는 사용자가 1화에서 처음 말할 때 생긴다. 상세에서 `대화 시작하기`를 눌러
  첫 장면만 보고 나오면 아무 행도 남지 않으므로, 반복해서 들어갔다 나와도 기록에
  빈 줄이 늘지 않는다.
*/
describe("새 대화 시작", () => {
  test("첫 장면만 여는 요청은 회차도 대화도 남기지 않는다", async () => {
    const state = createEmptyState();
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(
      createEpisodeRequest({ storyId: STORY_ID })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Next in line, please!");
    expect(state.runs).toEqual([]);
    expect(state.messages).toEqual([]);
  });

  test("첫 장면만 보고 나오기를 되풀이해도 회차가 늘지 않는다", async () => {
    const state = createEmptyState();
    const app = createApp({ authMiddleware: signedInWith(state) });

    for (const _ of [1, 2, 3]) {
      // biome-ignore lint/performance/noAwaitInLoops: 같은 진입을 되풀이하는 것이 이 검사다.
      const response = await app.request(
        createEpisodeRequest({ storyId: STORY_ID })
      );
      await response.text();
    }

    expect(state.runs).toEqual([]);
    expect(state.messages).toEqual([]);
  });

  test("처음 말하면 회차가 생기고 첫 장면과 그 말이 함께 남는다", async () => {
    const state = createEmptyState();
    const model = createMockModel(["Mia: Sure, let me remake it."]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    const response = await app.request(
      createEpisodeRequest({
        keepThrough: "opening-1",
        messages: [createUserMessage("This is not my coffee.")],
        storyId: STORY_ID,
      })
    );
    const body = await response.text();

    expect(state.runs).toHaveLength(1);
    expect(state.runs[0]).toMatchObject({ story_id: STORY_ID });
    // 첫 장면, 사용자의 말, 그리고 이번 턴의 장면.
    expect(state.messages.map((row) => row.role)).toEqual([
      "assistant",
      "user",
      "assistant",
    ]);
    // 앱이 보고 있던 첫 장면의 id 그대로 남는다. 다시 받기가 가리키는 자리와
    // 저장된 자리가 어긋나지 않는다.
    expect(state.messages[0]?.id).toBe("opening-1");
    expect(state.messages[0]?.parts).toEqual([
      { data: { name: null }, id: "speaker-1", type: "data-speaker" },
      { state: "done", text: "카페 카운터 앞이다.", type: "text" },
      { data: { name: "Mia" }, id: "speaker-2", type: "data-speaker" },
      { state: "done", text: "Next in line, please!", type: "text" },
      { data: { name: null }, id: "speaker-3", type: "data-speaker" },
      {
        state: "done",
        text: "직원은 벌써 뒤에 선 손님을 부른다.",
        type: "text",
      },
    ]);
    // 앱은 이 회차가 생긴 것을 응답에서 처음 안다.
    expect(body).toContain('"type":"data-story-play-started"');
    expect(body).toContain(NEW_RUN_ID);
  });

  test("새 대화는 완주한 스토리에서도 1화에서 시작한다", async () => {
    const state = createSeasonState(finishedSeason());
    const model = createMockModel(["Mia: Next in line!"]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("Hello again.")],
        storyId: STORY_ID,
      })
    );

    await response.text();

    expect(state.runs).toHaveLength(2);
    expect(state.recorded).toEqual([]);
    // 새 회차의 플레이는 1화에 붙는다. 앞 회차의 진행을 물려받지 않는다.
    expect(
      state.messages.every((row) => row.play_id === playIdOf(episodeId(1)))
    ).toBeTrue();
  });

  test("회차도 스토리도 말하지 않은 요청은 거절한다", async () => {
    const app = createApp({ authMiddleware: signedInWith(createEmptyState()) });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("Hi")],
        storyPlayId: null,
      })
    );

    expect(response.status).toBe(400);
  });

  test("없는 스토리로 시작하려는 요청은 거절한다", async () => {
    const app = createApp({ authMiddleware: signedInWith(createEmptyState()) });

    const response = await app.request(
      createEpisodeRequest({
        storyId: "10000000-0000-4000-8000-000000000009",
      })
    );

    expect(response.status).toBe(409);
  });
});

test("모든 스토리 조회 화면에 원본 표지와 같은 BlurHash를 전달한다", async () => {
  const app = createApp({ authMiddleware: signedInWith(createSeasonState()) });
  await Promise.all(
    [
      "stories",
      `stories/${STORY_ID}`,
      "recent",
      `stories/${STORY_ID}/plays`,
    ].map(async (path) => {
      const response = await app.request(`${EPISODE_PATH}/${path}`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        coverBlurhash?: string;
        stories?: { coverBlurhash: string }[];
      };
      const story = body.stories ? body.stories[0] : body;
      expect(story?.coverBlurhash).toBe("LAME]I7y8w{e009uBC,t1j%f_1My");
    })
  );
});

describe("POST /ai/episode/stories", () => {
  /** 한 가지 색으로 채운 진짜 PNG. 표지 모델이 돌려주는 그림을 대신한다. */
  function drawnPng(): Uint8Array {
    const side = 8;
    const data = new Uint8Array(side * side * 3);

    for (let at = 0; at < data.length; at += 3) {
      data[at + 2] = 255;
    }

    return encodePng({
      channels: 3,
      data,
      depth: 8,
      height: side,
      width: side,
    });
  }

  function savingApp(
    model = createWritingModel(),
    cover: {
      drawCover?: (prompt: string) => Promise<Uint8Array>;
      waitUntil?: (work: Promise<unknown>) => void;
    } = {}
  ) {
    const state = createSeasonState();

    state.madeStoryRequests = [];
    state.madeCoverRequests = [];
    state.uploadedCovers = [];

    return {
      app: createApp({
        authMiddleware: signedInWith(state),
        drawCover: cover.drawCover ?? (() => Promise.resolve(drawnPng())),
        model,
        waitUntil: cover.waitUntil,
      }),
      state,
    };
  }

  test("각본을 만들어 저장하고 앱이 열 1화를 가리킨다", async () => {
    const { app, state } = savingApp();
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      episodeId: MADE_EPISODE_ID,
      storyId: MADE_STORY_ID,
    });
    expect(state.madeStoryRequests).toHaveLength(1);
  });

  /*
    사용자가 카드에서 본 것과 저장되는 것이 같아야 한다. 각본을 쓴 모델이
    제목이나 화 번호를 흘려도 그 자리는 카드가 채운다.
  */
  test("저장 요청은 카드의 제목과 화 목록을 그대로 싣는다", async () => {
    const { app, state } = savingApp();

    await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    const [request] = state.madeStoryRequests ?? [];
    const story = request?.story as {
      characters: { name: string; position: number }[];
      episodes: { castNames: string[]; number: number; title: string }[];
      title: string;
    };

    expect(story.title).toBe("베를린 출장 일주일");
    expect(story.characters.map((person) => person.name)).toEqual([
      "Lena",
      "Markus",
    ]);
    expect(story.episodes).toEqual([
      expect.objectContaining({
        castNames: ["Lena"],
        number: 1,
        title: "예약이 없는 호텔",
      }),
    ]);
  });

  /*
    화 수와 인물 수는 데이터베이스가 거절하는 규칙이다. 각본을 만드는 데 십수
    초를 쓰기 전에 요청을 받은 자리에서 거른다.
  */
  test("규칙을 넘는 개요는 각본을 만들기 전에 돌려보낸다", async () => {
    const { app, state } = savingApp();
    const tooMany = {
      ...MADE_OUTLINE,
      episodes: [1, 2, 3, 4, 5, 6].map((number) => ({
        cast: ["Lena"],
        number,
        preview: "무슨 일이 벌어져요.",
        title: `${number}화`,
      })),
    };
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: tooMany }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    expect(state.madeStoryRequests).toHaveLength(0);
  });

  test("카드에 없는 이름이 화에 서면 돌려보낸다", async () => {
    const { app, state } = savingApp();
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({
        outline: {
          ...MADE_OUTLINE,
          episodes: [
            {
              cast: ["Nobody"],
              number: 1,
              preview: "누군지 모를 사람이 말해요.",
              title: "낯선 사람",
            },
          ],
        },
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    expect(state.madeStoryRequests).toHaveLength(0);
  });

  /*
    형식을 어긴 각본은 저장하지 않는다. 한 번 저장한 각본은 고칠 길이 없으므로,
    장면 서술이 길거나 아무도 말하지 않는 도입은 여기서 막는다.
  */
  test("장면 서술이 너무 긴 각본은 저장하지 않는다", async () => {
    const { app, state } = savingApp(
      createWritingModel({
        ...WRITTEN_STORY,
        episodes: [
          {
            ...WRITTEN_STORY.episodes[0],
            opening: "한 줄.\n두 줄.\n세 줄.\n네 줄.\nLena: Hello.",
          },
        ],
      })
    );
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(502);
    expect(state.madeStoryRequests).toHaveLength(0);
  });

  /*
    표지는 각본과 나란히 만든다. 각본이 십수 초, 표지가 십 초쯤이라 보통은
    표지가 먼저 끝나고, 그때는 1화를 열어 주기 전에 달아 둔다. 탐색으로
    돌아왔을 때 표지가 이미 거기 있으려면 그래야 한다.
  */
  test("표지가 먼저 끝나면 1화를 열어 주기 전에 단다", async () => {
    /*
      늦은 갈래로 새면 여기서 바로 터진다. 이 검사가 보려는 것은 표지가 먼저
      끝났을 때 응답을 보내기 전에 단다는 것이지, 마침 그 순서로 끝났다는 것이
      아니다.
    */
    const { app, state } = savingApp(createWritingModel(), {
      waitUntil: () => {
        throw new Error("표지가 먼저 끝났는데 늦은 갈래로 갔다");
      },
    });
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(state.uploadedCovers).toHaveLength(1);
    expect(state.uploadedCovers?.[0]?.path).toMatch(MADE_COVER_PATH);
    expect(state.madeCoverRequests).toHaveLength(1);
    expect(state.madeCoverRequests?.[0]).toEqual({
      cover_blurhash: expect.any(String),
      cover_path: state.uploadedCovers?.[0]?.path,
      story_id: MADE_STORY_ID,
    });
  });

  /*
    표지가 늦어도 기다리지 않는다. 각본이 끝나면 1화를 열어 주고, 표지는 그
    뒤에 조용히 붙는다.
  */
  test("표지가 늦으면 1화를 먼저 열고 표지는 나중에 단다", async () => {
    let finishDrawing: ((bytes: Uint8Array) => void) | undefined;
    const drawn = new Promise<Uint8Array>((resolve) => {
      finishDrawing = resolve;
    });
    const late: Promise<unknown>[] = [];
    const { app, state } = savingApp(createWritingModel(), {
      drawCover: () => drawn,
      waitUntil: (work) => {
        late.push(work);
      },
    });
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      episodeId: MADE_EPISODE_ID,
      storyId: MADE_STORY_ID,
    });
    expect(state.madeCoverRequests).toHaveLength(0);

    finishDrawing?.(drawnPng());
    await Promise.all(late);

    expect(state.madeCoverRequests).toHaveLength(1);
    expect(state.uploadedCovers).toHaveLength(1);
  });

  // 그림이 실패해도 스토리는 그대로 만들어진다. 표지 자리는 빈 색 상자로 남는다.
  test("표지 만들기가 실패해도 스토리와 1화는 그대로다", async () => {
    const { app, state } = savingApp(createWritingModel(), {
      drawCover: () => Promise.reject(new Error("safety filter")),
    });
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      episodeId: MADE_EPISODE_ID,
      storyId: MADE_STORY_ID,
    });
    expect(state.madeStoryRequests).toHaveLength(1);
    expect(state.madeCoverRequests).toHaveLength(0);
  });

  // 저장이 실패하면 붙일 스토리가 없다. 표지도 달지 않는다.
  test("각본이 실패하면 표지를 달지 않는다", async () => {
    const { app, state } = savingApp(
      createWritingModel({
        ...WRITTEN_STORY,
        episodes: [
          {
            ...WRITTEN_STORY.episodes[0],
            opening: "한 줄.\n두 줄.\n세 줄.\n네 줄.\nLena: Hello.",
          },
        ],
      })
    );
    const response = await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(response.status).toBe(502);
    expect(state.madeCoverRequests).toHaveLength(0);
  });

  test("그림 문구에 사용자가 적은 이름이 들어가지 않는다", async () => {
    const prompts: string[] = [];
    const { app } = savingApp(createWritingModel(), {
      drawCover: (prompt) => {
        prompts.push(prompt);

        return Promise.resolve(drawnPng());
      },
    });

    await app.request(`${EPISODE_PATH}/stories`, {
      body: JSON.stringify({ outline: MADE_OUTLINE }),
      method: "POST",
    });

    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain("호텔 프런트 직원.");
    expect(prompts[0]).toContain("베를린의 호텔 프런트");
    expect(prompts[0]).not.toContain("Lena");
    expect(prompts[0]).not.toContain("베를린 출장 일주일");
  });
});

describe("POST /ai/episode/create", () => {
  test("대화 기록이 없으면 요청을 받지 않는다", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
      model: createMockModel(["무엇을 만들까요?"]),
    });
    const response = await app.request(`${EPISODE_PATH}/create`, {
      body: JSON.stringify({ messages: [] }),
      method: "POST",
    });

    expect(response.status).toBe(400);
  });

  /*
    이 경로는 아무것도 저장하지 않는다. 화면을 나가면 대화와 카드가 사라진다는
    약속이 그 사실에서 나온다.
  */
  test("대화를 남기지 않는다", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["호텔에서 예약이 없는 장면은 어떨까요?"]),
    });
    const response = await app.request(`${EPISODE_PATH}/create`, {
      body: JSON.stringify({
        messages: [
          {
            id: "u1",
            parts: [{ text: "다음 달에 출장을 가요.", type: "text" }],
            role: "user",
          },
        ],
      }),
      method: "POST",
    });

    expect(response.status).toBe(200);
    await response.text();
    expect(state.messages).toHaveLength(0);
    expect(state.runs.flatMap((run) => run.id)).toEqual([STORY_PLAY_ID]);
  });
});
