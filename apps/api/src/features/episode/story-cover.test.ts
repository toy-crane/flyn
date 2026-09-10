import { describe, expect, test } from "bun:test";
import { encode } from "fast-png";

import { coverPrompt, madeCover } from "./story-cover";
import type { StoryOutline } from "./story-creation";

function card(overrides: Partial<StoryOutline> = {}): StoryOutline {
  return {
    characters: [
      {
        name: "Lena",
        position: 1,
        role: "30대 호텔 프런트 직원. 규정을 지킨다.",
      },
      { name: "Markus", position: 2, role: "거래처 담당자. 숫자를 묻는다." },
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
    ...overrides,
  };
}

/** 한 가지 색으로 채운 진짜 PNG. 해시와 BlurHash가 이 그림에서 나온다. */
function png(red: number, green: number, blue: number): Uint8Array {
  const side = 8;
  const data = new Uint8Array(side * side * 3);

  for (let at = 0; at < data.length; at += 3) {
    data[at] = red;
    data[at + 1] = green;
    data[at + 2] = blue;
  }

  return encode({ channels: 3, data, depth: 8, height: side, width: side });
}

describe("coverPrompt", () => {
  test("순서 1번 인물의 설명과 장소가 들어간다", () => {
    const prompt = coverPrompt(card());

    expect(prompt).toContain("30대 호텔 프런트 직원. 규정을 지킨다.");
    expect(prompt).toContain("베를린의 호텔 프런트");
  });

  /*
    사용자가 적은 실제 사람이나 회사 이름이 각본에 남는다. 그림 문구에는 넣지
    않는다. 인물 이름, 제목, 한 줄 소개, 화 제목이 모두 사용자의 말을 그대로
    옮길 수 있는 자리다.
  */
  test("사용자가 적은 이름과 제목은 들어가지 않는다", () => {
    const prompt = coverPrompt(
      card({
        characters: [
          {
            name: "Jaeyoon",
            position: 1,
            role: "40대 변호사. 서류를 꼼꼼히 본다.",
          },
        ],
        hook: "김재윤 변호사님과 만나요",
        title: "법무법인 세종 미팅",
      })
    );

    expect(prompt).not.toContain("Jaeyoon");
    expect(prompt).not.toContain("법무법인 세종");
    expect(prompt).not.toContain("김재윤");
    expect(prompt).toContain("40대 변호사. 서류를 꼼꼼히 본다.");
  });

  test("순서 1번이 아닌 인물은 그리지 않는다", () => {
    const prompt = coverPrompt(card());

    expect(prompt).not.toContain("거래처 담당자. 숫자를 묻는다.");
  });

  test("장소가 없어도 문구를 만든다", () => {
    const prompt = coverPrompt(card({ setting: undefined }));

    expect(prompt).toContain("30대 호텔 프런트 직원. 규정을 지킨다.");
  });

  // 인물이 하나도 없는 카드는 저장 앞에서 걸리지만, 그림은 그보다 먼저 시작한다.
  test("인물이 없으면 문구를 만들지 않는다", () => {
    expect(coverPrompt(card({ characters: [] }))).toBeUndefined();
  });
});

describe("madeCover", () => {
  const owner = "11111111-1111-4111-8111-111111111111";

  test("자기 폴더에 내용 해시로 올리고 경로와 해시를 돌려준다", async () => {
    const uploaded: { bytes: Uint8Array; path: string }[] = [];
    const made = await madeCover({
      bucket: {
        upload: (path, bytes) => {
          uploaded.push({ bytes, path });

          return Promise.resolve({ error: null });
        },
      },
      draw: () => Promise.resolve(png(0, 0, 255)),
      outline: card(),
      ownerId: owner,
    });

    expect(made?.path).toMatch(
      new RegExp(`^made/${owner}/[0-9a-f]{64}\\.png$`)
    );
    expect(made?.blurhash).toBeString();
    expect(uploaded).toHaveLength(1);
    expect(uploaded[0]?.path).toBe(made?.path);
  });

  test("같은 그림은 같은 이름이고 다른 그림은 다른 이름이다", async () => {
    const upload = () => Promise.resolve({ error: null });
    const blue = await madeCover({
      bucket: { upload },
      draw: () => Promise.resolve(png(0, 0, 255)),
      outline: card(),
      ownerId: owner,
    });
    const sameBlue = await madeCover({
      bucket: { upload },
      draw: () => Promise.resolve(png(0, 0, 255)),
      outline: card(),
      ownerId: owner,
    });
    const red = await madeCover({
      bucket: { upload },
      draw: () => Promise.resolve(png(255, 0, 0)),
      outline: card(),
      ownerId: owner,
    });

    expect(sameBlue).toEqual(blue);
    expect(red?.path).not.toBe(blue?.path);
    expect(red?.blurhash).not.toBe(blue?.blurhash);
  });

  test("그림 만들기가 실패하면 아무것도 돌려주지 않는다", async () => {
    const made = await madeCover({
      bucket: { upload: () => Promise.resolve({ error: null }) },
      draw: () => Promise.reject(new Error("safety filter")),
      outline: card(),
      ownerId: owner,
    });

    expect(made).toBeUndefined();
  });

  test("올리기가 실패하면 아무것도 돌려주지 않는다", async () => {
    const made = await madeCover({
      bucket: {
        upload: () => Promise.resolve({ error: { message: "network down" } }),
      },
      draw: () => Promise.resolve(png(0, 0, 255)),
      outline: card(),
      ownerId: owner,
    });

    expect(made).toBeUndefined();
  });

  /*
    같은 그림을 두 사람이 만들 수 있다. 이름이 내용의 해시라 이미 있는 파일과
    부딪히는데, 그 파일이 곧 우리가 올리려던 그림이다.
  */
  test("이미 있는 파일이면 그대로 그 경로를 쓴다", async () => {
    const made = await madeCover({
      bucket: {
        upload: () =>
          Promise.resolve({
            error: { message: "The resource already exists" },
          }),
      },
      draw: () => Promise.resolve(png(0, 0, 255)),
      outline: card(),
      ownerId: owner,
    });

    expect(made?.path).toMatch(
      new RegExp(`^made/${owner}/[0-9a-f]{64}\\.png$`)
    );
  });

  test("인물이 없으면 그림을 만들지 않는다", async () => {
    let drawn = false;
    const made = await madeCover({
      bucket: { upload: () => Promise.resolve({ error: null }) },
      draw: () => {
        drawn = true;

        return Promise.resolve(png(0, 0, 255));
      },
      outline: card({ characters: [] }),
      ownerId: owner,
    });

    expect(made).toBeUndefined();
    expect(drawn).toBe(false);
  });
});
