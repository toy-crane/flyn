/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  // setupFiles는 jest-expo 프리셋이 채우므로 덮어쓰지 않는다.
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};
