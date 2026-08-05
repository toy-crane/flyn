import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dir, "..");
const mobileRoot = path.join(repositoryRoot, "apps/mobile");
const sourceRoot = path.join(mobileRoot, "src");
const SOURCE_EXTENSION_PATTERN = /\.[jt]sx?$/;
const TEST_SOURCE_PATTERN = /\.(test|spec)\.[jt]sx?$/;
const FORBIDDEN_SOURCE_PATTERNS = [
  /\bclassName\s*=/,
  /\bcontentContainerClassName\s*=/,
  /\buseCSSVariable\b/,
  /\bfrom\s+["']uniwind(?:\/[^"']*)?["']/,
  /\brequire\(["']uniwind(?:\/[^"']*)?["']\)/,
];
const FORBIDDEN_RUNTIME_PATTERN = /uniwind|global\.css|jest-css-stub/i;
const FORBIDDEN_LOCKFILE_ENTRY_PATTERN = /^\s*"(?:uniwind|tailwindcss)":/m;
const COLOR_SCHEME_HOOK_PATTERN = /\buseColorScheme\b/;

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

describe("native style foundation structure", () => {
  test("production source는 class/CSS/Uniwind styling API를 사용하지 않는다", () => {
    const violations = productionSources(sourceRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");

      return FORBIDDEN_SOURCE_PATTERNS.filter((pattern) =>
        pattern.test(source)
      ).map((pattern) => `${relative(filePath)}: ${pattern.source}`);
    });

    expect(violations).toEqual([]);
  });

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

  test("CSS와 generated Uniwind artifact가 없다", () => {
    const forbiddenFiles = [
      "src/global.css",
      "src/uniwind-types.d.ts",
      "src/types/css.d.ts",
      "jest-css-stub.js",
    ];
    const remaining = forbiddenFiles.filter((filePath) =>
      existsSync(path.join(mobileRoot, filePath))
    );

    expect(remaining).toEqual([]);
  });

  test("manifest와 runtime config가 Uniwind pipeline을 참조하지 않는다", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(mobileRoot, "package.json"), "utf8")
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
    };
    const runtimeFiles = [
      "metro.config.js",
      "jest.config.js",
      "jest-setup.js",
      "src/app/_layout.tsx",
    ];
    const runtimeReferences = runtimeFiles.filter((filePath) =>
      FORBIDDEN_RUNTIME_PATTERN.test(
        readFileSync(path.join(mobileRoot, filePath), "utf8")
      )
    );
    const rootConfigReferences = FORBIDDEN_RUNTIME_PATTERN.test(
      readFileSync(path.join(repositoryRoot, "biome.jsonc"), "utf8")
    );
    const lockfile = readFileSync(
      path.join(repositoryRoot, "bun.lock"),
      "utf8"
    );

    expect(dependencies.uniwind).toBeUndefined();
    expect(dependencies.tailwindcss).toBeUndefined();
    expect(runtimeReferences).toEqual([]);
    expect(rootConfigReferences).toBe(false);
    expect(lockfile).not.toMatch(FORBIDDEN_LOCKFILE_ENTRY_PATTERN);
  });
});
