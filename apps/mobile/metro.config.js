const { getDefaultConfig } = require("expo/metro-config");
const { mkdirSync } = require("node:fs");
const path = require("node:path");

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

config.cacheStores = ({ FileStore }) => [
  new FileStore({
    root: transformerCacheDirectory,
  }),
];

module.exports = config;
