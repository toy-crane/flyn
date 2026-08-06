import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EpisodeRoles,
  EpisodeRoleTarget,
  EpisodeScenario,
} from "./episode-draft";
import { queryKeys } from "./query-keys";
import { rpc } from "./rpc";

/**
 * 생성은 두 번 부른다 — ① 상황 후보, ② 선택한 상황의 역할과 목표. 재생성은
 * 해당 부분만 다시 부르므로 역할·목표 호출이 따로 있다. 앱에는 에피소드를 쓸
 * 권한이 없어 저장도 이 경계를 지난다.
 */

const GENERIC_ERROR = "잠시 후 다시 시도해 주세요.";

async function readResult<T>(response: {
  json: () => Promise<unknown>;
  ok: boolean;
}): Promise<T> {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;

  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string" ? body.error : GENERIC_ERROR
    );
  }

  return body as T;
}

export async function generateScenarios(
  excluded: string[]
): Promise<EpisodeScenario[]> {
  const response = await rpc.episodes.scenarios.$post({ json: { excluded } });
  const { scenarios } = await readResult<{ scenarios: EpisodeScenario[] }>(
    response
  );

  return scenarios;
}

export async function generateDraft(
  scenario: EpisodeScenario
): Promise<EpisodeRoles & { goals: string[] }> {
  const response = await rpc.episodes.draft.$post({ json: { scenario } });

  return await readResult<EpisodeRoles & { goals: string[] }>(response);
}

export async function generateRole({
  roles,
  scenario,
  target,
}: {
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
  target: EpisodeRoleTarget;
}): Promise<string> {
  const response = await rpc.episodes.draft.role.$post({
    json: { ...roles, scenario, target },
  });
  const { role } = await readResult<{ role: string }>(response);

  return role;
}

export async function generateGoals({
  excluded,
  roles,
  scenario,
}: {
  excluded: string[];
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
}): Promise<string[]> {
  const response = await rpc.episodes.draft.goals.$post({
    json: { ...roles, excluded, scenario },
  });
  const { goals } = await readResult<{ goals: string[] }>(response);

  return goals;
}

export async function saveEpisode({
  goals,
  roles,
  scenario,
}: {
  goals: string[];
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
}): Promise<{ id: string }> {
  const response = await rpc.episodes.$post({
    json: { ...roles, goals, scenario },
  });

  return await readResult<{ id: string }>(response);
}

export function useScenarioCandidates() {
  return useMutation({ mutationFn: generateScenarios });
}

export function useEpisodeDraft() {
  return useMutation({ mutationFn: generateDraft });
}

export function useRoleGeneration() {
  return useMutation({ mutationFn: generateRole });
}

export function useGoalGeneration() {
  return useMutation({ mutationFn: generateGoals });
}

export function useSaveEpisode(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveEpisode,
    // 저장은 서버가 했다. 홈은 자기 조회로 새 에피소드를 다시 읽는다.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.episodes(userId) });
    },
  });
}
