import { describe, expect, test } from "bun:test";

import {
  readStoryOutline,
  type StoryOutline,
  scriptProblem,
  scriptPrompt,
  storyToSave,
  type WrittenStory,
} from "./story-creation";

function card(overrides: Partial<StoryOutline> = {}): StoryOutline {
  return {
    characters: [
      { name: "Lena", position: 1, role: "호텔 프런트 직원." },
      { name: "Markus", position: 2, role: "거래처 담당자." },
    ],
    cover:
      "A woman in her thirties, dark bob, navy uniform, attentive, close-up, head tilted, teal background",
    episodes: [
      {
        cast: ["Lena"],
        details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
        number: 1,
        preview: "밤늦게 도착했는데 제 예약이 없대요.",
        title: "예약이 없는 호텔",
      },
    ],
    hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
    title: "베를린 출장 일주일",
    ...overrides,
  };
}

describe("readStoryOutline", () => {
  test("표지 문구가 빠진 카드는 받지 않는다", () => {
    expect(
      readStoryOutline({ outline: { ...card(), cover: undefined } })
    ).toEqual({ problem: "A story needs a cover description." });
  });
  test("상세 상황이 빠진 카드는 대본 생성을 시작하지 않는다", () => {
    const outline = card();
    expect(
      readStoryOutline({
        outline: {
          ...outline,
          episodes: outline.episodes.map((episode) => ({
            ...episode,
            details: undefined,
          })),
        },
      })
    ).toEqual({ problem: "Every episode needs agreed details." });
  });
  test("카드에서 줄여 보여 준 세부 조건과 표지 문구를 생성 요청까지 보존한다", () => {
    const details =
      "예약 메일에는 조용한 방이라고 적혀 있다. 다음 날 발표 때문에 자야 하므로 공사 소리가 없는 방으로 바꾸고 싶다. 직원은 소리를 지르지 않는다.";
    const cover =
      "A woman in her thirties, dark bob, navy uniform, attentive, close-up, head tilted, teal background";
    const outline = card();
    const read = readStoryOutline({
      outline: {
        ...outline,
        cover,
        episodes: outline.episodes.map((episode) => ({ ...episode, details })),
      },
    });

    expect(read).toEqual({
      outline: {
        ...outline,
        cover,
        episodes: outline.episodes.map((episode) => ({ ...episode, details })),
      },
    });
    if (!("outline" in read)) {
      throw new Error(read.problem);
    }
    expect(scriptPrompt(read.outline)).toContain(details);
  });

  test("카드의 개요를 그대로 읽는다", () => {
    const read = readStoryOutline({ outline: card() });

    expect(read).toEqual({ outline: card() });
  });

  /*
    화당 인물 셋과 스토리당 인물 넷은 데이터베이스가 거절하는 규칙이다. 대본을
    만드는 데 십수 초를 쓰고 저장에서 튕기는 대신, 요청을 받은 자리에서 센다.
  */
  test("한 화에 인물이 넷이면 받지 않는다", () => {
    const read = readStoryOutline({
      outline: card({
        characters: [
          { name: "Lena", position: 1, role: "호텔 직원." },
          { name: "Markus", position: 2, role: "거래처 담당자." },
          { name: "Sofia", position: 3, role: "현지 동료." },
          { name: "Jonas", position: 4, role: "택시 기사." },
        ],
        episodes: [
          {
            cast: ["Lena", "Markus", "Sofia", "Jonas"],
            details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
            number: 1,
            preview: "넷이 한꺼번에 말해요.",
            title: "너무 많은 사람",
          },
        ],
      }),
    });

    expect(read).toEqual({
      problem: "Every episode needs 1 to 3 characters.",
    });
  });

  test("스토리에 인물이 다섯이면 받지 않는다", () => {
    const read = readStoryOutline({
      outline: card({
        characters: [1, 2, 3, 4, 5].map((position) => ({
          name: `Person${position}`,
          position,
          role: "누군가.",
        })),
        episodes: [
          {
            cast: ["Person1"],
            details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
            number: 1,
            preview: "한 사람만 나와요.",
            title: "한 사람",
          },
        ],
      }),
    });

    expect(read).toEqual({ problem: "A story needs 1 to 4 characters." });
  });

  test("화가 여섯이면 받지 않는다", () => {
    const read = readStoryOutline({
      outline: card({
        episodes: [1, 2, 3, 4, 5, 6].map((number) => ({
          cast: ["Lena"],
          details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
          number,
          preview: "무슨 일이 벌어져요.",
          title: `${number}화`,
        })),
      }),
    });

    expect(read).toEqual({ problem: "A story needs 1 to 5 episodes." });
  });

  test("카드에 없는 이름이 화에 서면 받지 않는다", () => {
    const read = readStoryOutline({
      outline: card({
        episodes: [
          {
            cast: ["Nobody"],
            details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
            number: 1,
            preview: "누군지 모를 사람이 말해요.",
            title: "낯선 사람",
          },
        ],
      }),
    });

    expect(read).toEqual({
      problem: "An episode cannot stand someone the story never introduced.",
    });
  });

  /*
    이름표 색이 인물 순서를 따른다. 카드가 보낸 번호를 그대로 믿으면 빈자리나
    겹치는 번호가 색을 어긋나게 하고, 데이터베이스의 1..4 제약에도 걸린다.
  */
  test("인물 순서와 화 번호를 1부터 다시 매긴다", () => {
    const read = readStoryOutline({
      outline: card({
        characters: [
          { name: "Lena", position: 3, role: "호텔 직원." },
          { name: "Markus", position: 9, role: "거래처 담당자." },
        ],
        episodes: [
          {
            cast: ["Lena"],
            details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
            number: 2,
            preview: "밤늦게 도착했는데 제 예약이 없대요.",
            title: "예약이 없는 호텔",
          },
          {
            cast: ["Markus"],
            details: "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다.",
            number: 7,
            preview: "발표 중간에 말을 끊고 물어요.",
            title: "숫자를 묻는 담당자",
          },
        ],
      }),
    });

    expect(
      "outline" in read && read.outline.characters.map((p) => p.position)
    ).toEqual([1, 2]);
    expect(
      "outline" in read && read.outline.episodes.map((e) => e.number)
    ).toEqual([1, 2]);
  });
});

function script(overrides: Partial<WrittenStory["episodes"][number]> = {}) {
  return {
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
    ...overrides,
  };
}

function written(overrides: Partial<WrittenStory> = {}): WrittenStory {
  return {
    characters: [{ name: "Lena", persona: "30대 호텔 직원.", position: 1 }],
    completionCopy: "호텔부터 미팅까지 영어로 지나왔어요.",
    completionTitle: "출장을 마쳤어요",
    coverEmoji: "🧳",
    episodes: [script()],
    intro: "첫 해외 출장으로 떠난 베를린에서 보내는 일주일.",
    ...overrides,
  };
}

describe("scriptProblem", () => {
  test("합의한 화가 빠지거나 같은 번호를 두 번 쓰면 저장하지 않는다", () => {
    expect(scriptProblem(written({ episodes: [] }), card())).toBeDefined();
    expect(
      scriptProblem(written({ episodes: [script(), script()] }), card())
    ).toBeDefined();
    expect(
      scriptProblem(written({ episodes: [script({ number: 2 })] }), card())
    ).toBeDefined();
  });
  test("형식을 지킨 대본은 지나간다", () => {
    expect(scriptProblem(written())).toBeUndefined();
  });

  /*
    도입은 장면 서술 한 덩어리 뒤 대사만이다. 서술이 길어지면 화면의 첫 장면이
    읽히지 않는 글 덩어리가 되고, 저장한 대본은 고칠 길이 없다.
  */
  test("장면 서술이 네 줄이면 저장하지 않는다", () => {
    const long = written({
      episodes: [
        script({
          opening:
            "한 줄.\n두 줄.\n세 줄.\n네 줄.\nLena: I cannot find a reservation.",
        }),
      ],
    });

    expect(scriptProblem(long)).toBe(
      "Episode 1 narrates for more than three lines."
    );
  });

  test("아무도 말하지 않는 도입은 저장하지 않는다", () => {
    const silent = written({
      episodes: [script({ opening: "밤 열한 시, 호텔 프런트 앞이다." })],
    });

    expect(scriptProblem(silent)).toBe(
      "Episode 1 opens without anyone speaking."
    );
  });

  test("빈 무대는 저장하지 않는다", () => {
    const empty = written({ episodes: [script({ stage: "  " })] });

    expect(scriptProblem(empty)).toBe(
      "Episode 1 is missing part of its script."
    );
  });
});

describe("storyToSave", () => {
  test("대본 모델이 줄여도 합의한 상세 상황은 플레이 무대에 남는다", () => {
    const saved = storyToSave(card(), written()) as {
      episodes: { stage: string }[];
    };
    const [first] = saved.episodes;
    if (!first) {
      throw new Error("저장할 첫 화가 없습니다.");
    }
    expect(first.stage).toContain(
      "호텔에서 예약 확인 메일을 보여 주며 방을 요청한다."
    );
    expect(
      first.stage
        .split("\n")
        .filter(Boolean)
        .slice(1)
        .every((line) => line.startsWith("- "))
    ).toBe(true);
  });
  /*
    사용자가 카드에서 본 것과 저장되는 것이 같아야 한다. 대본을 쓰는 모델이
    제목이나 화 번호를 흘려도 그 자리는 개요가 채운다.
  */
  test("제목과 화 목록은 카드에서, 대본은 모델에서 온다", () => {
    const saved = storyToSave(
      card(),
      written({
        episodes: [script({ number: 1, title: "모델이 바꾼 제목" })],
      })
    ) as Record<string, unknown>;

    expect(saved.title).toBe("베를린 출장 일주일");
    expect(saved.episodes).toEqual([
      expect.objectContaining({
        castNames: ["Lena"],
        number: 1,
        preview: "밤늦게 도착했는데 제 예약이 없대요.",
        situation: "예약을 찾아 방을 받아 보세요",
        title: "예약이 없는 호텔",
      }),
    ]);
  });

  test("대본이 인물 설명을 빠뜨리면 카드의 역할 줄을 쓴다", () => {
    const saved = storyToSave(card(), written({ characters: [] })) as Record<
      string,
      unknown
    >;

    expect(saved.characters).toEqual([
      { name: "Lena", persona: "호텔 프런트 직원.", position: 1 },
      { name: "Markus", persona: "거래처 담당자.", position: 2 },
    ]);
  });
});
