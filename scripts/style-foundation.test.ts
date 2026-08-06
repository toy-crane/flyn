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
