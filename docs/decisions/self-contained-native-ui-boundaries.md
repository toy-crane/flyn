# React가 화면을 소유하고 네이티브 UI는 완결된 `Host` subtree로 둔다

이 기록은 [expo-ui-by-default](expo-ui-by-default.md)를 대체한다. universal
`@expo/ui`를 기본값으로 두고, 경계가 막는 surface만 RN으로 만든다는 선택은
유지한다. 다만 "한 화면에서는 RN과 `@expo/ui`를 섞지 않는다"는 표현은
`Host`의 실제 역할과 현재 Settings 구조를 지나치게 단순화했으므로 바로잡는다.

## 결정

화면은 계속 React 컴포넌트다. 라우팅, 서버 상태, mutation, 검증과 화면 상태는
React가 소유한다. 화면을 그리는 기본 renderer는 universal `@expo/ui`이며,
iOS에서는 SwiftUI, Android에서는 Jetpack Compose로 이어지는 네이티브
컴포넌트를 사용한다. 이 앱은 iOS 전용이므로 Android·web 폴백은 만들지 않는다.

`@expo/ui`를 쓰는 부분은 관련 레이아웃과 control을 하나의 **완결된 `Host`
subtree**에 모은다. RN 화면 바깥에 `Host`를 두거나, `Host`와 RN overlay를
형제로 두는 것은 허용한다. RN과 SwiftUI 사이를 한 control마다 반복해서
오가는 구성은 피한다. Expo가 제공하는 `RNHostView`나 자동 interop은 표현
가능성이지 기본 구조가 아니다.

재사용 UI는 TypeScript/TSX React 컴포넌트로 만든다. 그 컴포넌트가
`@expo/ui` primitive를 반환하면 실제 iOS leaf는 SwiftUI이므로, 재사용을 위해
별도 Swift 모듈을 만들 필요가 없다. Expo UI가 필요한 native capability를
표현하지 못할 때만 RN primitive나 custom native module을 검토한다.

## 현재 surface 경계

| surface | renderer | 근거 |
| --- | --- | --- |
| Settings | universal `@expo/ui` | native grouped form 전체가 self-contained하다 |
| 표시 이름·온보딩 | universal `@expo/ui` | 일반 TextInput과 Button으로 완결된다 |
| 이메일 입력 | universal `@expo/ui` | 일반 TextInput과 Button으로 완결된다 |
| launch·native progress | universal `@expo/ui` | 시스템 progress와 짧은 상태 표현이다 |
| root sign-in | RN | Apple·Google vendor button이 화면의 핵심이다 |
| 이메일 OTP code | RN | 겹친 단일 입력과 6개 slot의 hit testing을 SwiftUI 경계에서 안정적으로 표현하지 못했다 |

RN surface도 iOS에서 UIKit native view를 사용한다. 이 표의 구분은
"native 대 non-native"가 아니라, React Native primitive와 Expo UI가 노출하는
SwiftUI primitive 중 어느 renderer가 해당 surface의 관용과 제약에 맞는지를
뜻한다.

## 이유

Expo는 `Host`를 React Native와 SwiftUI 사이의 경계로 설명한다. RN view를
SwiftUI 안에 넣는 interop은 가능하지만, SwiftUI layout을 self-contained하게
유지하고 경계를 명확하게 할 때 가장 잘 동작한다고 권장한다.

- [Building SwiftUI apps with Expo UI](https://docs.expo.dev/guides/expo-ui-swift-ui/)
- [Universal Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)

현재 Settings도 이 원칙을 따른다. 바깥 RN `View`가 화면과 overlay를 관리하고,
grouped form은 하나의 `Host` 안에서 완결된다. 반면 sign-in을 SwiftUI로 옮기면
화면을 지배하는 두 vendor button 때문에 경계를 다시 열어야 한다. code 화면은
2026-07-27 simulator spike에서 `frame`과 겹친 투명 `TextField`의 hit testing이
실패했다.

## 결과

- Apple HIG와 native control 상태·접근성은 계속 우선한다.
- 화면 로직과 재사용 컴포넌트는 TSX에서 관리한다.
- 한 화면 안의 RN wrapper, native `Host`, RN overlay는 역할이 분리된 형제로
  공존할 수 있다.
- renderer를 섞는 것 자체를 금지하지 않고, 반복되는 경계 왕복을 금지한다.
- SDK가 바뀌어 기존 제약이 사라지면 sign-in이나 code의 renderer는 새 근거로
  다시 결정할 수 있다.
