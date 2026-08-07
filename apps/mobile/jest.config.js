/** @type {import('jest').Config} */
module.exports = {
  // 토큰은 Metro가 CSS를 읽어 Uniwind 런타임에 넣는다. jest는 Metro를 거치지
  // 않아 진입 CSS를 파싱할 수 없고 스타일을 단언하지도 않는다 — 빈 모듈로
  // 세운다. jest는 프리셋의 매핑과 이 항목을 합친다.
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/test-support/empty-module.js",
  },
  preset: "jest-expo",
  // setupFiles는 jest-expo 프리셋이 채우므로 덮어쓰지 않는다.
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  // Markdown 파서는 ESM만 배포한다. 앱의 Babel 경로로 해당 모듈과
  // 작은 파서 의존성을 함께 변환해 실제 AST 렌더링을 테스트한다.
  // heroui-native는 ESM으로, uniwind는 TypeScript 소스로 배포한다 — 화면
  // 테스트가 실제 컴포넌트를 렌더하려면 둘 다 같은 Babel 경로를 타야 한다.
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|heroui-native|uniwind|mdast-util-|micromark|decode-named-character-reference|character-entities|devlop|unist-util-|markdown-table|zwitch|longest-streak))",
    "node_modules/react-native-reanimated/plugin/",
    "node_modules/@react-native/babel-preset/",
  ],
};
