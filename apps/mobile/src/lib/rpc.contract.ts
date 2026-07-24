// 컴파일 타임 RPC 계약 테스트 (DoD #6): 런타임 미실행, tsc만 검사. 계약이 어긋나면 실패.
import { rpc } from "./rpc";

async function _contract() {
  const res = await rpc.server["scratch-notes"].stats.$get();

  if (res.ok) {
    const body = await res.json();

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
