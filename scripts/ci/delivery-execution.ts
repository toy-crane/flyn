export const deliveryServices = ["database", "edge", "api", "mobile"] as const;
export type DeliveryService = (typeof deliveryServices)[number];

export interface DeliveryRequest {
  /** Known remote work for this commit, when the service already reported one. */
  remoteId: string | null;
  /** Traceability only. The commit, not this value, identifies the work. */
  requestId: string;
  service: DeliveryService;
  sha: string;
}

export interface DeliveryObservation {
  remoteId: string | null;
  status: "success" | "failure" | "pending";
}

export interface DeliveryDependencies {
  /** What the service already did with this exact commit. */
  inspect: (request: DeliveryRequest) => Promise<DeliveryObservation>;
  start: (request: DeliveryRequest) => Promise<DeliveryObservation>;
  wait?: (request: DeliveryRequest) => Promise<DeliveryObservation>;
}

/**
 * Delivers one commit to one service without keeping a record of its own. The
 * service answers what it already has, so a lost response resumes the existing
 * remote work instead of starting a second one.
 */
export async function deliverService(
  request: DeliveryRequest,
  dependencies: DeliveryDependencies,
  maxWaits = 60
): Promise<"already" | "delivered"> {
  const found = await dependencies.inspect(request);
  if (found.status === "success") {
    return "already";
  }
  let observation =
    found.status === "pending" && found.remoteId
      ? found
      : await dependencies.start(request);
  for (
    let attempt = 0;
    attempt < maxWaits && observation.status === "pending" && dependencies.wait;
    attempt += 1
  ) {
    // biome-ignore lint/performance/noAwaitInLoops: 원격 실행이 끝날 때까지 순서대로 확인한다.
    observation = await dependencies.wait({
      ...request,
      remoteId: observation.remoteId ?? request.remoteId,
    });
  }
  if (observation.status !== "success") {
    throw new Error(`${request.service} 배포 ${observation.status}`);
  }
  if (!observation.remoteId) {
    throw new Error("배포 결과의 원격 실행 ID를 확인해야 합니다.");
  }
  return "delivered";
}
