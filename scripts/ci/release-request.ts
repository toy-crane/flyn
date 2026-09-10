const SHA = /^[a-f0-9]{40}$/;
const RUN_ID = /^\d+$/;

export interface ReleaseRequest {
  /** The GitHub run this deploy belongs to. Traceability, never identity. */
  receiptId: string;
  runId: string;
  sha: string;
}

/**
 * Every deploy stage runs from Flyn's own `main` workflow. Ordering across
 * stages comes from the run's `needs` chain, not from a stored record.
 */
export function releaseRequest(label: string): ReleaseRequest {
  const { GITHUB_SHA: sha, GITHUB_RUN_ID: runId } = process.env;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "toy-crane/flyn" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !sha ||
    !SHA.test(sha) ||
    !runId ||
    !RUN_ID.test(runId)
  ) {
    throw new Error(`Flyn main의 GitHub 실행에서만 ${label}을 배포합니다.`);
  }
  return {
    receiptId: `https://github.com/toy-crane/flyn/actions/runs/${runId}`,
    runId,
    sha,
  };
}
