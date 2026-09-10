import type {
  DeliveryObservation,
  DeliveryRequest,
} from "./delivery-execution";

interface EdgeOptions {
  deploy: (request: DeliveryRequest) => Promise<void>;
  inspect: (request: DeliveryRequest) => Promise<string | null>;
  probe: () => Promise<boolean>;
  sha: string;
}

export class SupabaseEdgeDelivery {
  private readonly options: EdgeOptions;
  constructor(options: EdgeOptions) {
    this.options = options;
  }

  private validate(request: DeliveryRequest) {
    if (request.service !== "edge" || request.sha !== this.options.sha) {
      throw new Error("Edge 배포 요청과 체크아웃이 다릅니다.");
    }
  }

  async inspect(request: DeliveryRequest): Promise<DeliveryObservation> {
    this.validate(request);
    const remoteId = await this.options.inspect(request);
    return {
      remoteId: remoteId ?? request.remoteId,
      status: remoteId && (await this.options.probe()) ? "success" : "pending",
    };
  }

  async start(request: DeliveryRequest) {
    this.validate(request);
    await this.options.deploy(request);
    return this.inspect(request);
  }
}
