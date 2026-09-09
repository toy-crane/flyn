"use strict";
const { createRequire } = require("node:module");
const { resolve, join } = require("node:path");
const HASH = /^[a-f0-9]{40}$/;

async function calculate(project) {
  if (process.env.MOBILE_EXPO_STATIC_CONFIG || process.env.JEST_WORKER_ID) {
    throw new Error("fingerprint에서 Expo 환경 검증을 우회할 수 없습니다.");
  }
  process.env.EXPO_NO_DOTENV = "1";
  process.env.NODE_ENV = "production";
  const root = resolve(project);
  const fromProject = createRequire(join(root, "package.json"));
  // Fail before fingerprinting if config evaluation fails. Do not accept a partial fingerprint.
  fromProject("expo/config").getConfig(root);
  const result = await fromProject("expo/fingerprint").createFingerprintAsync(
    root,
    { platforms: ["ios"] }
  );
  if (
    !(
      [
        "expoConfig",
        "expoAutolinkingConfig:ios",
        "rncoreAutolinkingConfig:ios",
      ].every((id) =>
        result.sources.some((source) => source.id === id && source.hash)
      ) && HASH.test(result.hash)
    )
  ) {
    throw new Error("완전한 iOS fingerprint를 계산하지 못했습니다.");
  }
  return result.hash;
}

module.exports = { calculate };
if (require.main === module) {
  calculate(process.argv[2] ?? "apps/mobile")
    .then((hash) => console.log(hash))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
