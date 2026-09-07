import { isIPv4 } from "node:net";
import { networkInterfaces } from "node:os";

export interface LanAddress {
  address: string;
  name: string;
}

const LAN_INTERFACE = /^(en\d+|eth\d+|wlan\d+|wl\w+|Ethernet|Wi-Fi)$/;

function usableAddress(address: string): boolean {
  const first = Number(address.split(".")[0]);
  return (
    isIPv4(address) &&
    first > 0 &&
    first < 224 &&
    first !== 127 &&
    !address.startsWith("169.254.")
  );
}

/** Only select an unambiguous local interface; never guess between VPN and Wi-Fi. */
export function selectLanHost(
  addresses: LanAddress[],
  explicit?: string
): string {
  if (explicit !== undefined) {
    if (
      !(
        usableAddress(explicit) &&
        addresses.some((entry) => entry.address === explicit)
      )
    ) {
      throw new Error(
        "--host에는 이 Mac에 배정된 LAN IPv4 주소를 지정해 주세요."
      );
    }
    return explicit;
  }
  const candidates = [
    ...new Set(
      addresses
        .filter(
          (entry) =>
            LAN_INTERFACE.test(entry.name) && usableAddress(entry.address)
        )
        .map((entry) => entry.address)
    ),
  ];
  const [candidate] = candidates;
  if (candidates.length !== 1 || !candidate) {
    throw new Error(
      `LAN 주소를 하나로 정할 수 없습니다 (${candidates.join(", ") || "후보 없음"}). Wi-Fi 연결을 확인하거나 --physical --host <Mac의 LAN IPv4>로 지정해 주세요.`
    );
  }
  return candidate;
}

function readLanAddresses(): LanAddress[] {
  return Object.entries(networkInterfaces()).flatMap(([name, entries]) =>
    (entries ?? [])
      .filter((entry) => entry.family === "IPv4" && !entry.internal)
      .map((entry) => ({ address: entry.address, name }))
  );
}

/** Preserve an explicit selection when a virtual target joins an existing LAN session. */
export function selectSessionLanHost(
  addresses: LanAddress[],
  physical: boolean,
  explicit?: string,
  previous?: string
): string | undefined {
  if (physical) {
    return selectLanHost(addresses, explicit);
  }
  if (!previous) {
    return;
  }
  try {
    return selectLanHost(addresses, previous);
  } catch {
    // Losing Wi-Fi must not prevent the existing simulator/emulator workflow.
    try {
      return selectLanHost(addresses);
    } catch {
      // No usable LAN remains; the virtual-only session uses loopback.
    }
  }
}

export function sessionLanHost(
  physical: boolean,
  explicit?: string,
  previous?: string
): string | undefined {
  return selectSessionLanHost(readLanAddresses(), physical, explicit, previous);
}

export async function verifyLanServers(
  host: string | undefined,
  api: number,
  metro: number,
  supabase: number
): Promise<void> {
  if (!host) {
    return;
  }
  const results = await Promise.allSettled(
    (
      [
        ["API", api, "/health"],
        ["Metro", metro, "/status"],
        ["Supabase", supabase, "/auth/v1/health"],
      ] as const
    ).map(async ([name, port, path]) => {
      try {
        const response = await fetch(`http://${host}:${port}${path}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        throw new Error(
          `${name}의 LAN 주소 http://${host}:${port}에 연결하지 못했습니다. 서버 수신 주소와 방화벽을 확인해 주세요.`,
          { cause: error }
        );
      }
    })
  );
  const errors = results.flatMap((result) =>
    result.status === "rejected" ? [String(result.reason)] : []
  );
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
}
