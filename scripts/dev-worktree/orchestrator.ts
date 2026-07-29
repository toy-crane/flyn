import type { RuntimeReservation } from "./allocator";
import type { DevelopmentServices } from "./supervisor";

interface RuntimeSessionOptions {
  closeSimulator: () => Promise<void>;
  launchServices: () => Promise<DevelopmentServices>;
  onCleanupError?: (error: unknown) => void;
  openSimulator: () => Promise<void>;
  reservation: RuntimeReservation;
  waitForSignal: () => Promise<NodeJS.Signals>;
}

export async function runRuntimeSession(options: RuntimeSessionOptions) {
  let services: DevelopmentServices | undefined;
  let simulatorOpeningStarted = false;
  const reportCleanupError = options.onCleanupError ?? (() => undefined);
  const cleanUp = async (operation: () => Promise<void>) => {
    try {
      await operation();
    } catch (error) {
      reportCleanupError(error);
    }
  };

  try {
    services = await options.launchServices();
    simulatorOpeningStarted = true;
    await options.openSimulator();
    await Promise.race([services.waitForFailure(), options.waitForSignal()]);
  } finally {
    if (services) {
      await cleanUp(services.stop);
    }

    if (simulatorOpeningStarted) {
      await cleanUp(options.closeSimulator);
    }

    await cleanUp(options.reservation.release);
  }
}
