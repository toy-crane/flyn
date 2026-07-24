// 런타임 미실행, tsc만 검사한다. 계약이 조용히 any로 무너지는 걸 잡는 게 목적이다
// (워크스페이스 간 hono 버전이 어긋나면 그렇게 된다).
import type { InferResponseType } from "hono/client";
import { rpc } from "./rpc";

type Stats = InferResponseType<
  (typeof rpc.server)["scratch-notes"]["stats"]["$get"],
  200
>;

async function _contract() {
  const res = await rpc.server["scratch-notes"].stats.$get();

  if (res.ok) {
    const body: Stats = await res.json();

    // @ts-expect-error nope 필드는 stats 응답에 없다
    const { nope } = body;

    return nope;
  }

  // @ts-expect-error 존재하지 않는 RPC 라우트
  await rpc.does.not.exist.$get();

  return null;
}

export { _contract };
