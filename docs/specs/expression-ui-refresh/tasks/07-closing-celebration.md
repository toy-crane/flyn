# 07 — 결말을 Lottie 마크로 축하한다

## Outcome

에피소드가 끝나면 결말 카드에서 파란 원이 튀어나오고 안에서 체크가 그려지며 원 둘레로 고리가 한 번 퍼진 뒤, 그 뒤에서 파랑·보라·청록 조각이 터지고 `해냈어요!`와 결과 문장이 순서대로 나타난다. 마크와 조각은 프로젝트가 소유하는 Lottie 애니메이션 파일이고, 이모지와 앱의 시스템 아이콘은 축하에 쓰이지 않는다.

## Blockers

None.

## Acceptance criteria

- [ ] 결말이 나면 카드, 마크, 체크, 고리, 조각, `해냈어요!`, 결과 문장이 순서대로 나타난다. 마크가 튀는 박자에 햅틱이 한 번 온다.
- [ ] 연출이 시작될 때부터 `표현 돌아보기`를 누를 수 있다.
- [ ] 목표를 이루지 못한 결말은 `해냈어요!`와 고리 없이 마크와 결과 문장만 조용히 나타나고 조각은 절반이다.
- [ ] 동작 줄이기를 켜면 마크의 마지막 프레임이 정지 상태로 보인다.
- [ ] 밝은 화면과 어두운 화면에서 마크와 조각의 색이 그 화면의 강조색과 채널 색을 따른다. 어느 쪽에서도 마크가 떠 보이지 않는다.
- [ ] 종료 때 한 번만 재생하고 기록에서 다시 열면 정지 상태다.
- [ ] 반짝임 아이콘과 이모지가 축하 카드에 없다.
- [ ] `lottie-react-native`가 Expo SDK 57 공식 문서에서 확인한 버전으로 더해지고 `bun run check`의 의존성 검사가 통과한다.
- [ ] [에피소드 종료와 표현 돌아보기 스펙](../../episode-expression-review/spec.md)의 축하 연출 기본값이 이 연출로 바뀌고, [모바일 아이콘 렌더링](../../../decisions/mobile-icon-rendering.md)이 마크와 조각을 프로젝트 소유 애니메이션 파일로 반영한다.

## Constraints

- 순서와 박자는 [시안](../prototypes/closing.html)과 같다. 시각 값(마크 지름, 조각 개수와 색, 각 요소의 지연과 길이)은 시안을 기본으로 하되 기기에서 조정할 수 있다.
- `lottie-react-native`는 새 네이티브 의존성이다. [모바일 Expo 의존성 호환](../../../decisions/mobile-expo-dependency-compatibility.md)에 따라 SDK가 묶어 주는 버전을 쓰고, [모바일 개발 런타임](../../../decisions/mobile-development-runtime.md)대로 Development Build를 다시 만든다. 버전은 `https://docs.expo.dev/llms.txt`에서 찾은 공식 문서를 원문으로 읽어 확인한다.
- Lottie 파일은 사서 쓰거나 만들며, 색은 [모바일 색상 시맨틱](../../../decisions/mobile-color-semantics.md)의 강조색과 채널 색을 실행 시점에 입힐 수 있어야 한다.
- Rive, 마스코트, 소리는 만들지 않는다.

## Verification

- `bun run test`가 성공 결말과 타협 결말의 요소 구성, 동작 줄이기의 정지 상태, 한 번만 재생하는 규칙을 확인하는 테스트를 포함해 통과한다.
- `bun run check`가 통과한다. 의존성 검사가 새 패키지를 받아들인다.
- iOS와 Android Development Build를 다시 만들어 `agent-device` 한 세션씩에서 성공 결말과 타협 결말의 연출, 연출 중 `표현 돌아보기` 누르기, 동작 줄이기, 밝은 화면과 어두운 화면을 확인한다.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
