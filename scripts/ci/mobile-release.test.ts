import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync } from "bun";

const mobile = new URL("../../apps/mobile/", import.meta.url).pathname;

test("배포용 Expo 설정은 기존 Flyn 프로젝트와 fingerprint runtime을 사용한다", () => {
  const result = spawnSync(
    [
      "node",
      "-e",
      "console.log(JSON.stringify(require('expo/config').getConfig(process.cwd()).exp))",
    ],
    {
      cwd: mobile,
      env: {
        EXPO_NO_DOTENV: "1",
        EXPO_PUBLIC_API_URL: "https://api.example.test",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ci-ios.apps.googleusercontent.com",
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "ci-web.apps.googleusercontent.com",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
        EXPO_PUBLIC_SUPABASE_URL: "https://database.example.test",
        EXPO_PUBLIC_SUPPORT_EMAIL: "support@example.test",
        EXPO_PUBLIC_WEB_URL: "https://web.example.test",
        PATH: process.env.PATH,
      },
    }
  );
  expect(result.exitCode).toBe(0);
  const config = JSON.parse(result.stdout.toString());
  expect(config.runtimeVersion).toEqual({ policy: "fingerprint" });
  expect(config.updates.url).toBe(
    "https://u.expo.dev/7d2f7888-8fc8-4ecb-b430-9fee421c68cc"
  );
  expect(config.extra.eas.projectId).toBe(
    "7d2f7888-8fc8-4ecb-b430-9fee421c68cc"
  );
  expect(config.ios.bundleIdentifier).toBe("com.odd.flyn");
  expect(config.ios.config.usesNonExemptEncryption).toBe(false);
  const eas = JSON.parse(
    readFileSync(new URL("../../apps/mobile/eas.json", import.meta.url), "utf8")
  );
  expect(eas.build.production).toMatchObject({
    channel: "internal",
    developmentClient: false,
    distribution: "store",
    environment: "production",
  });
  expect(eas.submit.production.ios).toMatchObject({
    appleTeamId: "STRPJDK4MR",
    ascAppId: "6810074671",
  });
  const pkg = JSON.parse(
    readFileSync(
      new URL("../../apps/mobile/package.json", import.meta.url),
      "utf8"
    )
  );
  expect(pkg.dependencies["expo-updates"]).toBeString();
});
