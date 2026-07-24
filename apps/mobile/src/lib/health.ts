/**
 * 로컬 개발에서는 `.env.local`이 없어도 Hono 기본 포트를 바라본다.
 * EAS 빌드·배포본에서는 `EXPO_PUBLIC_API_URL`을 반드시 주입한다.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export interface Health {
  service: string;
  status: string;
  time: string;
}

export type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; health: Health }
  | { kind: "error"; message: string };

export async function fetchHealth(signal?: AbortSignal): Promise<Health> {
  const res = await fetch(`${API_BASE_URL}/health`, { signal });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return (await res.json()) as Health;
}
