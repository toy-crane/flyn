# 설정 값 편집은 전체 높이 네이티브 plain 시트다

## Decisions

- 설정에서 값을 고치는 작업은 라우트나 하단 CTA가 아니라 `@expo/ui`의 전체 높이
  `BottomSheet`로 연다. 설정 화면이 열림 상태를 소유하고 시트의 plain native
  content는 같은 `Host` subtree 안에서 완결한다.
- 시트 본문은 grouped `Form`이 아니라 sheet의 기본 `systemBackground`를 그대로
  드러내는 `Column`이다. 입력은 native large rounded-border text field로 두고 규칙과
  상태 문구를 바로 아래 hierarchical secondary footer로 표시한다.
- 위쪽 양끝에는 `xmark`·`checkmark` 원형 유리 버튼을 둔다. 닫기와 끌어내리기는
  저장하지 않고 입력을 버리며, 저장 성공 때만 닫는다.
- 하단 CTA는 온보딩·로그인처럼 앞으로 진행하는 흐름에만 쓴다. 설정 편집과
  온보딩은 검증·정규화 순수 함수만 공유하고 입력 컴포넌트는 공유하지 않는다.
- 닉네임과 아이디는 각각 다른 시트다. 닉네임에는 규칙 footer만 두고, 아이디에는
  trailing 가용성 신호와 중복일 때만 danger 오류 및 plain 추천 action 3개를 둔다.
- 규칙 위반은 저장만 잠그고 빨간 오류를 보이지 않는다. 중복만 danger로 표시하며,
  유니크 저장 충돌도 일반 실패 대신 중복 상태로 되돌린다.
- 저장 중에는 `checkmark` 자리를 같은 크기의 `ProgressView`로 바꾸고 입력과 추천을
  잠근다. 일반 저장 실패는 입력을 보존한 채 시트 위 alert로 알린다.
- sheet의 background와 material은 iOS에 맡긴다. 앱 색으로 sheet를 다시 칠하거나
  `Form`의 scroll background를 숨겨 흰색처럼 만드는 우회는 쓰지 않는다.
- 설정 헤더는 닉네임과 `@아이디`를 보여주고 이메일은 읽기 전용 행에 둔다.

## Why

진행은 다음 단계로 가는 일이고 설정 편집은 값 하나를 고치는 닫힌 작업이다. 같은
하단 CTA를 쓰면 가벼운 편집이 온보딩처럼 보인다. 반면 값 하나를 편집하는 sheet에
grouped `Form`을 채우면 넓은 회색 canvas가 중첩된 설정 화면처럼 읽혀 입력보다 더
강해진다. plain sheet는 Apple의 짧은 시스템 편집 modal처럼 작업과 입력에 바로
집중시키면서 native field·footer·control appearance를 유지한다.

전체 높이는 규칙과 추천이 나타나도 시트 높이와 키보드 위치를 안정적으로 유지한다.
컴포넌트 `BottomSheet`를 쓰면 불필요한 URL과 별도 `Host` 없이 설정 화면이 편집
수명을 직접 소유한다. plain `Column`은 별도 scroll container가 없어 단일 필드의
focus와 키보드 소유권도 단순하다.

## Boundaries

- 저장할 것이 없거나 값이 유효하지 않거나 저장 중이면 저장 버튼을 비활성화한다.
- 현재 아이디는 자기에게 사용 가능으로 판정하고, 바뀐 값이 없으면 저장 없이
  닫는다.
- 값 하나에 검증과 서버 왕복이 모두 없다면 설정 목록에서 직접 편집할 수 있다.
- 시트 header의 가운데 정렬과 safe area는 앱이 책임진다.
- 제품 상태인 가용성·중복은 앱의 success·danger 의미를 쓰고, sheet·field·label의
  일반 appearance는 native 기본값을 유지한다.
- 아이디 변경 빈도와 이전 아이디 경고는 검색 표면이 생길 때까지 두지 않는다.
- 구현과 무관하게 유지할 편집 interaction 계약은 이 결정 문서가 소유한다.

## Reconsider when

값 편집이 여러 필드를 함께 저장하거나 독립된 section과 긴 scroll이 필요한
작업으로 커지면 그 화면에 한해 grouped `Form` 또는 route 기반 presentation을
다시 검토한다.

## Still-rejected alternatives

- 설정 편집을 push navigation이나 Expo Router modal route로 만들기.
- 내용에 따라 높이가 바뀌는 부분 detent를 쓰기.
- 저장 결과를 확인할 수 없는 자동 저장이나 닫을 때 저장을 쓰기.
- 검증과 서버 왕복이 필요한 값을 설정 목록에서 바로 편집하기.
- 온보딩의 filled field와 하단 CTA 컴포넌트를 설정 편집에 재사용하기.
- 단일 필드 sheet를 grouped `Form`으로 만들어 넓은 회색 canvas를 넣기.
- `FieldGroup`의 background만 숨겨 plain sheet처럼 보이게 만들기.
- native sheet background를 앱 background로 다시 칠하기.

## Evidence worth preserving

- iOS 26.5 시뮬레이터에서 full `BottomSheet` 안의 plain content, native rounded
  text field, footer, 원형 glass button, disabled 상태와 키보드 안정성을 확인했다.
- sheet는 원래 `systemBackground`였고 회색은 안쪽 `FieldGroup`이 감싼 SwiftUI
  `Form`의 grouped background였다. `Form`을 제거하면 별도 색 override 없이 흰
  native sheet surface가 드러난다.
- 중복 상태에서 trailing 경고, danger footer, 추천 action이 함께 동작하고 추천을
  탭하면 가용성과 저장 상태가 함께 갱신된다.
