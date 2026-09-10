/**
 * 결말 축하의 Lottie 문서를 만든다.
 *
 * 마크(파란 원, 체크, 고리)와 조각(세 색의 폭죽)은 After Effects 없이 여기서
 * 좌표와 박자를 적어 JSON으로 낸다. 박자는 스펙의 시안 `closing.html`이
 * CSS로 보여 준 값 그대로다. 색은 파일에 밝은 화면의 값을 박아 두지만, 앱이
 * 실행 시점에 레이어 이름으로 강조색과 채널 색을 다시 입힌다. 그래서 레이어
 * 이름이 곧 앱과의 약속이고, Android가 keypath를 `.`으로 나누므로 이름에
 * `.`을 두지 않는다.
 */

/** 1프레임이 10ms가 되게 해서 시안의 ms 값을 그대로 옮긴다. */
const FRAME_RATE = 100;
const frame = (ms: number) => Math.round(ms / 10);

type Vector = number[];

interface Easing {
  i: { x: number[]; y: number[] };
  o: { x: number[]; y: number[] };
}

interface Keyframe {
  e?: Vector;
  i?: Easing["i"];
  o?: Easing["o"];
  s: Vector;
  t: number;
}

type Property = { a: 0; k: unknown } | { a: 1; k: Keyframe[] };

interface Shape {
  nm: string;
  ty: string;
  [key: string]: unknown;
}

export interface Layer {
  ao: 0;
  bm: 0;
  ddd: 0;
  ind: number;
  ip: number;
  ks: {
    a: Property;
    o: Property;
    p: Property;
    r: Property;
    s: Property;
  };
  nm: string;
  op: number;
  parent?: number;
  shapes: Shape[];
  sr: 1;
  st: 0;
  ty: 4;
}

export interface LottieDocument {
  assets: never[];
  ddd: 0;
  fr: number;
  h: number;
  ip: 0;
  layers: Layer[];
  nm: string;
  op: number;
  v: string;
  w: number;
}

function pick<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`${index}번째 항목이 없습니다.`);
  }
  return item;
}

/** CSS `cubic-bezier(x1, y1, x2, y2)`를 Lottie의 나가는 접선과 들어오는 접선으로 옮긴다. */
function bezier(x1: number, y1: number, x2: number, y2: number): Easing {
  return { i: { x: [x2], y: [y2] }, o: { x: [x1], y: [y1] } };
}

const EASE_OUT = bezier(0, 0, 0.58, 1);
/** 시안의 `cubic-bezier(.2,.75,.25,1.4)`. 넘침은 키프레임에 박아 두고 접선은 1 안에 둔다. */
const POP = bezier(0.2, 0.75, 0.25, 1);
const SETTLE = bezier(0.4, 0, 0.2, 1);
const CONFETTI = bezier(0.14, 0.6, 0.32, 1);

const still = (value: unknown): Property => ({ a: 0, k: value });

/**
 * 값이 바뀌는 순간들을 키프레임으로 엮는다. 마지막 키프레임에는 값만 남기고,
 * 그 앞의 키프레임에는 다음 값을 `e`로도 적어 옛 렌더러까지 같은 보간을 하게
 * 한다.
 */
function animate(
  steps: { at: number; easing?: Easing; value: Vector }[]
): Property {
  return {
    a: 1,
    k: steps.map((step, index) => {
      const next = steps[index + 1];
      if (next === undefined) {
        return { s: step.value, t: step.at };
      }
      const easing = step.easing ?? EASE_OUT;
      return { ...easing, e: next.value, s: step.value, t: step.at };
    }),
  };
}

type Color = [number, number, number];
const hex = (value: string): Color => [
  Number.parseInt(value.slice(1, 3), 16) / 255,
  Number.parseInt(value.slice(3, 5), 16) / 255,
  Number.parseInt(value.slice(5, 7), 16) / 255,
];

/** 밝은 화면의 값. 앱이 실행 시점에 같은 이름의 색으로 덮어쓴다. */
const colors = {
  accent: hex("#0087ff"),
  accentForeground: hex("#ffffff"),
  expression: hex("#0f766e"),
  learn: hex("#7c3aed"),
} satisfies Record<string, Color>;

function fill(color: Color, opacity = 100): Shape {
  return {
    bm: 0,
    c: still([...color, 1]),
    nm: "Fill",
    o: still(opacity),
    r: 1,
    ty: "fl",
  };
}

function stroke(color: Color, width: number): Shape {
  return {
    bm: 0,
    c: still([...color, 1]),
    lc: 2,
    lj: 2,
    ml: 4,
    nm: "Stroke",
    o: still(100),
    ty: "st",
    w: still(width),
  };
}

function ellipse(diameter: number): Shape {
  return {
    d: 1,
    nm: "Ellipse",
    p: still([0, 0]),
    s: still([diameter, diameter]),
    ty: "el",
  };
}

const identity = () => ({
  a: still([0, 0]),
  o: still(100),
  p: still([0, 0]),
  r: still(0),
  s: still([100, 100]),
  sa: still(0),
  sk: still(0),
});

function group(name: string, items: Shape[], transform = identity()): Shape {
  return {
    it: [...items, { ...transform, nm: "Transform", ty: "tr" }],
    nm: name,
    ty: "gr",
  };
}

function layer(
  name: string,
  index: number,
  shapes: Shape[],
  options: {
    ip: number;
    ks?: Partial<Layer["ks"]>;
    op: number;
    parent?: number;
    position: Vector;
  }
): Layer {
  return {
    ao: 0,
    bm: 0,
    ddd: 0,
    ind: index,
    ip: options.ip,
    ks: {
      a: still([0, 0, 0]),
      o: still(100),
      p: still([...options.position, 0]),
      r: still(0),
      s: still([100, 100, 100]),
      ...options.ks,
    },
    nm: name,
    op: options.op,
    ...(options.parent === undefined ? {} : { parent: options.parent }),
    shapes,
    sr: 1,
    st: 0,
    ty: 4,
  };
}

function compose(
  name: string,
  size: [number, number],
  op: number,
  layers: Layer[]
): LottieDocument {
  return {
    assets: [],
    ddd: 0,
    fr: FRAME_RATE,
    h: size[1],
    ip: 0,
    layers,
    nm: name,
    op,
    v: "5.12.2",
    w: size[0],
  };
}

/** 마크 상자. 원 64에 5짜리 후광이 붙고 튀는 순간 114%까지 커지므로 88로 잡는다. */
export const MARK_SIZE = 88;
const MARK_CENTER = MARK_SIZE / 2;
const DISC_DIAMETER = 64;
const HALO_WIDTH = 5;
const MARK_DURATION = 1000;

/**
 * 파란 원이 튀어나오고(40ms부터 520ms) 안에서 체크가 그려지며(260ms부터
 * 360ms) 고리가 한 번 퍼진다(360ms부터 620ms). 마지막 프레임은 고리가 사라진
 * 정지 상태라 동작 줄이기와 기록 재방문이 같은 그림을 쓴다.
 */
export function buildClosingMark({ ring }: { ring: boolean }): LottieDocument {
  const end = frame(MARK_DURATION);
  // 마지막 프레임에서도 레이어가 살아 있도록 레이어의 끝은 문서의 끝 너머에 둔다.
  const layerEnd = end + 1;
  const popStart = frame(40);
  const popPeak = frame(40 + 520 * 0.6);
  const popEnd = frame(40 + 520);
  const disc = layer(
    "Disc",
    1,
    [
      group("Disc", [ellipse(DISC_DIAMETER), fill(colors.accent)]),
      group("Halo", [
        ellipse(DISC_DIAMETER + HALO_WIDTH * 2),
        fill(colors.accent, 14),
      ]),
    ],
    {
      ip: popStart,
      ks: {
        o: animate([
          { at: popStart, easing: POP, value: [0] },
          { at: popPeak, value: [100] },
        ]),
        r: animate([
          { at: popStart, easing: POP, value: [-10] },
          { at: popPeak, easing: SETTLE, value: [3] },
          { at: popEnd, value: [0] },
        ]),
        s: animate([
          { at: popStart, easing: POP, value: [40, 40, 100] },
          { at: popPeak, easing: SETTLE, value: [114, 114, 100] },
          { at: popEnd, value: [100, 100, 100] },
        ]),
      },
      op: layerEnd,
      position: [MARK_CENTER, MARK_CENTER],
    }
  );
  // 시안의 24칸 체크(`M5 12.5l4.5 4.5L19 7`)를 32pt로 키워 원 가운데에 둔다.
  const scale = 32 / 24;
  const point = (x: number, y: number) => [
    Number(((x - 12) * scale).toFixed(2)),
    Number(((y - 12) * scale).toFixed(2)),
  ];
  const drawStart = frame(260);
  const check = layer(
    "Check",
    2,
    [
      group("Check", [
        {
          ks: still({
            c: false,
            i: [
              [0, 0],
              [0, 0],
              [0, 0],
            ],
            o: [
              [0, 0],
              [0, 0],
              [0, 0],
            ],
            v: [point(5, 12.5), point(9.5, 17), point(19, 7)],
          }),
          nm: "Path",
          ty: "sh",
        },
        {
          e: animate([
            { at: drawStart, easing: SETTLE, value: [0] },
            { at: frame(260 + 360), value: [100] },
          ]),
          m: 1,
          nm: "Trim",
          o: still(0),
          s: still(0),
          ty: "tm",
        },
        stroke(colors.accentForeground, 3 * scale),
      ]),
    ],
    {
      ip: drawStart,
      op: layerEnd,
      // 원이 튀는 동안 체크도 같이 커지도록 원 레이어에 매단다.
      parent: 1,
      position: [0, 0],
    }
  );
  const ringStart = frame(360);
  const ringLayer = layer(
    "Ring",
    3,
    [group("Ring", [ellipse(DISC_DIAMETER), stroke(colors.accent, 2)])],
    {
      ip: ringStart,
      ks: {
        o: animate([
          { at: ringStart, value: [50] },
          { at: frame(360 + 620), value: [0] },
        ]),
        s: animate([
          { at: ringStart, value: [90, 90, 100] },
          { at: frame(360 + 620), value: [190, 190, 100] },
        ]),
      },
      op: layerEnd,
      position: [MARK_CENTER, MARK_CENTER],
    }
  );
  return compose(
    ring ? "closing-mark" : "closing-mark-quiet",
    [MARK_SIZE, MARK_SIZE],
    end,
    ring ? [ringLayer, check, disc] : [check, disc]
  );
}

/** 조각이 퍼지는 상자. 시안의 가장 먼 조각(±149, -105에서 +54)이 들어간다. */
export const BURST_SIZE: [number, number] = [320, 200];
/** 상자 안에서 조각이 터져 나오는 자리. 카드 위에서 46pt 아래, 가로 가운데다. */
export const BURST_ORIGIN: [number, number] = [160, 120];
const BURST_DELAY = 320;
const BURST_DURATION = 1150;
const BURST_STAGGER = 30;

type Channel = "accent" | "expression" | "learn";
const CHANNEL_LAYERS: { channel: Channel; name: string }[] = [
  { channel: "accent", name: "Accent" },
  { channel: "learn", name: "Learn" },
  { channel: "expression", name: "Expression" },
];
const FULL_CHANNELS: readonly Channel[] = ["accent", "learn", "expression"];
const HALF_CHANNELS: readonly Channel[] = ["expression", "accent"];

const pieceShapes: readonly Shape[] = [
  {
    d: 1,
    nm: "Rect",
    p: still([0, 0]),
    r: still(2),
    s: still([6, 10]),
    ty: "rc",
  },
  ellipse(6),
  {
    d: 1,
    ir: still(1.7),
    is: still(0),
    nm: "Star",
    or: still(5),
    os: still(0),
    p: still([0, 0]),
    pt: still(4),
    r: still(0),
    sy: 1,
    ty: "sr",
  },
];

/**
 * 시안의 `burst()`. 성공은 세 색 26조각이 넓게, 타협은 파랑과 청록 10조각이
 * 0.6배로 퍼진다. 조각마다 320ms 뒤 30ms씩 엇갈려 1150ms 동안 날아오르고
 * 떨어지며 사라진다.
 */
export function buildClosingBurst({ half }: { half: boolean }): LottieDocument {
  const count = half ? 10 : 26;
  const spread = half ? 0.6 : 1;
  const pieces = new Map<Channel, Shape[]>();
  for (let index = 0; index < count; index += 1) {
    const direction = index % 2 ? -1 : 1;
    const channel = half
      ? pick(HALF_CHANNELS, index % 2)
      : pick(FULL_CHANNELS, index % 3);
    const dx = Math.round(direction * (30 + ((index * 19) % 120)) * spread);
    const dy = Math.round(-(26 + ((index * 29) % 80)) * spread);
    const turn = direction * (90 + ((index * 37) % 220));
    const start = frame(BURST_DELAY + (index % 5) * BURST_STAGGER);
    const at = (fraction: number) => start + frame(BURST_DURATION * fraction);
    const piece = group(
      `Piece ${index + 1}`,
      [pick(pieceShapes, index % 3), fill(colors[channel])],
      {
        ...identity(),
        o: animate([
          { at: start, easing: CONFETTI, value: [0] },
          { at: at(0.1), easing: CONFETTI, value: [100] },
          { at: at(0.55), easing: CONFETTI, value: [100] },
          { at: at(1), value: [0] },
        ]),
        p: animate([
          { at: start, easing: CONFETTI, value: [0, 6] },
          { at: at(0.1), easing: CONFETTI, value: [dx * 0.25, dy * 0.45] },
          { at: at(0.55), easing: CONFETTI, value: [dx * 0.8, dy] },
          { at: at(1), value: [dx, dy + 80] },
        ]),
        r: animate([
          { at: start, easing: CONFETTI, value: [0] },
          { at: at(0.1), easing: CONFETTI, value: [turn * 0.2] },
          { at: at(0.55), easing: CONFETTI, value: [turn * 0.6] },
          { at: at(1), value: [turn] },
        ]),
        s: animate([
          { at: start, easing: CONFETTI, value: [60, 60] },
          { at: at(0.1), value: [100, 100] },
        ]),
      }
    );
    pieces.set(channel, [...(pieces.get(channel) ?? []), piece]);
  }
  const end = frame(BURST_DELAY + 4 * BURST_STAGGER + BURST_DURATION);
  const layers = CHANNEL_LAYERS.filter(({ channel }) =>
    pieces.has(channel)
  ).map(({ channel, name }, index) =>
    layer(name, index + 1, pieces.get(channel) ?? [], {
      ip: frame(BURST_DELAY),
      op: end + 1,
      position: BURST_ORIGIN,
    })
  );
  return compose(
    half ? "closing-burst-half" : "closing-burst",
    BURST_SIZE,
    end,
    layers
  );
}
