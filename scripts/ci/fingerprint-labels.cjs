"use strict";
const LABELS = ["compatible", "changed", "error"];
const HASH = /^[a-f0-9]{40}$/;

async function ensureLabel(github, owner, repo, status) {
  const name = `Fingerprint:${status}`;
  try {
    await github.rest.issues.getLabel({ name, owner, repo });
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
    try {
      await github.rest.issues.createLabel({
        color: { changed: "fbca04", compatible: "0e8a16", error: "d93f0b" }[
          status
        ],
        description:
          "iOS 네이티브 구성 비교. 배포 가능 여부를 보장하지 않습니다.",
        name,
        owner,
        repo,
      });
    } catch (createError) {
      if (createError.status !== 422) {
        throw createError;
      }
      // Another PR can create the same label concurrently. Verify it actually exists.
      await github.rest.issues.getLabel({ name, owner, repo });
    }
  }
}

function compare(result, head, base) {
  if (
    !(
      result &&
      [result.head, result.base, result.headHash, result.baseHash].every(
        (value) => typeof value === "string" && HASH.test(value)
      )
    )
  ) {
    throw new Error("fingerprint 결과 형식이 잘못됐습니다.");
  }
  if (result.head !== head || result.base !== base) {
    return "stale";
  }
  return result.headHash === result.baseHash ? "compatible" : "changed";
}

async function publish(github, target, status) {
  if (![...LABELS, "pending"].includes(status)) {
    throw new Error("알 수 없는 fingerprint 결과입니다.");
  }
  const { owner, repo, number, head, base } = target;
  const { data: pr } = await github.rest.pulls.get({
    owner,
    pull_number: number,
    repo,
  });
  if (pr.state !== "open" || pr.head.sha !== head || pr.base.sha !== base) {
    return false;
  }
  for (const label of LABELS) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: Remove only owned labels before adding the current result.
      await github.rest.issues.removeLabel({
        issue_number: number,
        name: `Fingerprint:${label}`,
        owner,
        repo,
      });
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }
  }
  if (status !== "pending") {
    await ensureLabel(github, owner, repo, status);
    await github.rest.issues.addLabels({
      issue_number: number,
      labels: [`Fingerprint:${status}`],
      owner,
      repo,
    });
  }
  return true;
}

async function readResult(github, owner, repo, runId) {
  const { mkdtempSync, writeFileSync, rmSync } = require("node:fs");
  const { tmpdir } = require("node:os");
  const { join } = require("node:path");
  const { execFileSync } = require("node:child_process");
  const { data } = await github.rest.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: runId,
  });
  const matches = data.artifacts.filter(
    (item) => item.name === "fingerprint-result" && !item.expired
  );
  if (matches.length !== 1 || matches[0].size_in_bytes > 20_000) {
    throw new Error("fingerprint 결과 파일을 확인하지 못했습니다.");
  }
  const archive = await github.rest.actions.downloadArtifact({
    archive_format: "zip",
    artifact_id: matches[0].id,
    owner,
    repo,
  });
  const directory = mkdtempSync(join(tmpdir(), "flyn-fingerprint-"));
  try {
    const path = join(directory, "result.zip");
    writeFileSync(path, Buffer.from(archive.data));
    // Read one bounded entry, never extract paths or execute anything from the PR artifact.
    return JSON.parse(
      execFileSync("unzip", ["-p", path, "result.json"], {
        encoding: "utf8",
        maxBuffer: 16_384,
      })
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

async function resultStatus(github, owner, repo, current, pr, core) {
  let status = "pending";
  if (current.status === "completed") {
    status = "error";
    if (pr.head.repo?.full_name !== `${owner}/${repo}`) {
      core.error(
        "외부 fork의 계산 결과는 신뢰할 수 있는 비교 결과로 게시하지 않습니다."
      );
      return status;
    }
    if (current.conclusion === "success") {
      try {
        status = compare(
          await readResult(github, owner, repo, current.id),
          pr.head.sha,
          pr.base.sha
        );
      } catch {
        core.error("fingerprint 결과를 읽지 못했습니다.");
      }
    }
  }
  return status;
}

async function run({ github, context, core }) {
  const { owner, repo } = context.repo;
  if (context.eventName === "push") {
    if (context.payload.deleted || !context.ref.startsWith("refs/heads/")) {
      return;
    }
    const prs = await github.paginate(github.rest.pulls.list, {
      base: context.ref.slice("refs/heads/".length),
      owner,
      per_page: 100,
      repo,
      state: "open",
    });
    for (const pr of prs) {
      // biome-ignore lint/performance/noAwaitInLoops: Clear stale comparisons without running PR code in this write-enabled job.
      await publish(
        github,
        {
          base: pr.base.sha,
          head: pr.head.sha,
          number: pr.number,
          owner,
          repo,
        },
        "pending"
      );
    }
    return;
  }
  const event = context.payload.workflow_run;
  const { data: current } = await github.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: event.id,
  });
  const { data: workflow } = await github.rest.actions.getWorkflow({
    owner,
    repo,
    workflow_id: "fingerprint.yml",
  });
  if (
    current.event !== "pull_request" ||
    current.workflow_id !== workflow.id ||
    current.run_attempt !== event.run_attempt
  ) {
    return;
  }
  // A delayed event from an earlier run of the same commit must not replace a newer result.
  const { data: recent } = await github.rest.actions.listWorkflowRuns({
    event: "pull_request",
    head_sha: current.head_sha,
    owner,
    per_page: 100,
    repo,
    workflow_id: workflow.id,
  });
  if (recent.workflow_runs.some((item) => item.id > current.id)) {
    return;
  }
  const candidates = current.pull_requests.length
    ? current.pull_requests
    : (
        await github.rest.repos.listPullRequestsAssociatedWithCommit({
          commit_sha: current.head_sha,
          owner,
          repo,
        })
      ).data;
  for (const candidate of candidates) {
    // biome-ignore lint/performance/noAwaitInLoops: Process the associated PRs serially to keep label transitions ordered.
    const { data: pr } = await github.rest.pulls.get({
      owner,
      pull_number: candidate.number,
      repo,
    });
    if (
      pr.head.sha !== current.head_sha ||
      pr.base.repo.full_name !== `${owner}/${repo}` ||
      pr.state !== "open"
    ) {
      continue;
    }
    const status = await resultStatus(github, owner, repo, current, pr, core);
    if (status === "stale") {
      continue;
    }

    await publish(
      github,
      { base: pr.base.sha, head: pr.head.sha, number: pr.number, owner, repo },
      status
    );
    if (status === "error") {
      core.setFailed("fingerprint 계산 실패. 원본 실행을 확인하세요.");
    }
  }
}

module.exports = { compare, publish, run };
