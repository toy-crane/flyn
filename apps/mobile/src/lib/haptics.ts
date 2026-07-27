import { NotificationFeedbackType, notificationAsync } from "expo-haptics";

/**
 * 네이티브 감각의 상당 부분이 여기서 온다. 인증 결과에만 쓴다 — 아무 데나 붙이면
 * 신호가 아니라 소음이 된다.
 *
 * `useAuthAction` 안에 넣지 않았다. 그 훅은 네이티브 import가 없는 채로 테스트되고,
 * 넣으면 모든 소비자 테스트가 네이티브 목을 요구하게 된다.
 *
 * 실패를 삼키는 이유는 Taptic Engine이 없는 기기에서 promise가 reject되기
 * 때문이다. 실패 경로에서 unhandled rejection을 만드는 것은 나쁜 거래다.
 */

export function authFailedFeedback() {
  notificationAsync(NotificationFeedbackType.Error).catch(() => {
    // 진동이 안 되는 것으로 로그인 흐름을 막지 않는다.
  });
}

export function authSucceededFeedback() {
  notificationAsync(NotificationFeedbackType.Success).catch(() => {
    // 위와 같다.
  });
}
