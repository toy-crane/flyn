# 지원 플랫폼

## Decisions

- 현재 구현·기기 검증 범위는 iOS이고 Android를 다음 모바일 플랫폼으로 지원한다.
- 공유 React 상태·도메인과 스타일 파운데이션은 두 플랫폼에서 같은 의미 계약을
  쓴다. 플랫폼별 native API 차이는 중앙 adapter 또는
  `.ios.ts`·`.android.ts` 경계가 소유한다.
- 화면과 컴포넌트 곳곳에 `Platform.OS` 조건을 흩뿌리지 않는다. 플랫폼 분기는
  실제 native 동작이나 색 해석이 달라지는 경계에만 둔다.
- Android를 준비한다는 이유로 아직 검증할 수 없는 빈 화면 복제본이나 가짜
  fallback을 만들지는 않는다. 현재 iOS acceptance는 계속 실제 기기·시뮬레이터로
  검증하고, Android acceptance는 Android 제품 구현이 시작될 때 추가한다.
- web은 모바일 fallback이 아니다. web 제품 요구가 생기면 별도 제품 표면으로
  결정한다.

## Why

Android 지원을 나중에 추가해도 공유 의미를 다시 설계하지 않으려면 플랫폼 차이를
지금부터 경계 안에 가둬야 한다. 동시에 아직 없는 Android 화면을 추측해 만들면
검증되지 않은 코드와 최저 공통분모 UI만 늘어난다. 공통 의미와 플랫폼별 native
표현을 분리하면 현재 iOS 품질과 미래 Android 경로를 함께 지킬 수 있다.

## Reconsider when

Android 출시 계획이 취소되거나, web이 모바일과 같은 제품 표면을 공유해야 한다는
구체적 요구가 생기면 지원 범위와 adapter 경계를 다시 결정한다.

## Still-rejected alternatives

- iOS 전용 구조를 고정한 뒤 Android 작업 때 화면 전체를 다시 설계하기.
- 미래 가능성만으로 빈 Android 화면·fallback을 미리 만들기.
- 플랫폼별 native API를 쓰지 않기 위해 공통분모 UI로 낮추기.
- 모든 화면에서 직접 `Platform.OS`로 스타일과 동작을 고르기.
