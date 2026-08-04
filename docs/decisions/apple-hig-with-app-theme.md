# Apple HIG와 앱 테마의 경계

## Decisions

- 시스템 컴포넌트, native navigation, gesture와 상호작용 관용은 Apple HIG를
  따른다. 시스템 표현으로 부족한 곳만 직접 만든다.
- 커스텀 컴포넌트 세트나 전역 타이포·간격·모서리 스케일을 만들지 않는다.
- 앱이 light/dark **제품 의미 색 역할**을 소유한다. RN이 직접 그리는 background,
  surface, foreground, muted, danger, success와 앱 tint가 여기에 속한다.
- iOS는 `Form`·`List`·sheet·navigation·alert의 기본 표면, 재질, label,
  secondary label, separator와 상호작용 위계를 소유한다. 시스템이 의미를 이미
  아는 곳은 앱 배경과 픽셀 단위로 맞추려고 덮어쓰지 않는다.
- RN과 native의 일관성은 같은 의미가 같은 역할로 읽히는 것으로 판단한다. 서로
  다른 화면 종류의 배경색이 완전히 같아야 한다는 뜻이 아니다.
- 시스템 폰트, native stack header와 back gesture를 유지한다.
- Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 앱 테마로 다시 칠하지
  않는다.

## Why

목표는 iOS가 준 것처럼 보이고 동작하는 작은 앱이지 독자적인 디자인 시스템이
아니다. 다만 React Native 화면과 iOS가 알 수 없는 제품 상태에는 명시적인 앱 색의
원본이 필요하다. 제품 의미는 앱이, native surface와 관용은 iOS가 소유하면 두
요구를 함께 만족한다.

## Boundaries

- 앱 테마는 색 역할이며 재사용 컴포넌트 라이브러리가 아니다.
- 화면별 크기·간격·타이포 값은 필요한 화면이나 컴포넌트가 소유한다.
- 앱 안에 appearance 선택기를 만들지 않고 시스템 light/dark를 따른다.
- 앱이 직접 소유하는 foreground/background 조합은 접근성 대비를 검증한다.
- native subtree에서 앱 색을 명시하는 경우는 앱 tint, 제품 상태 또는 앱이 직접
  소유하는 canvas처럼 iOS가 의미를 추론할 수 없는 자리로 한정한다.
- native surface의 색을 RN 화면과 맞추는 것만이 목적이면
  `presentationBackground`, `scrollContentBackground('hidden')` 같은 override를
  쓰지 않는다.

## Reconsider when

브랜드 정체성, 사용자 선택 appearance, 앱이 소유해야 하는 full-bleed native
surface 또는 Apple 관용으로 표현할 수 없는 반복 컴포넌트가 제품 요구가 되면
디자인 시스템 경계를 다시 결정한다.

## Still-rejected alternatives

- 자체 팔레트·타이포 스케일·컴포넌트 세트를 한꺼번에 만들기.
- 색까지 OS에 전부 위임해 RN 시맨틱 스타일링을 포기하기.
- 앱 background를 모든 `Form`·`List`·sheet에 강제로 칠해 renderer의 표면을
  픽셀 단위로 통일하기.
- 컴포넌트별 크기·모서리·간격을 전역 테마 토큰으로 승격하기.
