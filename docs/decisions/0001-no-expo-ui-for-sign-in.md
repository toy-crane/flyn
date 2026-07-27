# 로그인 화면은 @expo/ui 대신 RN 프리미티브로 만든다

테크 스택 스펙이 "SwiftUI 기반 `@expo/ui` 같은 네이티브 컴포넌트 활용을 우선
검토한다"고 못박아 두었기 때문에, 로그인 화면이 그 지시를 따르지 **않는** 이유를
남긴다. 그러지 않으면 다음 세션이 같은 조사를 처음부터 반복한다.

## 조사 결과 — @expo/ui는 능력 부족이 아니다

기각 사유가 "기능이 없어서"가 아니라는 점이 중요하다. 설치된 `@expo/ui@57.0.7`의
SwiftUI 레이어는 로그인 폼에 필요한 것을 전부 가지고 있다. **프로퍼티가 아니라
modifier로 노출돼 있어서** 프로퍼티만 훑으면 없는 것처럼 보인다:

| 필요한 것 | 있는 곳 |
| --- | --- |
| `keyboardType` | `modifiers/index.ts` — `'email-address'`, `'numeric'` 등 |
| `textContentType` | 같은 파일 — **`'oneTimeCode'`, `'emailAddress'` 포함** |
| 자동 대문자·자동수정 | `textInputAutocapitalization`, `autocorrectionDisabled` |
| 리턴 키·제출 | `submitLabel`, `onSubmit` |
| 폼·버튼·스피너 | `Form`, `Section`, `Button(role)`, `ProgressView` |

`Host`에 `useViewportSizeMeasurement`가 있어 `Form`이 뷰포트를 채우는 것도 된다.

## 그럼에도 쓰지 않는 이유

화면 구성으로 **소셜 우선(A안)** 을 골랐기 때문에 첫 화면에 폼이 아예 없다.
버튼 두 개와 텍스트 링크 하나뿐이고, 그 버튼 둘은 `AppleAuthenticationButton`과
직접 그린 Google 버튼 — 둘 다 SwiftUI가 아닌 UIKit/RN 뷰다. `Host` 안에 넣을 수
없으므로 SwiftUI를 도입해도 화면이 두 개의 렌더링 세계로 쪼개질 뿐,
`Form`의 이점은 하위 이메일·코드 화면에서만 발생한다. 그 대가는:

- 직접 의존성 추가(현재는 `expo-router`를 통한 전이 의존)
- jest-expo에 `Host`·`TextField` 목이 없다. `ObservableState`·worklets까지
  얽혀 있어 기존 sign-in 테스트를 의미 있게 유지하기 어렵다.
- Uniwind className이 SwiftUI 서브트리 안으로 들어가지 못해 스타일링 규약이
  화면 안에서 둘로 갈린다.

즉 **A안에서는 비용이 이점보다 크다.** 이 판단은 구성 선택에 종속되어 있다 —
설정 화면처럼 행이 여러 개인 진짜 폼이 생기면 그때 다시 저울질할 것.

## 대신 무엇을 쓰나

RN 프리미티브 + Uniwind(레이아웃·간격·타이포) + `expo-router`의 `Color`
(iOS 시맨틱 색). Uniwind는 className에서 만든 스타일을 먼저 깔고 `props.style`을
뒤에 붙이므로(`node_modules/uniwind/src/components/native/*.tsx`),
`style={{ color: Color.ios.label }}`이 className 색을 덮는다 — 둘을 섞어 쓸 수 있다.
