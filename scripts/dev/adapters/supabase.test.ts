import { describe, expect, test } from "bun:test";

import { parseSupabasePort } from "./supabase";

const missingApiPortMessage = /\[api\] port를 찾지 못했습니다/;
const notANumberMessage = /\[api\] port가 숫자가 아닙니다/;

const CONFIG = `project_id = "flyn"

[api]
enabled = true
port = 54331 # the API gateway
schemas = ["public"]

[db]
port = 54332
shadow_port = 54330

[local_smtp]
enabled = true
port = 54334
# smtp_port = 54335
`;

describe("parseSupabasePort", () => {
  test("섹션의 port를 숫자로 읽는다", () => {
    expect(parseSupabasePort(CONFIG, "api")).toBe(54_331);
    expect(parseSupabasePort(CONFIG, "local_smtp")).toBe(54_334);
  });

  test("다른 섹션의 port를 섞어 읽지 않는다", () => {
    const withoutApiPort = CONFIG.replace(
      "port = 54331 # the API gateway\n",
      ""
    );

    expect(() => parseSupabasePort(withoutApiPort, "api")).toThrow(
      missingApiPortMessage
    );
  });

  test("헤더 뒤 주석과 [[배열]] 표를 섹션 경계로 다룬다", () => {
    const withComment = CONFIG.replace("[api]", "[api] # gateway");
    const withArrayTable = CONFIG.replace(
      "port = 54331 # the API gateway",
      "[[api.extra]]\nport = 1"
    );

    expect(parseSupabasePort(withComment, "api")).toBe(54_331);
    expect(() => parseSupabasePort(withArrayTable, "api")).toThrow(
      missingApiPortMessage
    );
  });

  test("env() 같은 문자열 포트는 추측하지 않고 실패한다", () => {
    const withEnv = CONFIG.replace(
      "port = 54331 # the API gateway",
      'port = "env(SUPABASE_API_PORT)"'
    );

    expect(() => parseSupabasePort(withEnv, "api")).toThrow(notANumberMessage);
  });
});
