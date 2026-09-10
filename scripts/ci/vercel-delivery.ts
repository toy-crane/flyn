import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

export const vercelProject = "prj_nPla0LdaA37WCfo0uai0kuMBkgLC";
export const vercelTeam = "team_dinnDZJN7Ztt45FtgFkAAGad";
const domain = "flyn-api.vercel.app";
const SHA = /^[a-f0-9]{40}$/;
const DEPLOYMENT_ID = /^dpl_[a-zA-Z0-9]+$/;

interface Options {
  api: (path: string) => Promise<unknown>;
  deploy: (request: DeliveryRequest) => Promise<void>;
  probe: () => Promise<boolean>;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class VercelApiDelivery {
  private readonly options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  async start(request: DeliveryRequest): Promise<DeliveryObservation> {
    if (
      request.service !== "api" ||
      !SHA.test(request.sha) ||
      !request.requestId ||
      request.remoteId
    ) {
      throw new Error("새 API 배포 요청이 올바르지 않습니다.");
    }
    await this.options.deploy(request);
    return this.inspect(request);
  }

  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    if (
      request.service !== "api" ||
      !SHA.test(request.sha) ||
      !request.requestId
    ) {
      throw new Error("API 배포 요청이 올바르지 않습니다.");
    }
    const pending: DeliveryObservation = {
      remoteId: request.remoteId,
      status: "pending",
    };
    let { remoteId } = request;
    if (!remoteId) {
      const result = await this.options.api(
        `/v7/deployments?teamId=${vercelTeam}&projectId=${vercelProject}&target=production&limit=100`
      );
      if (!(record(result) && Array.isArray(result.deployments))) {
        throw new Error("Vercel 배포 목록이 불완전합니다.");
      }
      const matches = result.deployments.filter(
        (item: unknown) =>
          record(item) &&
          record(item.meta) &&
          item.meta.flynRequestId === request.requestId
      );
      if (matches.length === 0) {
        return pending;
      }
      if (matches.length !== 1 || typeof matches[0].uid !== "string") {
        throw new Error(
          "같은 요청의 Vercel 배포를 하나로 확인하지 못했습니다."
        );
      }
      remoteId = matches[0].uid;
    }
    if (!(remoteId && DEPLOYMENT_ID.test(remoteId))) {
      throw new Error("Vercel 배포 ID가 올바르지 않습니다.");
    }
    const detail = await this.options.api(
      `/v13/deployments/${remoteId}?teamId=${vercelTeam}`
    );
    if (
      !record(detail) ||
      detail.id !== remoteId ||
      detail.projectId !== vercelProject ||
      detail.target !== "production" ||
      !record(detail.meta) ||
      detail.meta.flynRequestId !== request.requestId ||
      detail.meta.flynCommitSHA !== request.sha
    ) {
      throw new Error("Vercel 배포 대상이 요청과 다릅니다.");
    }
    if (detail.readyState === "ERROR" || detail.readyState === "CANCELED") {
      return { remoteId, status: "failure" };
    }
    if (detail.readyState !== "READY") {
      return { remoteId, status: "pending" };
    }
    const live = await this.options.api(
      `/v13/deployments/${domain}?teamId=${vercelTeam}`
    );
    if (
      !record(live) ||
      live.id !== remoteId ||
      !(await this.options.probe())
    ) {
      return { remoteId, status: "pending" };
    }
    return { remoteId, status: "success" };
  }
}
