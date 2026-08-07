# 모델 호출의 재시도와 운영 경계

## Decisions

- 같은 사용자 메시지에 `complete` 응답이 있으면 저장된 응답을 재생한다.
  `stopped` 응답은 완성본으로 재생하지 않고 새 모델 호출을 시작한다.
- 모델·전송·timeout 오류 뒤에도 사용자 메시지는 남는다. 재시도 시 실패한 부분 AI
  응답을 화면과 DB에서 제거하고 같은 사용자 메시지로 새 호출을 시작한다.
- 사용자가 직접 중단한 부분 응답은 `stopped`로 보존하며 오류 UI를 띄우지 않는다.
- 첫 content 대기, chunk 사이, 전체 호출 시간과 출력 token 수에 모두 상한을 둔다.
  상한 값은 API 코드가 소유하며 운영 분포에 따라 조정할 수 있다.
- 출력 상한에 도달하면 받은 내용까지 보존하고 자동으로 이어 쓰지 않는다.
- **한 요청 안의 곁가지 모델 호출은 주 응답을 막지 않는다.** 곁가지가 실패해도
  주 응답은 그대로 완료되고 저장된다.
- 모델 호출 시도마다 request ID, 역할, model, duration, finish reason, 결과와
  token usage를 구조화 로그 한 건으로 남긴다. 한 요청이 여러 모델을 부르면
  호출마다 남긴다.
- 사용자·AI 본문, system prompt, 이메일, authorization header와 secret은 로그에
  남기지 않는다.
- generation ID나 실행 이력 테이블은 만들지 않고 Vercel 구조화 로그부터 사용한다.

## Why

중단된 부분 응답을 정상 완료처럼 재생하면 사용자는 같은 불완전한 답만 반복해서
받는다. 호출과 출력에 상한이 없으면 모바일 요청과 저장 경계가 무기한 열리고,
본문 로그는 운영 관측보다 개인정보 위험이 크다.

곁가지 호출을 주 응답과 묶으면 작은 실패가 대화 전체를 멈춘다. 대화가 계속
굴러가는 것이 곁가지 결과보다 중요하므로 실패를 격리한다.

## Boundaries

- 모바일은 마지막 사용자 메시지 ID와 본문만 보내고 서버가 과거 기록을 DB에서
  읽는다.
- user·assistant 메시지 쓰기와 idempotency는 인증된 Hono stream이 소유한다.
- 모델은 AI SDK와 Gateway를 통하며 역할별 모델 ID는 코드에 고정한다.
- 곁가지 호출이 실패했을 때 화면에 무엇을 보일지는 이 계약이 정하지 않는다.
  [스트리밍 대화 계약](ai-chat-experience.md)이 소유한다.
- context compaction, 사용자별 rate limit과 과금은 아직 이 계약의 범위가 아니다.

## Reconsider when

같은 질문의 여러 답변 보관, resumable/background generation, 사용자별 quota,
긴 대화 context 관리 또는 전용 observability가 제품·운영 요구가 되면 generation
실행 모델을 다시 설계한다.

## Still-rejected alternatives

- `stopped` 응답을 complete 응답처럼 replay하기.
- 오류 때 사용자 메시지까지 삭제하거나, 자동으로 무제한 재시도하기.
- 곁가지 모델 호출의 실패로 주 응답을 함께 실패시키기.
- 대화 본문과 secret을 운영 로그에 남기기.
- 현재 필요 없이 generation history와 전체 OpenTelemetry를 먼저 도입하기.

## Evidence worth preserving

generation 실행 상태를 별도로 저장하지 않으므로 AI 메시지 저장 전에 같은 요청이
동시에 도착하면 모델 호출이 중복될 수 있다. 긴 대화는 context 한도를 넘을 수
있다. 둘 다 실제 운영 요구가 생길 때 확장하는 것으로 받아들인 경계다.
