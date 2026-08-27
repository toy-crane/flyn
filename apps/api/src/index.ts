import { createApp } from "./app";

/**
 * 첫 글자가 오기까지 기다려 주는 시간. 초 단위다.
 *
 * Bun은 10초 동안 오간 바이트가 없는 요청을 스스로 끊는다. 모델이 긴 장면을
 * 쓰기 시작하기까지는 그보다 오래 걸릴 수 있고, 그렇게 끊긴 응답은 오류가
 * 아니라 빈 장면으로 앱에 도착한다. 사용자에게는 상대가 아무 말도 하지 않은
 * 것처럼 보인다. 스트리밍이 시작된 뒤에는 조각이 계속 흐르므로, 이 값은
 * 사실상 첫 글자를 기다리는 한도다.
 */
const IDLE_TIMEOUT_SECONDS = 120;

/**
 * The deployed server. Vercel and Bun both take a default export whose `fetch`
 * answers requests, which is what a Hono app already provides.
 */
const app = createApp();

export default {
  fetch: app.fetch,
  idleTimeout: IDLE_TIMEOUT_SECONDS,
};
