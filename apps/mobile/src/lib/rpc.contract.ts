// 런타임 미실행, tsc만 검사한다. 계약이 조용히 any로 무너지는 걸 잡는 게 목적이다
// (워크스페이스 간 hono 버전이 어긋나면 그렇게 된다).
import type { InferResponseType } from "hono/client";
import { rpc } from "./rpc";

type AccountDeletion = InferResponseType<(typeof rpc.account)["$delete"], 200>;

async function _contract() {
  const res = await rpc.account.$delete();

  if (res.ok) {
    const body: AccountDeletion = await res.json();

    // @ts-expect-error nope 필드는 계정 삭제 응답에 없다
    const { nope } = body;

    return nope;
  }

  // @ts-expect-error 존재하지 않는 RPC 라우트
  await rpc.does.not.exist.$get();

  return null;
}

export { _contract };

type ScenarioCandidates = InferResponseType<
  (typeof rpc.episodes.scenarios)["$post"],
  200
>;

async function _episodeContract() {
  const res = await rpc.episodes.scenarios.$post({ json: { excluded: ["a"] } });

  if (res.ok) {
    const body: ScenarioCandidates = await res.json();

    // @ts-expect-error 상황 후보 응답에는 goals가 없다
    const { goals } = body;

    return goals;
  }

  return null;
}

export { _episodeContract };
