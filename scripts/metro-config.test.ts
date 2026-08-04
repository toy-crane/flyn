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

  test("Expo Router의 route-test 차단 설정을 유지한다", () => {
    expect(config.resolver.blockList.map(String)).toContain(
      String(ROUTE_TEST_PATTERN)
    );
  });
});
