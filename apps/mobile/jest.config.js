/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  // setupFiles는 jest-expo 프리셋이 채우므로 덮어쓰지 않는다.
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  // Markdown 파서는 ESM만 배포한다. 앱의 Babel 경로로 해당 모듈과
  // 작은 파서 의존성을 함께 변환해 실제 AST 렌더링을 테스트한다.
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|mdast-util-|micromark|decode-named-character-reference|character-entities|devlop|unist-util-|markdown-table|zwitch|longest-streak))",
    "node_modules/react-native-reanimated/plugin/",
    "node_modules/@react-native/babel-preset/",
  ],
};
