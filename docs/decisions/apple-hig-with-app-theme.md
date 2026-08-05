# 네이티브 관용과 스타일 파운데이션의 경계

## Decisions

- 시스템 컴포넌트, native navigation, gesture와 상호작용 관용은 iOS의 Apple HIG,
  Android의 Material 지침을 따른다. 시스템 표현으로 부족한 곳만 직접 만든다.
- RN이 직접 그리는 surface는 색·간격·타이포 역할을 스타일 파운데이션으로
  공유한다. 커스텀 컴포넌트 세트나 전역 layout·크기·모서리 scale까지 만들지는
  않는다.
- 앱은 light/dark **제품 의미 색 역할**을 소유한다. RN의 background, surface,
  foreground, muted, danger, success와 실제 제품 accent가 여기에 속한다.
- 각 플랫폼은 `Form`·`List`·sheet·navigation·alert의 기본 표면, 재질, label,
  secondary label, separator, 간격, 글자 위계, control 크기와 상호작용을
  소유한다. 시스템이 의미를 이미 아는 곳은 앱 스타일과 픽셀 단위로 맞추려고
  덮어쓰지 않는다.
- Expo Router/React Navigation의 공개 theme API에는 앱의 background, text,
  separator와 action accent를 연결한다. 이 색 연결은 header·tab bar의 높이,
  material, gesture와 native interaction을 앱이 소유한다는 뜻이 아니다.
- Settings처럼 grouped `Form`이 화면 전체의 의미인 경우에는 해당 route의 native
  header에 같은 semantic grouped background를 연결할 수 있다. 현재 예외는
  Settings 하나이며 다른 route의 navigation surface에는 전파하지 않는다.
- RN과 native의 일관성은 같은 의미가 같은 역할로 읽히는 것으로 판단한다. 서로
  다른 화면 종류의 배경색이 완전히 같아야 한다는 뜻이 아니다.
- 시스템 폰트, native stack header와 back gesture를 유지한다.
- Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 앱 테마로 다시 칠하지
  않는다.

## Why

목표는 각 플랫폼이 준 것처럼 보이고 동작하는 작은 앱이지 독자적인 cross-platform
UI kit가 아니다. 다만 React Native 화면과 OS가 알 수 없는 제품 상태에는 반복되는
시각 언어가 필요하다. 제품 의미와 RN의 기본 리듬은 앱이, native surface와 관용은
플랫폼이 소유하면 두 요구를 함께 만족한다.

## Boundaries

- 스타일 파운데이션은 재사용 컴포넌트 라이브러리가 아니다.
- RN의 반복 간격과 타이포 역할은 공유하지만 화면 배치, 특정 크기와 모서리는
  필요한 화면이나 컴포넌트가 소유한다.
- 앱 안에 appearance 선택기를 만들지 않고 시스템 light/dark를 따른다.
- 앱이 직접 소유하는 foreground/background 조합은 접근성 대비를 검증한다.
- native subtree에서 앱 색을 명시하는 경우는 실제 앱 accent, 제품 상태 또는 앱이
  직접 소유하는 canvas처럼 플랫폼이 의미를 추론할 수 없는 자리로 한정한다.
- navigation chrome은 semantic color를 공유하는 renderer bridge다. header·tab
  bar의 공개 theme color prop은 쓸 수 있지만 platform material과 metric을 RN
  surface처럼 다시 만들지 않는다.
- native surface의 색을 RN 화면과 맞추는 것만이 목적이면
  `presentationBackground`, `scrollContentBackground('hidden')` 같은 override를
  쓰지 않는다.

## Reconsider when

브랜드 정체성, 사용자 선택 appearance, 앱이 소유해야 하는 full-bleed native
surface 또는 플랫폼 관용으로 표현할 수 없는 반복 컴포넌트가 제품 요구가 되면
디자인 시스템 경계를 다시 결정한다.

## Still-rejected alternatives

- 자체 팔레트·layout scale·컴포넌트 세트를 한꺼번에 만들기.
- 색까지 OS에 전부 위임해 RN 시맨틱 스타일링을 포기하기.
- 앱 background를 모든 `Form`·`List`·sheet에 강제로 칠해 renderer의 표면을
  픽셀 단위로 통일하기.
- 컴포넌트별 layout·크기·모서리를 전역 테마 토큰으로 승격하기.
