import { waitUntil } from "@vercel/functions";

/**
 * 응답을 보낸 뒤에도 끝까지 돌려야 하는 일을 맡긴다.
 *
 * Vercel은 응답이 나가면 함수를 멈춘다. 사용자를 기다리게 하지 않으면서 끝내야
 * 하는 일은 그래서 런타임에 따로 맡겨야 한다. 배포된 곳 밖에서는 이 호출이
 * 아무 일도 하지 않고, 프로미스는 그대로 돌아간다.
 *
 * 실패는 여기서 삼킨다. 이 자리에 오는 일은 이미 사용자에게 답을 보낸 뒤의
 * 뒷정리라 되돌릴 것이 없고, 아무도 받지 않는 거절은 프로세스를 흔든다.
 */
export function keepWorking(
  handOff: ((work: Promise<unknown>) => void) | undefined,
  work: Promise<unknown>
): void {
  (handOff ?? waitUntil)(work.catch(() => undefined));
}
