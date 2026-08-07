/**
 * Metro가 CSS 진입을 모듈로 바꿔 Uniwind 런타임에 넣는다 — 타입 세계에서
 * 내보내는 값은 없다. Expo가 같은 선언을 `expo/types`에 두지만 이 앱은
 * tsconfig의 `types`를 jest로 좁혀 두어 그 선언이 닿지 않는다.
 */
declare module "*.css";
