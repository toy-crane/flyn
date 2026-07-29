# 소셜 로그인은 브랜드 버튼 한 세트로, 이메일은 보조 경로로 표현한다

이 기록은 [native-social-login](native-social-login.md)이 정한 인증 수단을 root
sign-in 화면에서 어떻게 표현하는지 정한다. provider 선택, 토큰 교환과 development
build 결정은 기존 기록이 계속 소유한다.

## 기각한 대안

- **Apple·Google·이메일을 같은 위계로 표시** — 이메일까지 추천 경로처럼 읽혀
  소셜 우선 구조가 흐려진다.
- **`또는` 구분선이나 별도 이메일 card 추가** — 선택지는 명확해지지만 작은
  로그인 화면의 시각 요소와 수직 간격을 불필요하게 늘린다.
- **progress를 provider button 사이에 삽입** — 로딩 때 버튼 묶음이 움직이고,
  어느 action의 상태인지도 모호하다.
- **provider button의 라벨을 progress로 교체** — Google에는 가능하지만
  `AppleAuthenticationButton`은 자식 view와 내부 라벨 layout을 노출하지 않아
  두 provider의 상태 표현이 달라진다.
- **Apple 라벨 옆에 progress를 absolute overlay로 배치** — 현재 locale의
  문자열 폭을 추정해야 한다. 실제 simulator에서 영문 라벨과 겹쳤고, 번역,
  Dynamic Type과 OS 변경에도 취약하다.
- **custom Apple button으로 교체** — layout 자유는 생기지만 시스템 버튼이
  보장하는 Apple 승인 appearance, 비율, 번역과 접근성을 다시 구현해야 한다.
- **앱 시맨틱 색으로 vendor button을 재색칠** — Apple·Google branding과
  충돌한다.

## 결정

### 화면과 버튼 소유권

root sign-in은 RN surface다. 화면 로직과 pending overlay는 React가 소유하고,
Apple은 `expo-apple-authentication`의 완성형 native button을 leaf로 사용한다.
Google은 공식 branding 값과 컬러 G mark를 보존하는 RN `GoogleButton`을 사용한다.
이 경계의 일반 원칙은
[self-contained-native-ui-boundaries](self-contained-native-ui-boundaries.md)에
있다.

Apple button이 스타일 자유도가 가장 낮으므로 소셜 버튼 세트의 기준이다.
Google을 Apple에 맞추되 둘의 vendor appearance는 바꾸지 않는다.

- 높이: 52pt
- corner radius: 16pt
- Apple ↔ Google 간격: 12pt
- 너비와 시각적 무게: 동일
- Apple: light에서 black, dark에서 white system appearance
- Google: branding guide의 light/dark 배경, stroke, label과 컬러 G mark

공통 수치는 `apps/mobile/src/theme/buttons.ts`가 소유한다. Apple button을 앱
테마로 흉내 내거나 Google mark를 단색으로 만들지 않는다.

### 위치와 위계

wordmark와 설명은 상단에 두고, 로그인 action 묶음은 safe area를 존중해 화면
하단에 둔다. 화면 높이가 달라져도 action을 찾는 위치가 바뀌지 않게 한다.

Apple과 Google은 같은 위계의 주 로그인 수단이다. 이메일은 사용할 수 있는
세 번째 인증 수단이지만 추천 수단처럼 보이지 않는 보조 text action으로 둔다.

- Google button 아래 4pt
- 17pt label
- `muted-foreground` semantic color
- 최소 44pt hit target
- 배경, border, icon과 `또는` 구분선 없음

글자 크기나 hit target을 줄이지 않고 색과 button style로만 위계를 낮춘다.
light/dark의 실제 색 값은 앱 시맨틱 테마가 결정한다.

### pending

Apple이나 Google 로그인을 시작하면 기존 action 묶음을 그대로 둔 채 모든 로그인
action을 잠그고, 화면 정중앙에 full-screen progress overlay를 표시한다.

root sign-in의 pending은 단일 form submit과 다르다. provider 요청 하나가
진행되는 동안 다른 provider와 이메일 진입도 함께 차단해야 한다. 또한 Apple
native button 내부에 앱 progress를 안정적으로 합성할 수 없다. 따라서 이
화면에서만 button-local progress보다 전체 화면 overlay를 우선한다.

overlay는 버튼을 제거하거나 새 공간을 차지하지 않으므로 pending 진입 전후의
layout이 움직이지 않는다. 실패하거나 사용자가 provider sheet를 취소하면 같은
자리의 action 묶음으로 돌아온다.

## 근거

- [Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple):
  system button은 승인된 appearance, 비율, 번역과 VoiceOver label을 제공한다.
- [Google 로그인 브랜딩 가이드](https://developers.google.com/identity/branding-guidelines):
  logo, 색, padding과 다른 provider 대비 prominence를 규정한다.
- [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons):
  같은 선택지의 크기는 맞추고 style로 선호 위계를 구분한다.

기본 화면, 전체 화면 pending, button-local progress 대안과 이메일 보조 위계는
iPhone 17 simulator에서 실제 렌더로 비교했다. button-local 대안은 Google에는
자연스러웠지만 Apple 라벨 내부 layout을 소유할 수 없어 채택하지 않았다.

## 결과와 재검토 조건

- root sign-in의 vendor button, 이메일 보조 action과 pending 처리는
  `apps/mobile/src/app/sign-in/index.tsx`가 함께 소유한다.
- Google의 branding 구현은
  `apps/mobile/src/components/sign-in/google-button.tsx`에 격리한다.
- 일반 form의 submit은 이 예외를 따르지 않고 button-local progress를 유지한다.
- Apple이 공식 button에 accessory/progress API를 제공하거나, 제품이 custom
  Apple button을 감수해야 할 명확한 필요를 얻을 때만 button-local 표현을
  재검토한다.
