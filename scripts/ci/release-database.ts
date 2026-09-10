import { spawnSync } from "bun";
import { loadDatabaseDelivery } from "./database-delivery";
import { executeDelivery } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";
import { requireApiDatabase } from "./release-api";
import { requireReleaseChecks } from "./release-checks";

const SHA = /^[a-f0-9]{40}$/;
const RUN_ID = /^\d+$/;

async function main() {
  const {
    DEPLOYMENT_STATE_SIGNING_KEY: signingKey,
    GITHUB_SHA: sha,
    GH_TOKEN: token,
    GITHUB_RUN_ID: runId,
  } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !token ||
    !runId ||
    !RUN_ID.test(runId) ||
    !signingKey
  ) {
    throw new Error("Flyn main의 GitHub 실행에서만 DB를 배포합니다.");
  }
  await requireReleaseChecks(sha, token);
  const database = loadDatabaseDelivery({
    receiptId: `https://github.com/toy-crane/flyn/actions/runs/${runId}`,
    sha,
  });
  const journal = new GitHubDeliveryJournal(token, signingKey);
  const initial = await journal.read();
  if (
    initial.state.pending &&
    initial.state.pending.service !== "database" &&
    initial.state.pending.sha === sha
  ) {
    requireApiDatabase(initial.state.success.database, sha);
    const observed = await database.inspect({
      remoteId: null,
      requestId: `resume-${runId}`,
      service: "database",
      sha,
    });
    if (observed.status !== "success") {
      throw new Error("후속 배포 재확인 전에 DB 적용 이력이 필요합니다.");
    }
    console.log(
      "DB 적용을 확인했습니다. 기존 후속 요청을 다음 단계에서 조회합니다."
    );
    return;
  }
  if (initial.state.pending && initial.state.pending.service !== "database") {
    throw new Error("기존 서비스 배포를 먼저 확인해야 합니다.");
  }
  await executeDelivery(sha, {
    journal,
    plan: async (state) => {
      const base = state.success.database;
      if (base) {
        const ancestor = spawnSync([
          "git",
          "merge-base",
          "--is-ancestor",
          base,
          sha,
        ]);
        if (ancestor.exitCode !== 0) {
          throw new Error("DB 성공 커밋보다 이전 버전은 배포하지 않습니다.");
        }
        const diff = spawnSync([
          "git",
          "diff",
          "--quiet",
          base,
          sha,
          "--",
          "supabase/migrations",
        ]);
        if (diff.exitCode === 0) {
          return [];
        }
        if (diff.exitCode !== 1) {
          throw new Error("DB 변경 확인 실패");
        }
      }
      // Reject unapproved SQL before saving a remote intent; no request has started yet.
      await database.prepare({
        remoteId: null,
        requestId: `preflight-${runId}`,
        service: "database",
        sha,
      });
      return ["database"];
    },
    remote: {
      inspect: (request) => database.inspect(request),
      start: (request) => database.start(request),
    },
  });
  console.log(
    `DB 단계 확인 완료: ${sha}. API·모바일 배포 완료를 뜻하지 않습니다.`
  );
}

if (import.meta.main) {
  await main();
}
