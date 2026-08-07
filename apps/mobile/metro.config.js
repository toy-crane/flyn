const { getDefaultConfig } = require("expo/metro-config");
const { mkdirSync } = require("node:fs");
const path = require("node:path");
const { withUniwindConfig } = require("uniwind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-router는 src/app/** 의 모든 .tsx를 라우트로 스캔한다 — 테스트 파일까지 번들에
// 들어가 @testing-library가 앱에 끌려온다. jest는 Metro resolver를 쓰지 않아 영향 없다.
// Expo 기본값(ios/Pods, __tests__, .expo/types)에 덧붙인다 — 통째로 덮으면 prebuild가
// 만든 Pods 트리까지 Metro가 훑는다.
config.resolver.blockList = [
  ...config.resolver.blockList,
  /\/src\/app\/.*\.(test|spec)\.[tj]sx?$/,
];

const transformerCacheDirectory = path.join(__dirname, ".expo", "metro-cache");
const fileMapCacheDirectory = path.join(__dirname, ".expo", "metro-file-map");
mkdirSync(transformerCacheDirectory, { recursive: true });
mkdirSync(fileMapCacheDirectory, { recursive: true });
config.fileMapCacheDirectory = fileMapCacheDirectory;

module.exports = {
  // withUniwindConfig를 가장 바깥 래퍼로 둔다 — 안쪽에서 다른 래퍼가
  // transformer를 나중에 덮으면 className이 스타일로 변환되지 않는다.
  ...withUniwindConfig(config, {
    cssEntryFile: "./global.css",
    dtsFile: "./src/uniwind-types.d.ts",
  }),
  // uniwind는 transformer 캐시를 os.tmpdir() 공용 경로로 되돌린다. 워크트리마다
  // Worklets·Babel 조합이 달라 공용 캐시는 JS와 네이티브를 어긋나게 만든다
  // (docs/decisions/worktree-isolated-mobile-runtime.md). 캐시 자리만 워크트리로
  // 되돌리고, CSS 모듈을 캐시에 넣지 않는 uniwind의 가드는 그대로 가져온다 —
  // 넣으면 토큰을 고쳐도 이전 스타일시트가 계속 나온다.
  cacheStores: ({ FileStore }) => [
    new (class extends FileStore {
      async set(key, value) {
        if (value?.output?.[0]?.data?.css?.skipCache) {
          return;
        }

        return await super.set(key, value);
      }
    })({ root: transformerCacheDirectory }),
  ],
};
