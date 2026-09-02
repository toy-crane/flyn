# Expo 참조 저장소 색인

Expo 화면이나 상호작용을 만들 때 골라 볼 수 있는 공개 구현 예시의 지도다.
색인은 규범이 아니다. 항목의 선택이 [결정 계약](../decisions/README.md)과
충돌하면 언제나 결정 계약이 이긴다. 각 항목은 검토 시점의 커밋으로 고정한다.

## SchroederNathan/expo-ui-examples

- 무엇: Expo SDK 57의 `@expo/ui` 데모 모음이다. 앱 전체를 `@expo/ui`로 구성했고
  iOS, Android, 공용 예제로 나뉜다.
- 고정 사본: [e283c89](https://github.com/SchroederNathan/expo-ui-examples/tree/e283c89a8ede8dc2fc2719db2823ccbc338b9cd4),
  2026-08-18 검토.
- 이럴 때 본다: `@expo/ui` 화면을 새로 만들 때 `src/examples/`에서 비슷한 데모를
  연다. Settings와 시스템 폼은 `universal-settings`, 차트는 `swift-charts`,
  시트는 `bottom-sheet`, 심벌과 숫자 애니메이션은 `animated-symbols`와
  `numeric-transitions`, Android Material 표현은 `material-you`와
  `material-carousel`을 본다.
- 들여오지 않는다: 앱 전체를 `@expo/ui`로 만드는 구조.
  [모바일 UI 렌더러 경계](../decisions/mobile-ui-renderer-boundaries.md)에 따라
  `@expo/ui`는 Settings와 시스템 폼만 소유하고, 한 화면은 하나의 주 렌더러를
  사용한다.

## margelo/ai-chat-demo

- 무엇: 스트리밍 Markdown과 대기 표시를 갖춘 ChatGPT 스타일 채팅 데모다. 우리
  앱과 같은 `react-native-enriched-markdown`과 `@legendapp/list`를 사용한다.
- 고정 사본과 볼 파일:
  [모바일 AI 채팅 표현](../decisions/mobile-ai-chat-rendering.md)의 보존할
  근거가 원본이다. 고정 커밋과 입력창, 메시지, 대기 표시별로 볼 파일을
  안내한다.
- 들여오지 않는다: 모바일 직접 WebSocket, 기기에 두는 비밀값, RAG 구조.
  [AI 서버 경계](../decisions/ai-server-boundary.md)와
  [AI 채팅 프로토콜](../decisions/ai-chat-protocol.md)이 정한 경로를 사용한다.

## SchroederNathan/clarity

- 무엇: 문장을 소리 내어 읽으면 실시간 피드백과 점수를 주는 말하기 연습 앱이다.
  우리와 같은 Expo SDK 57과 React Native 0.86을 사용한다.
- 고정 사본: [5bbb881](https://github.com/SchroederNathan/clarity/tree/5bbb881b99c438f9b82998da5b7dbccfc48c074e),
  2026-08-18 검토.
- 이럴 때 본다: 화면 구성, 결과 표현, 애니메이션 마감의 실제 예가 필요할 때
  `app/`과 `components/`를 연다. 순수 계산을 모은 `lib/`와 부수 효과를 모은
  `services/`의 구분은 테스트하기 쉬운 로직 분리의 예로 참고한다.
- 들여오지 않는다: MMKV 로컬 저장, 서버 없는 구조, 이 저장소의 폴더 구조. 원격
  데이터는 [모바일 원격 데이터 상태](../decisions/mobile-remote-data.md)를,
  폴더 구조는 [모바일 코드 구조](../decisions/mobile-code-architecture.md)를
  따른다.

## SchroederNathan/amber

- 무엇: 링크, 이미지, 메모를 저장하면 AI가 제목, 요약, 태그를 만들어 분류하는
  앱이다. 마감 디테일이 좋고 커스텀 네이티브 모듈을 포함한다.
- 고정 사본: [0bd3b50](https://github.com/SchroederNathan/amber/tree/0bd3b50aaf813c238451a21d6d176814f021f36d),
  2026-08-18 검토.
- 이럴 때 본다: Expo 커스텀 네이티브 모듈의 실제 예가 필요할 때
  `modules/progressive-blur`와 `modules/subject-lift`를 연다. AI 자동 분류의
  사용자 경험이 궁금할 때 `src/app/`과 `convex/ai.ts`를 본다.
- 들여오지 않는다: Convex, Clerk, `react-native-unistyles` 스택. 우리는
  [Supabase 클라이언트 경계](../decisions/supabase-client-boundaries.md),
  [모바일 인증](../decisions/mobile-authentication.md),
  [모바일 Uniwind 스타일 경계](../decisions/mobile-uniwind-styling.md)를
  따른다.

## toy-crane/dearly

- 무엇: 같은 계보의 Expo SDK 57 앱이다. Uniwind, HeroUI Native, `@expo/ui`와
  Expo Router Native Stack을 같은 역할로 쓰고, 설정 계층과 화면 모드 선택을
  결정 계약(`docs/decisions/mobile-ui-foundation.md`)으로 확정해 구현했다.
  비공개 저장소라 이 사용자만 연다.
- 고정 사본: [0438e47](https://github.com/toy-crane/dearly/tree/0438e477034b8f5af6245214a775f4903fe7aa88),
  2026-09-02 검토.
- 이럴 때 본다: 설정 화면과 하위 선택 화면을 만들 때 `apps/mobile/src/screens/settings/`를
  연다. 화면 모드 원본과 저장은 `shared/lib/hooks/use-color-scheme.tsx`와
  `core/theme/app-theme-bridge.tsx`, 선택 행의 플랫폼 분기와 접근성은
  `theme-option-row.ios.tsx`·`theme-option-row.android.tsx`, iOS 폼의 배경 토큰
  주입은 `settings-surface-modifiers.ios.ts`, 설정 라우트와 헤더 옵션은
  `src/app/(authenticated)/_layout.tsx`, 상태 표시줄은 `src/app/_layout.tsx`를
  본다.
- 들여오지 않는다: Native Tabs 없이 Stack 하나로 앱을 구성하는 정보 구조, 글자
  배율 상한(`dynamicTypeSize`, `MAX_FONT_SIZE_MULTIPLIER`, Android font scale
  config plugin), `@react-native-async-storage/async-storage`, PostHog 이벤트,
  런타임 버전 행, 로딩 인디케이터 기본값 규칙. 우리는
  [모바일 UI 렌더러 경계](../decisions/mobile-ui-renderer-boundaries.md),
  [모바일 타이포그래피](../decisions/mobile-typography.md),
  [모바일 색상 시맨틱](../decisions/mobile-color-semantics.md),
  [모바일 작업 진행 표시](../decisions/mobile-action-progress.md)를 따른다.

## EvanBacon/expo-ai

- 무엇: 서버에서 네이티브 UI를 렌더링해 AI 응답으로 스트리밍하는 React Server
  Components 실험 데모다. React Conf 발표용이다.
- 고정 사본: [0c04001](https://github.com/EvanBacon/expo-ai/tree/0c0400199d2827b1fac0b69a7b7eda3c26d85c50),
  2026-08-18 검토.
- 이럴 때 본다: RSC 기반 AI UI가 어떤 모습인지 배경 지식이 필요할 때 README와
  서버 렌더링 함수 `actions/`를 읽는 정도다.
- 들여오지 않는다: RSC 스트리밍 구조 전체.
  [AI 채팅 프로토콜](../decisions/ai-chat-protocol.md)이 AI SDK UI message와
  `useChat()`을 확정했고, Expo의 RSC는 아직 developer preview다.

## 갱신 규칙

- 저장소를 추가할 때 같은 네 줄 형식을 쓰고 검토 시점 커밋으로 고정한다.
- Expo SDK를 올릴 때 항목을 다시 보고 고정 커밋을 갱신하거나 낡은 항목을
  지운다.
