# iOS 시뮬레이터 검증 도구

## Decisions

- 시뮬레이터 조작과 화면 증거 수집에는 `agent-device`를 사용한다.
- 좌표를 기억해 탭하는 도구 대신 접근성 ref나 selector로 요소를 지목한다.
- MCP와 CLI는 같은 daemon을 사용하므로 작업에 편한 쪽을 선택하거나 섞어 쓴다.
- 명령 문법은 저장소 지침에 복사하지 않고 설치 버전의 `agent-device help`와
  프로젝트 스킬에서 확인한다.

## Why

이 앱은 SwiftUI sheet·menu, 키보드와 동적 레이아웃을 사용한다. 좌표는 프레임과
프로세스 경계를 넘을 때 쉽게 무효가 되지만 XCTest 접근성 트리는 요소의 의미를
유지한다.

## Boundaries

- `agent-device`는 빌드 도구가 아니다. Expo가 만든 앱을 설치·실행·조작하고
  screenshot, log, network와 성능 증거를 남긴다.
- 소셜 로그인 자동화의 막힘은 입력 정확도 문제가 아니다. 자동 검증은 이메일 OTP
  경로를 사용하고, 소셜은 [수동 절차](../auth-verification.md)를 따른다.

## Reconsider when

접근성 트리로 표현되지 않는 필수 화면이 생기거나, 현재 도구가 필요한 시스템 UI를
조작하지 못한다는 재현이 생기면 도구 경계를 다시 고른다.

## Still-rejected alternatives

- screenshot 좌표를 장기 selector로 사용하기.
- 버전이 바뀌는 CLI 명령을 `CLAUDE.md`에 고정해 두기.
