# API는 Vercel 위의 Hono

Hono 앱을 Vercel에 무설정 배포한다(Node 런타임, Fluid compute). 스트리밍
지원은 확인됐다 — AI 응답을 토큰 단위로 흘려보내는 것이 이 API의 존재
이유라 이것이 선택의 전제였다.

앱 ↔ API 통신은 Hono RPC(`hc`)로 타입을 공유한다.

API가 맡는 범위는 좁다. 일반 CRUD는 앱이 Supabase에 직접 가고, **AI·서버 전용
로직만** 이 API를 거친다 — 근거는 [hybrid-data-access](hybrid-data-access.md).

## 아는 한도

Vercel 함수 시간 한도는 Fluid 기본 300초다(Hobby 최대 300초, Pro 800초).
긴 AI 스트림·후처리는 `maxDuration` 설정을 확인해야 한다.
