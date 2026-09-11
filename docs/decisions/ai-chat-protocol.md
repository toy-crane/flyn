# AI 채팅 프로토콜

## 결정

- 에피소드와 `AI에게 물어보기`가 공통 스트리밍 규칙을 사용한다. 기능별 경로는
  [AI 에피소드 프로토콜](ai-episode-protocol.md)이 소유한다. 일반 채팅 전용
  `POST /ai/chat`은 제공하지 않는다.
- 요청과 응답은 Vercel AI SDK의 UI message 프로토콜을 사용한다.
- 모델 응답을 그대로 흘려보내는 경로는 `streamText()` 결과의 `toUIMessageStreamResponse()`로 반환한다. 스토리 만들기 대화와 `AI에게 물어보기`가 이 경로다.
- 모델 출력을 장면 part로 나눠 쓰는 에피소드 진행은 `createUIMessageStream`의 writer로 스트림을 만들고 `createUIMessageStreamResponse`로 반환한다.
- 모바일 앱은 `@ai-sdk/react`의 `useChat()`과 `expo/fetch`로 응답을 스트리밍한다.
- 모바일의 진행 중 대화 상태는 AI SDK가 관리한다. 에피소드의 저장과 복구는
  [AI 에피소드 프로토콜](ai-episode-protocol.md), 물어보기의 메모리 수명은
  [모바일 AI에게 물어보기](mobile-ask-ai.md)가 소유한다.

## 경계

- 모바일 앱은 Supabase Auth access token을 `Authorization` 헤더에 넣는다. 서버 인증과 공개 경로의 범위는 AI 서버 경계 결정이 소유한다.
- 일반 채팅 제거를 이유로 에피소드 저장 구조와 계정 데이터를 바꾸지 않는다. 스트림 재연결은 추가하지 않는다.
- 자동 테스트는 가짜 모델을 사용한 Hono 경로 테스트와 메시지 전송·응답 표시를 확인하는 모바일 컴포넌트 테스트만 둔다. 실제 모델 호출과 새 E2E 도구는 추가하지 않는다.
- 구현을 마치면 Development Build에서 iOS와 Android의 메시지 전송과 스트리밍 응답을 각각 한 번 확인한다.
- 이 결정은 모델 제공자와 모델, system prompt, 도구와 사용량 제한을 정하지 않는다.
- Expo Web은 지원하지 않으며 iOS와 Android의 `expo/fetch` 동작만 검증한다.

## 이유

Vercel AI SDK의 UI message 프로토콜은 텍스트뿐 아니라 추론, 도구 호출과 사용자 정의 데이터를 순서가 있는 message part로 전달한다. `useChat()`이 이 프로토콜의 전송과 채팅 상태를 처리하므로 모바일과 서버가 별도 스트림 형식과 상태 관리 코드를 만들지 않아도 된다. Expo SDK 57은 스트리밍에 필요한 `expo/fetch`를 제공한다. 대화 수명은 각 기능의 계약에서 정하므로 공통 스트리밍 계층이 저장 여부를 강제하지 않는다. 최소 자동 테스트와 기기 확인은 새 테스트 계층을 추가하지 않고 서버 계약과 양쪽 모바일 런타임을 확인한다.

결과 객체의 `toUIMessageStreamResponse()`는 AI SDK 7에서 deprecated이며 다음 major에서 사라진다. 그래도 독립 헬퍼 `toUIMessageStream`과 `createUIMessageStreamResponse`를 조합한 방식과 내보내는 바이트가 같고, 제공자 오류 원문을 가리는 기본 동작도 같다. 지금 옮겨도 동작이 달라지지 않으므로, 메서드가 실제로 사라지는 major 판올림 때 옮긴다. 에피소드 진행은 모델 출력을 그대로 흘리지 않고 장면 단위 part로 나눠 쓰므로 writer로 스트림을 직접 만든다.

## 재검토 조건

- `ai`를 다음 major로 올릴 때. 결과 객체의 `toUIMessageStreamResponse()`가 사라지므로 그 경로를 독립 헬퍼로 옮긴다.
- AI 기능이 대화가 아닌 한 번의 생성 요청으로 바뀔 때
- `expo/fetch`가 iOS 또는 Android에서 UI message stream을 안정적으로 처리하지 못할 때
- Hono나 Vercel Functions가 AI SDK 응답 스트리밍을 안정적으로 전달하지 못할 때
- 클라이언트가 AI SDK UI message 프로토콜과 맞지 않는 별도 실시간 프로토콜을 사용하게 될 때
- 채팅 흐름이 복잡해져 현재의 경로·컴포넌트 테스트로 회귀를 충분히 막지 못할 때

## 계속 제외하는 대안

- 일반 텍스트 스트림: 간단하지만 도구 호출과 사용자 정의 데이터의 구조를 잃고 모바일이 메시지 상태를 직접 관리해야 한다. AI 응답이 영구히 텍스트 하나로 제한될 때만 재검토한다.
- 생성이 끝난 뒤 JSON 응답 반환: 구현은 단순하지만 긴 응답이 끝날 때까지 사용자가 결과를 볼 수 없다. 실시간 응답이 제품 요구에서 빠질 때만 재검토한다.
- 실제 모델을 호출하는 자동 테스트: 실행할 때마다 비용과 외부 서비스 상태의 영향을 받는다. 모델 품질을 계속 평가해야 할 때 별도 평가 테스트로 추가한다.
