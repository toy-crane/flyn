export const deliveryServices = ["database", "edge", "api", "mobile"] as const;
export type DeliveryService = (typeof deliveryServices)[number];

export interface DeliveryRequest {
  remoteId: string | null;
  requestId: string;
  service: DeliveryService;
  sha: string;
}

export interface DeliveryState {
  lastResult?: DeliveryRequest & { status: "success" | "failure" };
  pending: DeliveryRequest | null;
  success: Record<DeliveryService, string | null>;
  version: 1;
}

export interface DeliveryJournal {
  read: () => Promise<{ revision: string; state: DeliveryState }>;
  write: (revision: string, state: DeliveryState) => Promise<string>;
}

export interface DeliveryObservation {
  remoteId: string | null;
  status: "success" | "failure" | "pending";
}

interface DeliveryDependencies {
  journal: DeliveryJournal;
  plan: (state: DeliveryState) => Promise<DeliveryService[]>;
  remote: {
    start: (request: DeliveryRequest) => Promise<DeliveryObservation>;
    inspect: (request: DeliveryRequest) => Promise<DeliveryObservation>;
    wait?: (request: DeliveryRequest) => Promise<DeliveryObservation>;
  };
}

export async function executeDelivery(
  sha: string,
  dependencies: DeliveryDependencies
) {
  const { journal, remote } = dependencies;
  const snapshot = await journal.read();
  let { revision } = snapshot;
  const { state } = snapshot;
  if (state.pending && state.pending.sha !== sha) {
    throw new Error("이전 커밋의 배포를 먼저 확인해야 합니다.");
  }
  async function observe(
    request: DeliveryRequest,
    observation: DeliveryObservation,
    wait = false
  ): Promise<void> {
    if (observation.status !== "pending" && !observation.remoteId) {
      throw new Error("배포 결과의 원격 실행 ID를 확인해야 합니다.");
    }
    if (observation.status !== "pending") {
      state.lastResult = {
        ...request,
        remoteId: observation.remoteId,
        status: observation.status,
      };
    }
    if (observation.status === "success") {
      state.success[request.service] = request.sha;
      state.pending = null;
    } else if (observation.status === "failure") {
      state.pending = null;
    } else {
      state.pending = {
        ...request,
        remoteId: observation.remoteId ?? request.remoteId,
      };
    }
    revision = await journal.write(revision, state);
    if (
      wait &&
      observation.status === "pending" &&
      state.pending &&
      remote.wait
    ) {
      return observe(state.pending, await remote.wait(state.pending));
    }
    if (observation.status !== "success") {
      throw new Error(`${request.service} 배포 ${observation.status}`);
    }
  }
  if (state.pending) {
    await observe(state.pending, await remote.inspect(state.pending));
  }
  const selected = await dependencies.plan(state);
  for (const service of deliveryServices) {
    if (!selected.includes(service) || state.success[service] === sha) {
      continue;
    }
    const request: DeliveryRequest = {
      remoteId: null,
      requestId: crypto.randomUUID(),
      service,
      sha,
    };
    state.pending = request;
    // biome-ignore lint/performance/noAwaitInLoops: 배포 요청 전에 원격 기록을 먼저 저장해야 한다.
    revision = await journal.write(revision, state);
    await observe(request, await remote.start(request), true);
  }
}
