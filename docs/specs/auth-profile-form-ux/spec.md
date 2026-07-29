# 인증·프로필 입력 UX

## 상태

- 로그인, 이메일 입력, 표시 이름 온보딩·수정의 확정 UX를 기록한 구현 스펙이다.
- 기존 인증·프로필 데이터 흐름과 네이티브 navigation은 유지한다.
- 구현은 이 문서 승인 뒤 별도 작업으로 진행한다.

## 목적

진행 action의 위치가 화면마다 달라 생기는 탐색 비용을 줄이고, 입력 control의
딱딱한 outline 표현을 앱의 미니멀한 surface 표현에 맞춘다. Apple HIG와 실제
native interaction은 유지하면서 다음 일관성을 만든다.

- 앞으로 진행하는 CTA는 화면 하단에서 예측할 수 있다.
- 입력 중에는 CTA가 키보드 위에서 계속 접근 가능하다.
- 처리 중 UI가 추가되며 기존 control 위치가 움직이지 않는다.
- 일반 text input은 같은 부드러운 filled appearance를 쓴다.

이 스펙은 다음 확정 결정 위에 선다.

- [Apple HIG와 앱 소유 테마](../../decisions/apple-hig-with-app-theme.md)
- [Self-contained native UI boundaries](../../decisions/self-contained-native-ui-boundaries.md)
- [Uniwind CSS 앱 테마](../../decisions/uniwind-css-theme.md)
- [네이티브 소셜 로그인](../../decisions/native-social-login.md)
- [이메일 OTP code](../../decisions/email-otp-code.md)

## UX 원칙

Apple HIG가 navigation, keyboard, accessibility, Dynamic Type와 시스템 control
행동을 결정한다. Toss는 다음 interaction 원칙만 참고하며 TDS component,
시각 자산이나 Android 관용을 복사하지 않는다.

- 한 화면에서 한 가지 진행 판단에 집중한다.
- 진행 CTA는 예상 가능한 하단 위치를 유지한다.
- loading 때문에 기존 레이아웃이 움직이지 않는다.
- 문구와 입력 요구는 짧고 바로 답할 수 있어야 한다.

참고한 Toss 자료:

- [BottomCTA — fixed bottom CTA](https://tossmini-docs.toss.im/tds-mobile/components/BottomCTA/fixed-bottom-cta/)
- [BottomCTA — check first](https://tossmini-docs.toss.im/tds-mobile/components/BottomCTA/check-first/)
- [Button loading](https://tossmini-docs.toss.im/tds-mobile/components/button/)
- [Design motivation](https://toss.tech/article/design-motivation)

## 화면 구조

### Root sign-in

root sign-in은 RN surface로 유지한다. 상단에는 wordmark와 짧은 설명을 두고,
Apple·Google·이메일 진입 action 묶음은 safe area를 존중해 화면 하단에 둔다.
Apple과 Google button의 vendor appearance는 변경하지 않는다.

로그인 요청 중에는 기존 button 묶음을 그대로 둔 채 화면 interaction을
차단하는 overlay를 표시한다. progress는 button 사이에 삽입하지 않고 화면
정중앙에 둔다. 이 전체 화면 예외는 여러 인증 수단을 동시에 잠가야 하고,
Apple vendor button 안에 앱이 progress를 삽입할 수 없기 때문이다.

### 이메일 입력

native stack header와 system back을 유지한다. 안내와 input은 상단에, 코드
받기 CTA는 하단에 둔다. 키보드가 열리면 CTA는 가려지지 않고 키보드 바로 위의
접근 가능한 위치를 유지한다.

요청 중에는 CTA의 위치와 크기를 유지한다. 이 surface는 단일 요청이므로
progress는 button-local 상태로 표현하고 화면 전체 overlay를 사용하지 않는다.

### 이메일 OTP code

현재 RN code input과 6개 slot 합성을 유지한다. 이번 작업에서 renderer나 입력
모델을 바꾸지 않는다. 하단 CTA 원칙을 이 surface에 확장할지는 code 입력의
자동 제출·재전송 흐름과 함께 별도 결정한다.

### 표시 이름 온보딩·수정

온보딩과 Settings의 표시 이름 수정은 같은 form 규칙과 input appearance를
공유한다. native stack header는 현재 route 계약을 유지한다. 안내와 input은
상단에, 다음 또는 저장 CTA는 하단에 둔다. 키보드가 열리면 CTA가 키보드 위에
남는다.

저장 중에는 CTA의 위치와 크기를 유지하고 button-local progress를 쓴다.
온보딩에 이미 있는 로그아웃 탈출구는 primary CTA와 경쟁하지 않는 약한
secondary action으로 남긴다.

## `SoftTextInput`

일반 single-line input은 universal `@expo/ui` `TextInput`을 감싼 TSX
`SoftTextInput`으로 같은 appearance를 사용한다. iOS leaf는 SwiftUI
`TextField`다.

확정 appearance:

| 속성 | 결정 |
| --- | --- |
| container | app `surface`를 쓰는 filled field |
| outline | 기본 상태에서는 없음 |
| 높이 | 약 56pt, Dynamic Type에서는 내용에 맞춰 증가 |
| 좌우 padding | 16–18pt |
| corner radius | 16pt |
| label | field 바깥, 위쪽 |
| placeholder | app placeholder semantic color |
| cursor·keyboard | native behavior와 tint 유지 |
| error | field 아래의 짧은 문구, danger semantic color |
| disabled | 앱 disabled 역할과 native semantics를 함께 사용 |

이 컴포넌트는 appearance와 control 기본값만 소유한다. 검증 규칙, 서버 요청,
submit, loading과 route 이동은 각 form이 소유한다. React Hook Form은 이번
범위에 도입하지 않으며, 나중에 실제 필요가 생기면 form layer에서 연결한다.

## 상태 계약

| 상태 | 표현 |
| --- | --- |
| empty | placeholder와 잠긴 CTA |
| valid | 입력값과 활성 CTA |
| invalid | field 아래 오류와 잠긴 CTA |
| server failure | 입력값을 보존하고 field 아래 실패 문구 |
| form pending | 같은 자리에 있는 CTA의 local progress, 중복 제출 차단 |
| root sign-in pending | 중앙 progress overlay, 모든 로그인 action 차단 |
| keyboard visible | 입력 field와 하단 CTA가 동시에 접근 가능 |

오류가 발생해도 입력값을 지우지 않는다. 오류와 비활성은 색만으로 표현하지
않는다. button label이 progress로 바뀌더라도 button width와 화면 배치는
유지한다.

## 접근성

- 모든 action의 최소 hit target은 44×44pt다.
- Dynamic Type에서 input, error와 CTA label이 잘리지 않는다.
- VoiceOver 순서는 header → 안내 → label → input → error → CTA다.
- focus, cursor, selection, return key와 one-time-code behavior는 native
  control의 동작을 막지 않는다.
- 키보드가 열린 상태에서도 CTA와 secondary action을 구분해 탐색할 수 있다.
- light/dark는 시스템 appearance를 따르고 앱 내부 theme toggle을 만들지 않는다.

## 검증

구현 완료는 정적 검사와 실제 iOS simulator 확인을 모두 요구한다.

| surface | 확인할 상태 |
| --- | --- |
| root sign-in | 기본, 각 provider pending, failure, light/dark |
| email | empty, valid, failure, pending, keyboard, return key |
| onboarding display name | empty, valid, pending, keyboard, secondary action |
| Settings display name | initial value, edit, failure, pending, keyboard, back |

공통 확인 사항:

1. CTA가 safe area와 keyboard에 가려지지 않는다.
2. loading 진입 전후에 button과 주변 content가 움직이지 않는다.
3. input focus, cursor, selection과 마지막 입력 글자가 보존된다.
4. 서버 실패 뒤 입력값을 수정하고 다시 제출할 수 있다.
5. 큰 Dynamic Type과 VoiceOver에서 읽기·탐색 순서가 유지된다.
6. Apple·Google button의 vendor appearance가 변하지 않는다.

## 범위 밖

- 인증 방식, API, profile schema와 route 변경
- Apple·Google button 재디자인
- 이메일 OTP code input renderer 변경
- React Hook Form 도입
- custom Swift native module
- 자체 navigation bar, back button 또는 앱 내부 theme toggle
- Android·web 대응

## 남은 위험

- 설치된 `@expo/ui`의 direct SwiftUI `TextField`는 2026-07-27 spike에서
  `frame` modifier와 겹친 layout에서 hit testing 문제가 있었다. filled style은
  universal `TextInput`으로 구현하되 실제 device 크기에서 focus와 keyboard를
  확인해야 한다.
- 현재 native observable state가 React render보다 앞서 마지막 글자가 누락될 수
  있는 경로가 확인됐다. 제출값의 단일 원본과 return-key 제출은 구현 검증이
  필요하다.
- 하단 CTA의 keyboard avoidance가 Dynamic Type과 긴 오류 문구에서도 content를
  가리지 않는지 simulator에서 확인해야 한다.
