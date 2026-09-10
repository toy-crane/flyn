/** @type {import("jest").Config} */
const config = {
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/shared/test/style-mock.ts",
    // The same prefix tsconfig.json declares for Metro. Jest resolves modules
    // on its own, so a test that mocks "@/..." needs this to find the file.
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@env$": "<rootDir>/env-runtime.ts",
    "^lucide-react-native/icons/(.*)$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/icons/$1.js",
  },
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Development Build이 만드는 `ios`와 `android`는 앱의 소스가 아니다. 그 안의
  // Pods에는 hermes가 딸려 보내는 테스트 파일이 수백 개 들어 있어서, 한 번이라도
  // 네이티브를 빌드한 checkout에서는 `bun run test`가 그것들을 함께 집어 든다.
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/ios/",
    "<rootDir>/android/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(.bun|@noble/.*|@t3-oss/.*|ai/.*|@ai-sdk/.*|@workflow/.*|swr|throttleit|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|heroui-native|lucide-react-native|uniwind|tailwind-merge|tailwind-variants|react-navigation|@react-navigation/.*|standard-navigation|@sentry/react-native|native-base|react-native-svg|react-native-nitro-google-signin|react-native-nitro-modules))",
  ],
};

export default config;
