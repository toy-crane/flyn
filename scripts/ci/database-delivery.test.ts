import { expect, test } from "bun:test";
import {
  loadDatabaseDelivery,
  SupabaseDatabaseDelivery,
} from "./database-delivery";

const migration = {
  hash: "a".repeat(64),
  version: "20260909123219",
};
const request = {
  remoteId: null,
  requestId: "test-request",
  service: "database" as const,
  sha: "b".repeat(40),
};

test("검토한 SQL 해시가 없으면 운영 마이그레이션을 적용하지 않는다", async () => {
  const commands: string[][] = [];
  const delivery = new SupabaseDatabaseDelivery({
    approved: {},
    migrations: [migration],
    receiptId: "https://github.com/toy-crane/flyn/actions/runs/123",
    run: (args) => {
      commands.push(args);
      return Promise.resolve(
        JSON.stringify({
          migrations: [{ local: migration.version, remote: "" }],
        })
      );
    },
    sha: request.sha,
  });
  await expect(delivery.start(request)).rejects.toThrow("검토한 SQL");
  expect(commands).toEqual([
    ["migration", "list", "--linked", "--output-format", "json"],
  ]);
});

test("빈 로컬 이력을 원격 DB 배포 완료로 해석하지 않는다", () => {
  expect(
    () =>
      new SupabaseDatabaseDelivery({
        approved: {},
        migrations: [],
        receiptId: "https://github.com/toy-crane/flyn/actions/runs/123",
        run: () => Promise.resolve("{}"),
        sha: request.sha,
      })
  ).toThrow("마이그레이션");
});

test("체크아웃과 다른 SHA로 운영 DB를 연결하지 않는다", () => {
  expect(() =>
    loadDatabaseDelivery({ receiptId: "test", sha: "0".repeat(40) })
  ).toThrow("체크아웃");
});

for (const history of [
  {},
  { migrations: [] },
  { migrations: [{ local: "", remote: "20990101000000" }] },
]) {
  test(`불완전한 원격 이력을 배포 완료로 기록하지 않는다: ${JSON.stringify(history)}`, async () => {
    const delivery = new SupabaseDatabaseDelivery({
      approved: { [migration.version]: migration.hash },
      migrations: [migration],
      receiptId: "fixture",
      run: () => Promise.resolve(JSON.stringify(history)),
      sha: request.sha,
    });
    await expect(delivery.inspect(request)).rejects.toThrow();
  });
}

test("CLI 성공만으로 완료 처리하지 않고 미적용 이력을 대기로 남긴다", async () => {
  let pushes = 0;
  const delivery = new SupabaseDatabaseDelivery({
    approved: { [migration.version]: migration.hash },
    migrations: [migration],
    receiptId: "fixture",
    run: (args) => {
      if (args[0] === "db") {
        pushes += 1;
      }
      return Promise.resolve(
        JSON.stringify({
          migrations: [{ local: migration.version, remote: "" }],
        })
      );
    },
    sha: request.sha,
  });
  expect((await delivery.start(request)).status).toBe("pending");
  expect((await delivery.inspect(request)).status).toBe("pending");
  expect(pushes).toBe(1);
});
