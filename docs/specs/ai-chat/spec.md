# AI 채팅

## 상태

- 이 문서는 확정된 구현 스펙이다.
- 구현은 한 작업 세션에서 끝낸다.
- 기준 화면은 Evan Bacon의
  [`chat-template@40379fcb`](https://github.com/EvanBacon/chat-template/tree/40379fcbc8d57025e09eef77ae129b7b30b100c7)다.
  iOS 채팅 표면만 참고하고 범용 템플릿의 제품 기능과 플랫폼 분기는 복사하지 않는다.

## 목적

로그인한 사용자가 채팅방을 만들고 AI와 텍스트로 대화하며, 앱을 닫았다 다시
열어도 목록과 메시지를 그대로 볼 수 있게 한다. 기존 인증·프로필·설정과 앱
테마는 유지한다.

이 스펙은 다음 결정 위에 선다.

- [iOS 전용](../../decisions/ios-only.md)
- [Apple HIG와 앱 소유 테마](../../decisions/apple-hig-with-app-theme.md)
- [새 화면은 @expo/ui가 기본](../../decisions/expo-ui-by-default.md)
- [Hono on Vercel](../../decisions/hono-on-vercel.md)
- [AI Gateway 모델 호출](../../decisions/ai-gateway-for-model-calls.md)
- [하이브리드 데이터 접근](../../decisions/hybrid-data-access.md)
- [서버 소유 채팅 메시지](../../decisions/server-owned-chat-messages.md)

## 사용자 흐름

1. 로그인 후 첫 화면에서 최근 갱신 순의 채팅방 목록을 본다.
2. 새 채팅을 누르면 제목이 `새 채팅`인 방이 생기고 상세로 이동한다.
3. 사용자가 첫 메시지를 보내면 첫 줄의 앞뒤 공백을 제거하고 40 grapheme까지
   잘라 채팅방 제목으로 한 번만 바꾼다.
4. 사용자 메시지는 즉시 우측 말풍선에 보이고 AI 응답은 전체 폭 Markdown으로
   스트리밍된다.
5. 사용자가 위쪽 기록을 읽고 있으면 새 토큰이 위치를 빼앗지 않는다. 맨 아래에
   있을 때만 스트림을 따라간다.
6. 생성 상태는 [AI 채팅 생성 상태 피드백](../ai-chat-generation-feedback/spec.md)에
   따라 전송, 첫 응답 대기와 스트리밍 중단을 구분한다. 중단 시 이미 받은 내용은
   `중단됨` 메시지로 저장된다.
7. 모델 호출이 실패하면 사용자 메시지는 남고 현재 화면에 재시도가 보인다.
8. 목록 행을 길게 누르면 확인 후 채팅방과 그 메시지를 삭제할 수 있다.

## 화면

### 채팅방 목록

- 현재 홈을 대체하며 native header 제목은 `채팅`이다.
- 행은 제목과 갱신 시각을 표시하고 상세로 push한다.
- 설정과 새 채팅은 `Stack.Toolbar`의 native action으로 제공한다.
- 빈 상태에는 짧은 안내와 새 채팅 action을 제공한다.
- 검색, 즐겨찾기, 수동 이름 변경은 없다.

### 채팅방 상세

- native back button과 채팅방 제목을 쓴다. custom header를 만들지 않는다.
- 메시지 목록은 가상화하고 interactive keyboard dismissal을 지원한다.
- 사용자 메시지는 최대 폭 80%의 우측 중립 말풍선, AI 메시지는 전체 폭이다.
- AI Markdown은 문단, 제목, 강조, 목록, 링크, inline/fenced code, 표를 지원한다.
  이미지와 syntax highlighting은 지원하지 않는다.
- composer는 Liquid Glass를 우선하고 지원되지 않는 iOS에서는 native material
  blur로 폴백한다. 텍스트만 받으며 최대 4,000자다.
- 모든 icon-only action은 한국어 accessibility label과 44pt hit target을 가진다.

이 화면은 Legend List, keyboard controller, Reanimated 목록과 composer의 한
경계를 요구한다. SwiftUI Host를 중간에 재진입시키지 않기 위해 화면 전체를 RN으로
만드는 것이 `@expo/ui` 기본값의 명시적 예외다.

## 데이터와 보안

- 채팅방은 사용자 소유 UUID, 제목, 생성·갱신 시각을 가진다.
- 메시지는 방 안의 ID, `user | assistant` 역할, 본문,
  `complete | stopped` 상태, 생성 시각을 가진다.
- 앱은 자기 채팅방만 조회·생성·삭제하고 자기 메시지만 읽는다.
- 앱에는 메시지 insert/update/delete 권한이 없다. 인증된 Hono 경계만
  service role로 사용자·AI 메시지를 쓴다.
- 계정 삭제는 채팅방과 메시지를, 채팅방 삭제는 그 메시지를 cascade한다.
- 서버는 모바일이 보낸 과거 대화를 신뢰하지 않고 DB 기록만 모델 입력으로 쓴다.

## AI 스트리밍

- 엔드포인트는 `POST /chats/:chatId/messages`다.
- 입력은 마지막 사용자 메시지 ID와 본문만 받는다.
- 같은 ID와 같은 본문의 재요청은 중복 없이 이어가고, 같은 ID의 다른 본문은
  `409`다.
- 잘못된 입력은 `400`, 미인증은 `401`, 없거나 남의 방은 모두 `404`다.
- 정상 종료된 AI 메시지는 `complete`, abort된 부분 응답은 `stopped`로 저장한다.
  본문을 하나도 받지 못한 실패는 AI 메시지를 만들지 않는다.
- iOS 스트리밍 응답은 `Content-Type: application/octet-stream`과
  `Content-Encoding: none`을 명시한다.
- 모델은 Vercel AI Gateway를 통하고 코드에
  `inclusionai/ling-3.0-flash-free`로 고정한다.
- 시스템 지침은 간결하고 유용하게, 사용자가 쓴 언어로 답하도록 고정한다.

## 제외 범위

- 이미지·파일·음성 첨부
- 도구 호출, 웹 검색, 프로젝트, style, model picker, extended thinking
- drawer/sidebar, chat 검색·즐겨찾기·수동 이름 변경
- Android·web 폴백
- 오프라인 큐, background generation, 알림, 과금·사용량 UI
- 기존 인증·프로필·설정 동작의 변경

## 완료 조건

- 자기 채팅방 생성·목록·상세·삭제와 메시지 영구 저장이 동작한다.
- AI 응답이 실제 Gateway에서 스트리밍되고 중단·오류 상태가 정의대로 남는다.
- 다른 사용자의 방과 메시지는 읽거나 바꿀 수 없다.
- light/dark, keyboard interactive dismissal, 자동 스크롤, 설정 진입이 실제
  iOS 시뮬레이터에서 확인된다.
- `bun run check`, `bun run db:reset`, `bun run db:test`가 통과한다.

## 가정과 남은 위험

- 빈 채팅방은 목록에 남고 사용자가 직접 삭제한다.
- 모델은 UI나 환경 변수에 노출하지 않는다. 변경은 코드 리뷰와 배포를 거친다.
- Gateway key가 없는 환경은 자동 테스트의 가짜 모델 경계까지만 검증한다.
- Liquid Glass와 keyboard controller는 dev build 재빌드가 필요할 수 있다.
