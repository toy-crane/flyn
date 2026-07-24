// 컴파일 타임 RPC 계약 테스트 (DoD #6). 파일명이 `.test`가 아니라 jest는 무시하고,
// tsc(turbo run typecheck)만 검사한다. 계약이 어긋나면 typecheck가 실패한다.
// 런타임에서 호출되지 않는다 — 타입만 존재한다.
import { rpc } from "./rpc";

async function _contract() {
  const res = await rpc.server["scratch-notes"].stats.$get();

  if (res.ok) {
    const body = await res.json();

    // 존재하는 응답 필드는 이 형태와 타입이 맞아야 한다.
    const shape: {
      you: string | null;
      totalNotes: number;
      distinctOwners: number;
    } = body;

    // @ts-expect-error nope 필드는 stats 응답에 없다
    const { nope } = body;

    return { nope, shape };
  }

  // @ts-expect-error 존재하지 않는 RPC 라우트
  await rpc.does.not.exist.$get();

  return null;
}

export { _contract };
