import { describe, expect, test } from "bun:test";
import { buildClosingBurst, buildClosingMark } from "./lottie";

describe("결말 마크", () => {
  test("색을 입힐 레이어를 앱이 부르는 이름으로 둔다", () => {
    expect(buildClosingMark().layers.map((layer) => layer.nm)).toEqual([
      "Check",
      "Disc",
    ]);
  });

  test("원과 체크를 차례로 보여 주고 정지 프레임을 남긴다", () => {
    const mark = buildClosingMark();
    const startsAt = Object.fromEntries(
      mark.layers.map((layer) => [layer.nm, (layer.ip * 1000) / mark.fr])
    );
    expect(startsAt).toEqual({ Check: 480, Disc: 150 });
    expect((mark.op * 1000) / mark.fr).toBe(1100);
    // 마지막 프레임을 정지 상태로 쓰므로 그 프레임에서 모든 레이어가 살아 있어야 한다.
    for (const layer of mark.layers) {
      expect(layer.op).toBeGreaterThan(mark.op);
    }
  });

  test("원은 800ms 동안 나타나고 8%만 넘친다", () => {
    const disc = buildClosingMark().layers.find((layer) => layer.nm === "Disc");
    if (disc === undefined || disc.ks.s.a !== 1) {
      throw new Error("Disc 레이어의 크기가 움직이지 않습니다.");
    }
    const scale = disc.ks.s.k.map((keyframe) => ({
      at: keyframe.t * 10,
      value: keyframe.s[0],
    }));
    expect(scale).toEqual([
      { at: 150, value: 40 },
      { at: 630, value: 108 },
      { at: 950, value: 100 },
    ]);
  });

  test("lottie-android가 앞에서부터 읽으므로 모든 도형은 ty로 시작한다", () => {
    const shapes: Record<string, unknown>[] = [];
    const collect = (items: Record<string, unknown>[]) => {
      for (const item of items) {
        shapes.push(item);
        if (Array.isArray(item.it)) {
          collect(item.it as Record<string, unknown>[]);
        }
      }
    };
    for (const document of [
      buildClosingMark(),
      buildClosingBurst({ half: false }),
    ]) {
      for (const layer of document.layers) {
        collect(layer.shapes);
      }
    }
    expect(shapes.length).toBeGreaterThan(30);
    for (const item of shapes) {
      expect(Object.keys(item)[0]).toBe("ty");
    }
  });

  test("Android가 keypath를 점으로 나누므로 레이어 이름에 점이 없다", () => {
    const names = [
      ...buildClosingMark().layers,
      ...buildClosingBurst({ half: false }).layers,
    ].map((layer) => layer.nm);
    expect(names.some((name) => name.includes("."))).toBe(false);
  });
});

describe("결말 효과", () => {
  test("성공은 고리와 세 색 26조각, 목표를 이루지 못한 결말은 고리 없이 두 색 10조각이다", () => {
    const full = buildClosingBurst({ half: false });
    const half = buildClosingBurst({ half: true });
    const count = (layers: { nm: string; shapes: unknown[] }[]) =>
      Object.fromEntries(
        layers.map((layer) => [layer.nm, layer.shapes.length])
      );
    expect(count(full.layers)).toEqual({
      Accent: 9,
      Expression: 8,
      Learn: 9,
      Ring: 1,
    });
    expect(count(half.layers)).toEqual({ Accent: 5, Expression: 5 });
  });

  test("고리는 마크와 같은 중심에서 퍼지고 두 배로 커져도 상자 안에 든다", () => {
    const full = buildClosingBurst({ half: false });
    const positionOf = (name: string) => {
      const found = full.layers.find((layer) => layer.nm === name);
      if (found === undefined) {
        throw new Error(`${name} 레이어가 없습니다.`);
      }
      return { ip: found.ip, position: (found.ks.p as { k: number[] }).k };
    };
    const ring = positionOf("Ring");
    expect((ring.ip * 1000) / full.fr).toBe(350);
    // 원 64의 1.9배 반지름 61이 고리 중심(세로 가운데)부터 상자 끝까지 들어간다.
    expect(ring.position).toEqual([160, 120, 0]);
    expect(full.h - 120).toBeGreaterThanOrEqual(61);
    // 출발점은 상자의 세로 가운데라 앱이 상자 높이의 절반으로 자리를 잡는다.
    expect(positionOf("Accent").position).toEqual([160, full.h / 2, 0]);
  });
});
