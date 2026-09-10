import { describe, expect, test } from "bun:test";
import { buildClosingBurst, buildClosingMark } from "./lottie";

describe("결말 마크", () => {
  test("색을 입힐 레이어를 앱이 부르는 이름으로 둔다", () => {
    const success = buildClosingMark({ ring: true });
    const quiet = buildClosingMark({ ring: false });
    expect(success.layers.map((layer) => layer.nm)).toEqual([
      "Ring",
      "Check",
      "Disc",
    ]);
    expect(quiet.layers.map((layer) => layer.nm)).toEqual(["Check", "Disc"]);
  });

  test("원은 40ms, 체크는 260ms, 고리는 360ms에 시작하고 1초에 끝난다", () => {
    const mark = buildClosingMark({ ring: true });
    const startsAt = Object.fromEntries(
      mark.layers.map((layer) => [layer.nm, (layer.ip * 1000) / mark.fr])
    );
    expect(startsAt).toEqual({ Check: 260, Disc: 40, Ring: 360 });
    expect((mark.op * 1000) / mark.fr).toBe(1000);
    // 마지막 프레임을 정지 상태로 쓰므로 그 프레임에서 모든 레이어가 살아 있어야 한다.
    for (const layer of mark.layers) {
      expect(layer.op).toBeGreaterThan(mark.op);
    }
  });

  test("Android가 keypath를 점으로 나누므로 레이어 이름에 점이 없다", () => {
    const names = [
      ...buildClosingMark({ ring: true }).layers,
      ...buildClosingBurst({ half: false }).layers,
    ].map((layer) => layer.nm);
    expect(names.some((name) => name.includes("."))).toBe(false);
  });
});

describe("결말 조각", () => {
  test("성공은 세 색 26조각, 타협은 두 색 10조각이다", () => {
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
    });
    expect(count(half.layers)).toEqual({ Accent: 5, Expression: 5 });
  });
});
