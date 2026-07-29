import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mobileRoot = path.resolve(import.meta.dir, "../apps/mobile");
const config = require("../apps/mobile/metro.config.js");
const ROUTE_TEST_PATTERN = /\/src\/app\/.*\.(test|spec)\.[tj]sx?$/;

describe("Metro config", () => {
  test("현재 워크트리 안에 transformer와 file-map cache를 둔다", () => {
    class CapturingFileStore {
      readonly root: string;

      constructor(options: { root: string }) {
        this.root = options.root;
      }
    }

    expect(typeof config.cacheStores).toBe("function");

    const stores = config.cacheStores({ FileStore: CapturingFileStore });

    expect(stores).toHaveLength(1);
    expect(stores[0].root).toBe(path.join(mobileRoot, ".expo", "metro-cache"));
    expect(config.fileMapCacheDirectory).toBe(
      path.join(mobileRoot, ".expo", "metro-file-map")
    );
    expect(existsSync(path.join(mobileRoot, ".expo", "metro-cache"))).toBe(
      true
    );
    expect(existsSync(path.join(mobileRoot, ".expo", "metro-file-map"))).toBe(
      true
    );
  });

  test("기존 Expo Router와 Uniwind 설정을 유지한다", () => {
    expect(config.resolver.blockList.map(String)).toContain(
      String(ROUTE_TEST_PATTERN)
    );
    expect(config.transformer.uniwind).toEqual({
      cssEntryFile: "./src/global.css",
      dtsFile: "./src/uniwind-types.d.ts",
    });
  });

  test("Uniwind가 표시한 uncached CSS 결과는 저장하지 않는다", async () => {
    const writes: unknown[] = [];

    class RecordingFileStore {
      set(_key: Buffer, value: unknown) {
        writes.push(value);
        return Promise.resolve();
      }
    }

    const [store] = config.cacheStores({ FileStore: RecordingFileStore });
    const uncachedCss = {
      output: [{ data: { css: { skipCache: true } } }],
    };
    const cacheableModule = {
      output: [{ data: { code: "module.exports = true" } }],
    };

    await store.set(Buffer.from("uncached"), uncachedCss);
    await store.set(Buffer.from("cacheable"), cacheableModule);

    expect(writes).toEqual([cacheableModule]);
  });
});
