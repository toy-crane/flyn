# API 런타임과 배포

## Decisions

- 서버 API는 Hono를 Node 런타임의 Vercel Function으로 배포한다.
- 모바일과 API는 Hono RPC(`hc`)로 요청·응답 타입을 공유한다.
- API는 AI 스트리밍과 server secret이 필요한 로직만 맡고 일반 CRUD를 복제하지
  않는다.

## Why

Hono는 작은 인증·스트리밍 경계를 유지하면서 모바일과 타입 계약을 공유할 수 있고,
Vercel은 AI 응답 스트리밍을 지원한다. 일반 데이터 접근까지 API로 감싸지 않으면
Supabase RLS의 장점을 보존한다.

## Boundaries

긴 AI 스트림이나 후처리를 추가할 때는 현재 Vercel plan과 Function의
`maxDuration`을 다시 확인한다. 데이터 권한은
[하이브리드 접근 계약](hybrid-data-access.md)이 소유한다.

## Reconsider when

스트리밍 또는 실행 시간 요구가 Vercel Function 경계를 반복해서 넘거나 Hono RPC가
모바일 계약을 유지하지 못할 때 런타임과 배포 대상을 다시 고른다.
