# AI 채팅 구현 계획

이 작업은 여러 태스크로 나누지 않고 한 세션에서 다음 순서로 끝낸다.

1. 채팅방·메시지 선언적 스키마, migration, 생성 타입, RLS pgTAP을 만든다.
2. AI SDK 7과 Gateway를 쓰는 인증된 Hono 스트리밍 엔드포인트를 테스트 우선으로
   만든다.
3. 채팅방 목록과 상세 화면을 구현하고 DB 조회와 AI transport를 연결한다.
4. Evan Bacon의 최신 템플릿에서 native conversation, streaming store,
   keyboard-aware composer 패턴만 옮긴다.
5. API·모바일 자동 테스트와 전체 정적 검사를 통과시킨다.
6. agent-device로 생성, 전송, 스트리밍, 중단, 재진입, 삭제, 설정 진입을 확인한다.

논리 단위마다 conventional commit을 만들고 원격 push와 배포는 하지 않는다.
