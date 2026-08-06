import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dir, "..");
const mobileRoot = path.join(repositoryRoot, "apps/mobile");
const sourceRoot = path.join(mobileRoot, "src");
const SOURCE_EXTENSION_PATTERN = /\.[jt]sx?$/;
const TEST_SOURCE_PATTERN = /\.(test|spec)\.[jt]sx?$/;
const COLOR_SCHEME_HOOK_PATTERN = /\buseColorScheme\b/;
// 모노레포에서는 heroui-native가 루트로 호이스팅돼 패키지 자신의 @source가
// 닿지 않는다. 이 등록이 사라지면 라이브러리 클래스가 통째로 tree-shaking된다.
const HEROUI_SOURCE_REGISTRATION =
  '@source "../../node_modules/heroui-native/lib"';

function productionSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return productionSources(entryPath);
    }

    if (
      !SOURCE_EXTENSION_PATTERN.test(entry.name) ||
      TEST_SOURCE_PATTERN.test(entry.name)
    ) {
      return [];
    }

    return [entryPath];
  });
}

function relative(filePath: string) {
  return path.relative(repositoryRoot, filePath);
}

/** `className=` 뒤에 오는 문자열 리터럴 또는 `{...}` 식 전체를 잘라 온다. */
function classNameExpression(source: string, start: number): string {
  const opener = source[start];

  if (opener === '"' || opener === "'") {
    const end = source.indexOf(opener, start + 1);

    return end === -1 ? "" : source.slice(start + 1, end);
  }

  if (opener !== "{") {
    return "";
  }

  let depth = 0;
  let cursor = start;

  for (; cursor < source.length; cursor += 1) {
    if (source[cursor] === "{") {
      depth += 1;
    } else if (source[cursor] === "}") {
      depth -= 1;

      if (depth === 0) {
        break;
      }
    }
  }

  return source.slice(start + 1, cursor);
}

const CLASS_NAME_PROP_PATTERN = /className\s*=\s*/g;
const STRING_LITERAL_PATTERN = /"([^"\\]*)"|'([^'\\]*)'|`([^`\\$]*)`/g;
const WHITESPACE_PATTERN = /\s+/;

/**
 * 화면이 실제로 쓰는 유틸리티 클래스만 모은다. Tailwind의 `@source` 스캐너는
 * 클래스가 아닌 토막까지 후보로 주워 오므로 여기서는 `className`이 받는 문자열
 * 리터럴만 본다 — 그래야 "안 붙는 클래스"와 "그냥 지나가는 단어"를 가른다.
 */
function classNameCandidates(filePath: string): string[] {
  const source = readFileSync(filePath, "utf8");
  const found: string[] = [];

  for (const match of source.matchAll(CLASS_NAME_PROP_PATTERN)) {
    const valueStart = (match.index ?? 0) + match[0].length;
    const expression = classNameExpression(source, valueStart);

    if (!expression) {
      continue;
    }

    if (source[valueStart] === '"' || source[valueStart] === "'") {
      found.push(...expression.split(WHITESPACE_PATTERN));
      continue;
    }

    for (const literal of expression.matchAll(STRING_LITERAL_PATTERN)) {
      found.push(
        ...(literal[1] ?? literal[2] ?? literal[3] ?? "").split(
          WHITESPACE_PATTERN
        )
      );
    }
  }

  return found.filter(Boolean);
}

/**
 * 앱의 CSS 진입을 실제로 컴파일한다. `@tailwindcss/node`는 uniwind가 Metro에서
 * 쓰는 바로 그 컴파일러라, 버전과 import 해석이 번들과 어긋나지 않게 uniwind를
 * 거쳐 찾는다.
 */
async function buildStyleSheet(candidates: string[]): Promise<string> {
  const mobileRequire = createRequire(path.join(mobileRoot, "package.json"));
  const uniwindRequire = createRequire(
    mobileRequire.resolve("uniwind/package.json")
  );
  const { compile } = (await import(
    uniwindRequire.resolve("@tailwindcss/node")
  )) as {
    compile: (
      css: string,
      options: { base: string; onDependency: (file: string) => void }
    ) => Promise<{ build: (candidates: string[]) => string }>;
  };
  const entry = path.join(mobileRoot, "global.css");
  const compiler = await compile(readFileSync(entry, "utf8"), {
    base: mobileRoot,
    onDependency: () => undefined,
  });

  return compiler.build(candidates);
}

const CLASS_SELECTOR_PATTERN = /\.((?:[^\s,{)\\]|\\.)+)/g;
const SELECTOR_ESCAPE_PATTERN = /\\(.)/g;

/** 컴파일 결과에 실제 규칙이 생긴 클래스 이름 — 선택자 escape는 되돌린다. */
function generatedClassNames(styleSheet: string): Set<string> {
  return new Set(
    [...styleSheet.matchAll(CLASS_SELECTOR_PATTERN)].map((match) =>
      match[1].replace(SELECTOR_ESCAPE_PATTERN, "$1")
    )
  );
}

/**
 * 한 클래스가 실제로 내는 선언만 꺼낸다. 규칙을 못 찾으면 빈 문자열이라 "무엇을
 * 낸다"는 단언이 먼저 깨진다 — 조용히 통과하지 않는다.
 */
function declarationsOf(styleSheet: string, className: string): string {
  const opening = `.${className} {`;
  const start = styleSheet.indexOf(opening);

  if (start === -1) {
    return "";
  }

  const end = styleSheet.indexOf("}", start);

  return styleSheet.slice(start + opening.length, end);
}

type ColorScheme = "light" | "dark";

const NEGATION_OPENER = ":not(";
const LIGHT_CONTEXT_PATTERN = /\.light\b|prefers-color-scheme:\s*light/;
const DARK_CONTEXT_PATTERN = /\.dark\b|prefers-color-scheme:\s*dark/;

/**
 * `:not(...)` 안의 클래스 이름은 그 모드를 **고르는** 조건이 아니라 배제
 * 조건이다. 컴파일된 `@media (prefers-color-scheme: dark)` 블록은
 * `&:not(:where(.light, .light *, .dark, .dark *))`를 함께 달고 나오므로, 이
 * 제거 없이 문맥을 읽으면 dark 선언이 light로 잡힌다.
 */
function withoutNegations(selector: string): string {
  let result = "";
  let cursor = 0;

  for (;;) {
    const start = selector.indexOf(NEGATION_OPENER, cursor);

    if (start === -1) {
      return result + selector.slice(cursor);
    }

    result += selector.slice(cursor, start);

    let depth = 0;
    let end = start + NEGATION_OPENER.length - 1;

    for (; end < selector.length; end += 1) {
      if (selector[end] === "(") {
        depth += 1;
      } else if (selector[end] === ")") {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    cursor = end + 1;
  }
}

/**
 * 컴파일 결과의 custom property를 모드별로 모은다. **문서 순서에서 나중이
 * 이긴다** — 브랜드 팔레트는 `global.css`가 HeroUI 기본값을 덮어쓰는 형태로
 * 오고, 그때 같은 토큰이 두 번 나온다. 먼저 만난 선언을 쓰면 이 가드는 영원히
 * HeroUI 기본값만 읽는다.
 */
function themeTokens(
  styleSheet: string
): Record<ColorScheme, Map<string, string>> {
  const tokens: Record<ColorScheme, Map<string, string>> = {
    dark: new Map(),
    light: new Map(),
  };
  const context: string[] = [];
  let buffer = "";

  for (const character of styleSheet) {
    if (character === "{") {
      context.push(withoutNegations(buffer).trim());
      buffer = "";
      continue;
    }

    if (character === "}") {
      context.pop();
      buffer = "";
      continue;
    }

    if (character !== ";") {
      buffer += character;
      continue;
    }

    const declaration = buffer.trim();
    const separator = declaration.indexOf(":");

    buffer = "";

    if (!declaration.startsWith("--") || separator === -1) {
      continue;
    }

    const name = declaration.slice(0, separator).trim();
    const value = declaration.slice(separator + 1).trim();
    const scope = context.join(" ");

    if (LIGHT_CONTEXT_PATTERN.test(scope)) {
      tokens.light.set(name, value);
    } else if (DARK_CONTEXT_PATTERN.test(scope)) {
      tokens.dark.set(name, value);
    } else {
      // 모드 밖 선언은 두 모드의 기본값이다. 뒤따르는 모드 블록이 덮어쓴다.
      tokens.light.set(name, value);
      tokens.dark.set(name, value);
    }
  }

  return tokens;
}

const VAR_REFERENCE_PATTERN = /^var\(\s*(--[\w-]+)\s*\)$/;
const MAX_TOKEN_INDIRECTION = 8;

/**
 * 토큰 하나를 실제 색 값까지 따라간다. `--success-foreground: var(--eclipse)`
 * 처럼 원시색을 가리키는 토큰이 많다. 못 풀면 던진다 — 건너뛴 토큰은 조용히
 * 통과하는 단언이 된다.
 */
function resolveToken(
  tokens: Map<string, string>,
  name: string,
  depth = 0
): string {
  if (depth > MAX_TOKEN_INDIRECTION) {
    throw new Error(`토큰 참조가 순환합니다: ${name}`);
  }

  const value = tokens.get(name);

  if (!value || value === "unset") {
    throw new Error(`토큰이 값을 갖지 않습니다: ${name} (${value ?? "없음"})`);
  }

  const reference = value.match(VAR_REFERENCE_PATTERN);

  return reference ? resolveToken(tokens, reference[1], depth + 1) : value;
}

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/;
const DEGREES_PER_RADIAN = 180 / Math.PI;

/**
 * oklch를 linear sRGB로 옮긴다(Ottosson). 알파가 붙은 색은 무엇 위에 얹히는지
 * 알아야 하므로 여기서 던진다 — 이 가드는 불투명 쌍만 판정한다.
 */
function linearChannels(color: string): number[] {
  const parsed = color.match(OKLCH_PATTERN);

  if (!parsed) {
    throw new Error(`불투명 oklch 색이 아닙니다: ${color}`);
  }

  const lightness =
    parsed[2] === "%" ? Number(parsed[1]) / 100 : Number(parsed[1]);
  const chroma = Number(parsed[3]);
  const hue = Number(parsed[4]) / DEGREES_PER_RADIAN;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  const long = (lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const medium = (lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const short = (lightness - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;

  return [
    4.076_741_662_1 * long - 3.307_711_591_3 * medium + 0.230_969_929_2 * short,
    -1.268_438_004_6 * long +
      2.609_757_401_1 * medium -
      0.341_319_396_5 * short,
    -0.004_196_086_3 * long - 0.703_418_614_7 * medium + 1.707_614_701 * short,
  ];
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = linearChannels(color).map((channel) =>
    Math.min(1, Math.max(0, channel))
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);

  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** WCAG 1.4.3 — 본문 글자. */
const TEXT_CONTRAST = 4.5;
/** WCAG 1.4.11 — 뜻을 나르는 아이콘·도형. */
const GRAPHICS_CONTRAST = 3;

interface OwnedPair {
  background: string;
  /** 그 자리에 실제로 서는 것 중 엄한 쪽. 글자가 하나라도 있으면 텍스트다. */
  bar: number;
  foreground: string;
  /**
   * 기준에 못 미쳐 **측정값 그대로 고정된** 조합. 사람이 HeroUI 기본 팔레트
   * 유지를 결정했으므로 값은 바꾸지 않는다(spec의 이연 항목). 고정이 있는 한
   * 이 조합은 브랜드 팔레트 작업이 손대는 순간 실패한다 — 그게 목적이다.
   */
  pinned?: Partial<Record<ColorScheme, number>>;
  where: string;
}

/**
 * 앱 소스가 **직접** 칠하는 foreground/background 쌍. 계약이 검증을 요구하는
 * 것은 "앱이 직접 소유하는 조합"이라
 * (docs/decisions/uniwind-css-theme.md, docs/decisions/apple-hig-with-app-theme.md)
 * HeroUI 컴포넌트가 내부에서 고르는 조합은 라이브러리 몫이고 여기 없다.
 *
 * `field-background`는 지금 두 모드 모두 `surface`와 같은 값이지만 뜻이 다른
 * 토큰이라 따로 둔다 — 브랜드 팔레트가 둘을 갈라도 이 표는 그대로 맞는다.
 */
const OWNED_PAIRS: OwnedPair[] = [
  {
    background: "--background",
    bar: TEXT_CONTRAST,
    foreground: "--foreground",
    where:
      "화면 본문 전반과 native header title(navigation bridge의 colors.text)",
  },
  {
    background: "--surface",
    bar: TEXT_CONTRAST,
    foreground: "--foreground",
    where: "카드·dock 위 본문",
  },
  {
    background: "--background",
    bar: TEXT_CONTRAST,
    foreground: "--muted",
    pinned: { light: 4.43 },
    where:
      "header subtitle, launch 설정 오류 사유, 프로필 게이트 문구, 보조 설명 전반",
  },
  {
    background: "--surface",
    bar: TEXT_CONTRAST,
    foreground: "--muted",
    where: "goal-dock의 남은 턴 수 등 surface 위 보조 문구",
  },
  {
    background: "--background",
    bar: TEXT_CONTRAST,
    foreground: "--success",
    pinned: { light: 2.01 },
    where:
      "chat-conversation.tsx의 기록 한 줄(글자)과 message-mark.tsx의 맨 체크 아이콘",
  },
  {
    background: "--field-background",
    bar: GRAPHICS_CONTRAST,
    foreground: "--success",
    pinned: { light: 2.19 },
    where:
      "아이디 필드 안 가용 아이콘 — username-edit-form.tsx, onboarding/username.tsx",
  },
  {
    background: "--background",
    bar: TEXT_CONTRAST,
    foreground: "--danger",
    pinned: { light: 3.27 },
    where: "sign-in/code.tsx의 인라인 오류 문구",
  },
  {
    background: "--surface",
    bar: TEXT_CONTRAST,
    foreground: "--danger",
    pinned: { dark: 3.97, light: 3.57 },
    where:
      "settings/index.tsx의 `계정 삭제` 행 — `@expo/ui` grouped 배경이고 앱 토큰으로는 surface가 그 자리다",
  },
  {
    background: "--field-background",
    bar: GRAPHICS_CONTRAST,
    foreground: "--danger",
    where: "아이디 필드 안 중복 아이콘",
  },
  {
    background: "--success",
    bar: GRAPHICS_CONTRAST,
    foreground: "--success-foreground",
    where:
      "채워진 원 위의 체크 — goal-dock.tsx, episodes/result.tsx, chat-conversation.tsx",
  },
];

const COLOR_SCHEMES: ColorScheme[] = ["light", "dark"];

/**
 * 앱이 소유하는 색 대비. 두 계약이 명시하는 요구이고
 * (docs/decisions/uniwind-css-theme.md, docs/decisions/apple-hig-with-app-theme.md)
 * `bun run check`에서 이것이 유일한 강제 수단이다.
 *
 * **이 가드는 값을 고치지 않는다.** 사람이 HeroUI 기본 팔레트 유지를 결정했다.
 * 지금 기준을 넘는 조합에는 바닥을 깔고, 못 미치는 조합은 측정값에 고정한다 —
 * 그래야 이연된 브랜드 팔레트 작업이 문단이 아니라 실패하는 테스트를 물려받는다.
 */
describe("앱이 소유하는 색 대비", () => {
  async function measured() {
    const tokens = themeTokens(await buildStyleSheet([]));

    return COLOR_SCHEMES.flatMap((scheme) =>
      OWNED_PAIRS.map((pair) => ({
        bar: pair.bar,
        name: `${scheme} ${pair.foreground} on ${pair.background}`,
        pin: pair.pinned?.[scheme],
        ratio: contrastRatio(
          resolveToken(tokens[scheme], pair.foreground),
          resolveToken(tokens[scheme], pair.background)
        ),
        where: pair.where,
      }))
    );
  }

  test("기준을 넘는 조합은 계속 넘는다", async () => {
    const checked = (await measured()).filter(({ pin }) => pin === undefined);
    const below = checked
      .filter(({ bar, ratio }) => ratio < bar)
      .map(
        ({ bar, name, ratio, where }) =>
          `${name} — ${ratio.toFixed(2)}:1 < ${bar}:1 (${where})`
      );

    // 표가 비면 위 단언이 조용히 통과한다. 그 상태를 먼저 깬다.
    expect(checked.length).toBeGreaterThan(10);
    expect(below).toEqual([]);
  });

  /**
   * 아래 여섯은 기준 미달이며 **브랜드 팔레트 확정 전까지 받아들인 값**이다.
   * 색과 모양만으로 뜻을 나르지 않는 규칙이 살아 있어 정보는 잃지 않지만 대비는
   * 미달이다. 값이 움직이면(좋아지든 나빠지든) 여기서 먼저 깨진다.
   */
  test("기준 미달인 조합은 측정값에 고정된다", async () => {
    const pins = (await measured()).flatMap((entry) =>
      entry.pin === undefined ? [] : [{ ...entry, pin: entry.pin }]
    );
    const actual = pins.map(
      ({ bar, name, ratio }) => `${name} — ${ratio.toFixed(2)}:1 < ${bar}:1`
    );
    const recorded = pins.map(
      ({ bar, name, pin }) => `${name} — ${pin.toFixed(2)}:1 < ${bar}:1`
    );

    expect(pins.length).toBeGreaterThan(4);
    expect(actual).toEqual(recorded);
  });
});

describe("스타일 파운데이션 구조", () => {
  // 앱 안에 appearance 선택기를 두지 않고 시스템 light/dark를 따른다. 이제 그
  // 구독은 HeroUINativeProvider 아래 Uniwind가 통째로 소유하므로 앱 소스에는
  // 구독처가 하나도 없어야 한다 — 하나라도 생기면 화면마다 다른 시점에 테마가
  // 바뀐다.
  test("system appearance를 직접 구독하는 앱 소스가 없다", () => {
    const directSubscribers = productionSources(sourceRoot)
      .filter((filePath) =>
        COLOR_SCHEME_HOOK_PATTERN.test(readFileSync(filePath, "utf8"))
      )
      .map(relative);

    expect(directSubscribers).toEqual([]);
  });

  test("토큰 원본은 HeroUI 테마를 깐 CSS 진입 하나다", () => {
    const css = readFileSync(path.join(mobileRoot, "global.css"), "utf8");

    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@import "uniwind"');
    expect(css).toContain('@import "heroui-native/styles"');
    expect(css).toContain(HEROUI_SOURCE_REGISTRATION);
  });

  /**
   * uniwind는 스타일시트에 없는 클래스를 오류 없이 버린다
   * (`node_modules/uniwind/src/core/native/store.ts`). 정의되지 않은 토큰을 쓴
   * 클래스는 조용히 사라지고 표면은 컴포넌트 기본값으로 나간다 — 화면을 직접
   * 보지 않으면 드러나지 않는다. 앱이 쓰는 모든 유틸리티가 진짜 규칙을 만드는지
   * CSS 진입을 실제로 컴파일해 확인한다.
   */
  test("className이 쓰는 유틸리티는 모두 실제 규칙을 만든다", async () => {
    const usage = new Map<string, Set<string>>();

    for (const filePath of productionSources(sourceRoot)) {
      for (const candidate of classNameCandidates(filePath)) {
        const files = usage.get(candidate) ?? new Set<string>();

        files.add(relative(filePath));
        usage.set(candidate, files);
      }
    }

    const candidates = [...usage.keys()].sort();
    const generated = generatedClassNames(await buildStyleSheet(candidates));
    const dropped = candidates
      .filter((candidate) => !generated.has(candidate))
      .map(
        (candidate) =>
          `${candidate} — ${[...(usage.get(candidate) ?? [])].join(", ")}`
      );

    expect(candidates.length).toBeGreaterThan(50);
    expect(dropped).toEqual([]);
  });

  /**
   * RN은 Dynamic Type로 `fontSize`만 키우고 `lineHeight`는 그대로 둔다. 고정
   * line-height를 쓰는 입력은 큰 글자 설정에서 글자가 잘린다. Tailwind의
   * `text-*` 스케일은 짝 line-height를 가진 토큰이라 둘을 함께 내므로, composer는
   * 짝이 없는 앱 토큰을 쓴다.
   */
  test("composer 글자 토큰은 line-height를 함께 내지 않는다", async () => {
    const styleSheet = await buildStyleSheet(["text-composer", "text-base"]);

    expect(declarationsOf(styleSheet, "text-composer")).toContain("font-size");
    expect(declarationsOf(styleSheet, "text-composer")).not.toContain(
      "line-height"
    );
    // 대조군 — Tailwind 스케일 토큰은 line-height를 함께 낸다. 이 단언이 깨지면
    // 위 검사가 무엇을 막고 있었는지도 사라진 것이다.
    expect(declarationsOf(styleSheet, "text-base")).toContain("line-height");
  });
});
