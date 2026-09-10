import { expect, test } from "bun:test";
import { lastSuccessfulSha } from "./base-commit";

const first = "1".repeat(40);
const second = "2".repeat(40);

function respond(runs: unknown[], ok = true) {
  return () =>
    Promise.resolve({
      json: () => Promise.resolve({ workflow_runs: runs }),
      ok,
      status: ok ? 200 : 500,
    } as Response);
}

const options = {
  known: () => true,
  runId: "99",
  workflow: "ci.yml",
};

test("마지막 성공한 main 실행의 커밋을 기준으로 삼는다", async () => {
  await expect(
    lastSuccessfulSha({
      ...options,
      fetch: respond([
        { head_branch: "main", head_sha: second, id: 12 },
        { head_branch: "main", head_sha: first, id: 11 },
      ]),
    })
  ).resolves.toBe(second);
});

test("성공한 실행이 없으면 기준 커밋이 없다", async () => {
  await expect(
    lastSuccessfulSha({ ...options, fetch: respond([]) })
  ).resolves.toBeNull();
});

test("현재 실행은 기준으로 삼지 않는다", async () => {
  await expect(
    lastSuccessfulSha({
      ...options,
      fetch: respond([
        { head_branch: "main", head_sha: second, id: 99 },
        { head_branch: "main", head_sha: first, id: 11 },
      ]),
    })
  ).resolves.toBe(first);
});

test("다른 브랜치의 실행은 기준으로 삼지 않는다", async () => {
  await expect(
    lastSuccessfulSha({
      ...options,
      fetch: respond([
        { head_branch: "release", head_sha: second, id: 12 },
        { head_branch: "main", head_sha: first, id: 11 },
      ]),
    })
  ).resolves.toBe(first);
});

test("체크아웃에 없는 커밋은 기준으로 삼지 않는다", async () => {
  await expect(
    lastSuccessfulSha({
      ...options,
      fetch: respond([{ head_branch: "main", head_sha: second, id: 12 }]),
      known: () => false,
    })
  ).resolves.toBeNull();
});

test("조회 실패는 조용히 넘어가지 않는다", async () => {
  await expect(
    lastSuccessfulSha({ ...options, fetch: respond([], false) })
  ).rejects.toThrow();
});

test("형식이 다른 커밋은 거절한다", async () => {
  await expect(
    lastSuccessfulSha({
      ...options,
      fetch: respond([{ head_branch: "main", head_sha: "nope", id: 12 }]),
    })
  ).rejects.toThrow();
});
