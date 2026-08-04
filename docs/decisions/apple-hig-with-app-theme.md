# Apple HIG와 앱 테마의 경계

## Decisions

- 시스템 컴포넌트, native navigation, gesture와 상호작용 관용은 Apple HIG를
  따른다. 시스템 표현으로 부족한 곳만 직접 만든다.
- 커스텀 컴포넌트 세트나 전역 타이포·간격·모서리 스케일을 만들지 않는다.
- 앱이 명시하는 light/dark **색 역할**은 앱이 소유한다. 네이티브 기본 표현과
  Liquid Glass가 이미 의미를 아는 곳은 시스템에 맡긴다.
- 시스템 폰트, native stack header와 back gesture를 유지한다.
- Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 앱 테마로 다시 칠하지
  않는다.

## Why

목표는 iOS가 준 것처럼 보이고 동작하는 작은 앱이지 독자적인 디자인 시스템이
아니다. 다만 React Native 화면에서 의미 기반 `className`을 쓰려면 명시적인 앱
색의 원본이 필요하다. 색 역할만 소유하면 두 요구를 함께 만족한다.

## Boundaries

- 앱 테마는 색 역할이며 재사용 컴포넌트 라이브러리가 아니다.
- 화면별 크기·간격·타이포 값은 필요한 화면이나 컴포넌트가 소유한다.
- 앱 안에 appearance 선택기를 만들지 않고 시스템 light/dark를 따른다.
- 앱이 직접 소유하는 foreground/background 조합은 접근성 대비를 검증한다.

## Reconsider when

브랜드 정체성, 사용자 선택 appearance 또는 Apple 관용으로 표현할 수 없는 반복
컴포넌트가 제품 요구가 되면 디자인 시스템 경계를 다시 결정한다.

## Still-rejected alternatives

- 자체 팔레트·타이포 스케일·컴포넌트 세트를 한꺼번에 만들기.
- 색까지 OS에 전부 위임해 RN 시맨틱 스타일링을 포기하기.
- 컴포넌트별 크기·모서리·간격을 전역 테마 토큰으로 승격하기.
