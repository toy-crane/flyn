import { expect, test } from "bun:test";
import {
  loadDatabaseDelivery,
  SupabaseDatabaseDelivery,
} from "./database-delivery";

const version = "20260909123219";
const request = {
  remoteId: null,
  requestId: "test-request",
  service: "database" as const,
  sha: "b".repeat(40),
};

test("빈 로컬 이력을 원격 DB 배포 완료로 해석하지 않는다", () => {
  expect(
    () =>
      new SupabaseDatabaseDelivery({
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
      migrations: [version],
      receiptId: "fixture",
      run: () => Promise.resolve(JSON.stringify(history)),
      sha: request.sha,
    });
    await expect(delivery.inspect(request)).rejects.toThrow();
  });
}

test("미적용 마이그레이션이 있으면 별도 조건 없이 적용한다", async () => {
  let pushes = 0;
  const delivery = new SupabaseDatabaseDelivery({
    migrations: [version],
    receiptId: "fixture",
    run: (args) => {
      if (args[0] === "db") {
        pushes += 1;
      }
      return Promise.resolve(
        JSON.stringify({ migrations: [{ local: version, remote: "" }] })
      );
    },
    sha: request.sha,
  });
  // The protected environment already gated this run, so nothing in the
  // repository has to authorize the SQL a second time.
  expect((await delivery.start(request)).status).toBe("pending");
  expect((await delivery.inspect(request)).status).toBe("pending");
  expect(pushes).toBe(1);
});

test("적용을 마치면 성공으로 보고하고 다시 밀지 않는다", async () => {
  let pushes = 0;
  const delivery = new SupabaseDatabaseDelivery({
    migrations: [version],
    receiptId: "https://github.com/toy-crane/flyn/actions/runs/123",
    run: (args) => {
      if (args[0] === "db") {
        pushes += 1;
      }
      return Promise.resolve(
        JSON.stringify({
          migrations: [{ local: version, remote: pushes > 0 ? version : "" }],
        })
      );
    },
    sha: request.sha,
  });
  expect(await delivery.start(request)).toEqual({
    remoteId: "https://github.com/toy-crane/flyn/actions/runs/123",
    status: "success",
  });
  expect(pushes).toBe(1);
  expect((await delivery.start(request)).status).toBe("success");
  expect(pushes).toBe(1);
});

test("적용하지 않은 마이그레이션은 진행 중 요청으로 보고하지 않는다", async () => {
  const delivery = new SupabaseDatabaseDelivery({
    migrations: ["20260101000000"],
    receiptId: "https://github.com/toy-crane/flyn/actions/runs/1",
    run: () =>
      Promise.resolve(
        JSON.stringify({
          migrations: [{ local: "20260101000000", remote: "" }],
        })
      ),
    sha: "a".repeat(40),
  });
  // A null remoteId is what tells the caller to start the push.
  expect(
    await delivery.inspect({
      remoteId: null,
      requestId: "receipt",
      service: "database",
      sha: "a".repeat(40),
    })
  ).toEqual({ remoteId: null, status: "pending" });
});
