import { createHmac, timingSafeEqual } from "node:crypto";
import {
  type DeliveryJournal,
  type DeliveryState,
  deliveryServices,
} from "./delivery-execution";

const SHA = /^[a-f0-9]{40}$/;
const SIGNATURE = /^[a-f0-9]{64}$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sha(value: unknown): value is string {
  return typeof value === "string" && SHA.test(value);
}

function request(value: unknown) {
  return (
    record(value) &&
    sha(value.sha) &&
    deliveryServices.some((service) => service === value.service) &&
    typeof value.requestId === "string" &&
    value.requestId.length > 0 &&
    (value.remoteId === null ||
      (typeof value.remoteId === "string" && value.remoteId.length > 0))
  );
}

function parseState(value: unknown): DeliveryState {
  if (!record(value) || value.version !== 1 || !record(value.success)) {
    throw new Error("배포 기록 형식이 올바르지 않습니다.");
  }
  const { success } = value;
  if (
    value.lastResult !== undefined &&
    !(
      request(value.lastResult) &&
      record(value.lastResult) &&
      ["success", "failure"].includes(String(value.lastResult.status))
    )
  ) {
    throw new Error("배포 결과 형식이 올바르지 않습니다.");
  }
  if (
    !(
      deliveryServices.every(
        (service) => success[service] === null || sha(success[service])
      ) &&
      (value.pending === null || request(value.pending))
    )
  ) {
    throw new Error("배포 기록 형식이 올바르지 않습니다.");
  }
  return value as unknown as DeliveryState;
}

function sign(state: DeliveryState, key: string) {
  return createHmac("sha256", key).update(JSON.stringify(state)).digest("hex");
}

export function serializeSignedDeliveryState(
  state: DeliveryState,
  key: string
) {
  parseState(state);
  if (key.length < 32) {
    throw new Error("배포 기록 서명 키가 올바르지 않습니다.");
  }
  return JSON.stringify({ signature: sign(state, key), state, version: 1 });
}

function parseSignedState(value: unknown, key: string) {
  if (
    key.length < 32 ||
    !record(value) ||
    value.version !== 1 ||
    !record(value.state) ||
    typeof value.signature !== "string" ||
    !SIGNATURE.test(value.signature)
  ) {
    throw new Error("배포 기록 서명 형식이 올바르지 않습니다.");
  }
  const expected = Buffer.from(
    sign(value.state as unknown as DeliveryState, key)
  );
  const actual = Buffer.from(value.signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("배포 기록 서명이 일치하지 않습니다.");
  }
  return parseState(value.state);
}

/** GitHub keeps each state change in Git history, outside the deployable branch. */
export class GitHubDeliveryJournal implements DeliveryJournal {
  private readonly token: string;
  private readonly signingKey: string;
  private readonly endpoint: string;
  private readonly branch: string;

  constructor(
    token: string,
    signingKey: string,
    apiUrl = "https://api.github.com",
    branch = "deployment-state"
  ) {
    if (signingKey.length < 32) {
      throw new Error("배포 기록 서명 키가 올바르지 않습니다.");
    }
    this.token = token;
    this.signingKey = signingKey;
    this.endpoint = `${apiUrl}/repos/toy-crane/flyn/contents/state.json`;
    this.branch = branch;
  }

  private async request(url: string, init?: RequestInit) {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(
        `배포 기록 요청 실패 (${response.status}). 자동 재요청하지 않습니다.`
      );
    }
    return response.json();
  }

  async read() {
    const file = await this.request(
      `${this.endpoint}?ref=${encodeURIComponent(this.branch)}`
    );
    if (
      !record(file) ||
      file.type !== "file" ||
      file.encoding !== "base64" ||
      !sha(file.sha) ||
      typeof file.content !== "string" ||
      file.content.length > 100_000
    ) {
      throw new Error("배포 기록 파일 형식이 올바르지 않습니다.");
    }
    const state = parseSignedState(
      JSON.parse(Buffer.from(file.content, "base64").toString()),
      this.signingKey
    );
    return { revision: file.sha as string, state };
  }

  async write(revision: string, state: DeliveryState) {
    if (!sha(revision)) {
      throw new Error("배포 기록 SHA 형식이 올바르지 않습니다.");
    }
    parseState(state);
    const result = await this.request(this.endpoint, {
      body: JSON.stringify({
        branch: this.branch,
        content: Buffer.from(
          serializeSignedDeliveryState(state, this.signingKey)
        ).toString("base64"),
        message: "chore: 내부 배포 상태를 기록한다",
        sha: revision,
      }),
      method: "PUT",
    });
    if (
      !(record(result) && record(result.content) && sha(result.content.sha))
    ) {
      throw new Error(
        "배포 기록 응답 형식이 올바르지 않습니다. 원격 상태를 다시 확인해야 합니다."
      );
    }
    return result.content.sha;
  }
}
