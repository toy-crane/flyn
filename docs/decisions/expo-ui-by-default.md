# 새 화면은 universal `@expo/ui`가 기본값, 경계가 막는 화면만 RN

**새 화면은 universal `@expo/ui`로 만든다.** universal에 없는 컴포넌트나 표현이
필요하면 `@expo/ui/swift-ui`로 내려간다 — universal에 있는 것으로 대신하지
말고 내려간다. 벤더 문서는 이 경우 `.ios.tsx` 분리나 `Platform.OS` 분기를
요구하지만 iOS 전용 앱이라 해당 없고([ios-only](ios-only.md)), Android·web
폴백도 만들지 않는다.

`Host` 안에서 Uniwind `className`은 무효다. Uniwind는 `Host` 바깥에서만 쓰고,
한 화면에서 두 방식을 섞지 않는다([uniwind-for-styling](uniwind-for-styling.md)).

**RN으로 내려가려면 근거가 있어야 한다.** 아래가 그 근거의 형태이자, 로그인
표면 네 화면에 실제로 적용한 결과다. 근거를 남기지 않으면 다음 세션이 같은
조사를 반복한다.

**이 기록은 2026-07-27에 한 번 다시 쓰였다.** 처음에는 "sign-in에 폼이 없어
이득이 없다"는 논거로 `@expo/ui`를 통째로 기각했는데, 그 논거를 `email`·`code`까지
확장한 것이 과했다. 실제 근거는 아래 둘이다 — **경계**와 **스파이크 결과**.

## @expo/ui는 진짜 네이티브다 (기각 사유가 아니다)

설치된 `@expo/ui@57.0.7`에는 SwiftUI를 import하는 Swift 파일이 130개 있고,
`ios/TextFieldView.swift`는 실제 SwiftUI `TextField(...)`를, `ios/FormView.swift`는
실제 `Form { }`을 만든다. 능력도 충분하다 — 필요한 것이 프로퍼티가 아니라
**modifier로** 노출돼 있어 프로퍼티만 훑으면 없는 것처럼 보일 뿐이다:
`keyboardType`, `textContentType`(**`'oneTimeCode'` 포함**),
`textInputAutocapitalization`, `autocorrectionDisabled`, `submitLabel`, `onSubmit`.

## 근거 1 — 경계 (Expo 공식 가이드)

가이드가 "keeping SwiftUI layouts self-contained. Interop is possible, but it works
best when boundaries are clearly defined"라고 못박고, **"Re-entering SwiftUI after
React Native components requires a new `Host` wrapper"**라고 적는다. `Host`는
RN↔SwiftUI 경계이고(내부적으로 `UIHostingController`), RN 뷰를 SwiftUI 안에 넣으면
SwiftUI가 그 뷰의 `center`/`bounds`/`frame`/`transform`을 장악한다.

`sign-in`은 화면을 지배하는 두 버튼이 SwiftUI로 표현 불가한 RN 뷰다 —
`AppleAuthenticationButton`(벤더 UIKit 컴포넌트)과 Google 버튼(swift-ui `Image`는
SF Symbol·심볼 세트·동기 블로킹 파일 URI만 받아 **풀컬러 G 로고를 못 쓴다**).
SwiftUI로 감싸면 텍스트→RN→RN→버튼으로 교차하며 `Host`를 여러 번 열게 된다.
그래서 `sign-in`은 RN이다.

## 근거 2 — 스파이크 결과 (2026-07-27, iOS 26.5 시뮬레이터)

`code` 화면은 6칸으로 보이되 그 위에 겹친 투명 `TextField` 하나가 입력을 받는
합성이 필요했다. 실제로 만들어 확인한 결과:

| 확인한 것 | 결과 |
| --- | --- |
| `Host`가 터치를 받는가 | **된다** |
| SwiftUI `Button`의 `onPress` | **된다** |
| 맨 `TextField` 탭 → 포커스 | **된다** |
| `frame` 모디파이어를 건 `TextField` | **탭이 안 먹는다** — 레이아웃·렌더는 되는데 포커스가 안 잡힌다 |
| `ZStack`에 겹친 투명 `TextField` | **탭이 안 먹는다** |

`frame`이 히트 영역을 죽이므로 필드를 칸 줄만큼 넓힐 수단이 없고, `frame` 없이는
`ZStack`에서 형제인 칸들이 탭을 가져간다. **그래서 `code`는 RN이다.**

부수적으로 걸린 두 가지도 남긴다:

- **`useNativeState`는 `@expo/ui/swift-ui`에서 가져와야 한다.** 루트 `@expo/ui`가
  내보내는 `ObservableState`는 구조가 달라(`build/universal/State`) swift-ui
  `TextField`가 타입 단계에서 거부한다. 반면 **`Host`는 항상 루트에서** 가져온다.
- **`Button`의 `children`은 `ReactElement`여야 한다.** 문자열을 그대로 넣으면 앱이
  크래시한다 — 문자열은 `label` prop이다.

## 그래서 어디에 쓰나

| 화면 | 구현 |
| --- | --- |
| `sign-in` | RN (근거 1) |
| `code` | RN (근거 2) |
| `email` | **SwiftUI** — RN이 하나도 필요 없고, 맨 `TextField`는 스파이크에서 정상 동작했다 |
| `launch`(`_layout`) | **SwiftUI** — `ProgressView` + `Text` + `Button`, 자명하게 self-contained |

`code`의 `frame` 문제는 @expo/ui 쪽 버그로 보인다. SDK가 오르면 다시 볼 가치가
있고, 그때 `code`를 SwiftUI로 옮기면 `email`과 관용이 통일된다.
