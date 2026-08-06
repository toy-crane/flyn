import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
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

describe("스타일 파운데이션 구조", () => {
  // 앱 안에 appearance 선택기를 두지 않고 시스템 light/dark를 따른다. RN 쪽
  // 구독처가 늘어나면 화면마다 다른 시점에 테마가 바뀐다.
  test("system appearance는 root theme provider에서만 구독한다", () => {
    const providerPath = path.join(sourceRoot, "theme/app-theme.tsx");
    const directSubscribers = productionSources(sourceRoot)
      .filter((filePath) => filePath !== providerPath)
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
});
