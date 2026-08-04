# React Native와 Expo UI의 화면 경계

## Decisions

- 라우팅, 서버 상태, mutation, 검증과 화면 상태는 React가 소유한다.
- 새 native form·짧은 상태 화면의 기본 renderer는 universal `@expo/ui`다. 필요한
  표현이 universal에 없으면 해당 플랫폼의 `@expo/ui/swift-ui` 또는
  `@expo/ui/jetpack-compose` 경계로 내려가며, 비슷하지만 동작이 다른 universal
  컴포넌트로 대체하지 않는다.
- `@expo/ui` 레이아웃과 control은 완결된 `Host` subtree 하나에 모은다. RN
  wrapper·overlay와 `Host`를 형제로 둘 수 있지만 control마다 경계를 왕복하지
  않는다.
- RN은 가상 목록, keyboard, vendor control 또는 hit testing처럼 화면의 핵심
  경계가 Expo UI로 완결되지 않는 surface에만 쓴다.
- 재사용 UI는 TSX React 컴포넌트로 만든다. Expo UI가 필요한 native capability를
  표현하지 못할 때만 custom native module을 검토한다.
- universal API로 같은 동작을 표현할 수 있으면 공유하고, native capability가
  실제로 다를 때만 플랫폼 파일로 나눈다. Android 지원을 이유로 아직 검증하지
  못하는 빈 screen fallback을 만들지는 않는다.

## Why

Expo UI는 실제 SwiftUI·Jetpack Compose primitive를 제공하지만 `Host`는 RN과
native UI 사이의 레이아웃 경계다. 한 subtree를 완결하면 native control의 관용을
얻으면서 React 상태를 유지할 수 있고, 반복 왕복을 피하면 layout·focus·gesture
소유권이 분명해진다.

## Boundaries

| surface | renderer | 이유 |
| --- | --- | --- |
| Settings·프로필 편집 시트·온보딩, 이메일 입력, launch progress | universal `@expo/ui` | form이나 짧은 상태가 한 `Host` 안에서 완결된다 |
| root sign-in | RN | Apple·Google vendor button이 화면의 핵심이다 |
| 이메일 OTP code | RN | 겹친 단일 입력과 6개 slot의 hit testing이 필요하다 |
| 채팅 목록·상세 | RN | 가상 목록, streaming, keyboard controller와 composer가 하나의 scroll 경계를 공유한다 |

RN surface도 iOS native view를 사용한다. 이 표는 native/non-native 구분이 아니라
surface를 가장 잘 소유하는 renderer를 고른 결과다.

## Reconsider when

Expo SDK가 올라 기존 focus·hit testing·interop 제약을 없애거나, 새 surface가
현재 표와 다른 native capability를 요구하면 해당 surface만 다시 판정한다.

## Still-rejected alternatives

- Expo UI를 통째로 기각하고 모든 화면을 RN으로 만들기.
- 한 화면에서 renderer를 섞는 것 자체를 금지하기.
- control마다 `Host`를 다시 열거나 `RNHostView`를 기본 구조로 삼기.
- 재사용을 이유로 Expo UI 위에 별도 Swift 모듈 만들기.

## Evidence worth preserving

- root sign-in을 SwiftUI로 감싸면 Apple UIKit button과 풀컬러 Google mark 때문에
  경계를 반복해서 열어야 한다.
- OTP spike에서 평범한 `TextField`와 `Button`은 동작했지만, `frame`을 건 필드와
  `ZStack`의 투명 필드는 focus hit testing에 실패했다. 이 제약이 사라지기 전에는
  code surface를 RN으로 유지한다.
- swift-ui `TextField`의 native state는 `@expo/ui/swift-ui`에서 가져오고,
  `Host`는 universal 패키지에서 가져온다. SwiftUI `Button`의 문자열은 children이
  아니라 `label` prop으로 전달한다.
