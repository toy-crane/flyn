/** @type {import('jest').Config} */
module.exports = {
  // CSS는 Metro만 처리한다 — jest가 파싱하려 들면 SyntaxError로 죽는다.
  moduleNameMapper: { "\\.css$": "<rootDir>/jest-css-stub.js" },
  preset: "jest-expo",
  // setupFiles는 jest-expo 프리셋이 채우므로 덮어쓰지 않는다.
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};
