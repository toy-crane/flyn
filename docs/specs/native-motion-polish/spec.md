# 네이티브 모션 다듬기

## 상태

- 2026-07-30에 전체 iOS 화면의 모션 기회를 조사했다.
- 사용자는 인증 완료, OTP 입력, 채팅의 맨 아래 버튼과 오류 배너를 첫 적용
  범위로 확정했다.
- iPhone 17 / iOS 26.5 시뮬레이터에서 홈, 채팅, 설정, 표시 이름, 로그인,
  이메일 OTP와 온보딩의 현재 동작을 확인했다.

## 목적

모션은 장식이 아니라 다음 네 가지 관계만 더 잘 설명한다.

- 인증이 끝난 뒤 앱으로 들어가는 동안 짧은 중간 상태가 번쩍이지 않는다.
- OTP 숫자 입력이 어느 칸까지 반영됐는지 입력과 동시에 읽힌다.
- 과거 채팅을 읽을 때 나타나는 맨 아래 action의 출처와 상태 변화가 이어진다.
- 채팅 오류가 composer와 연결된 복구 상태로 나타나고 사라진다.

flyn의 모션은 반응적이고 약간 경쾌하되, 반복되는 화면 전체가 튀거나 흔들리지
않는다. 유용한 입력과 action은 애니메이션이 끝나기를 기다리지 않는다.

## 확정 동작

### 인증 완료

- OTP 확인이 성공한 뒤 프로필 조회가 빠르게 끝나면 전체 화면 progress를
  노출하지 않고 바로 앱으로 넘어간다.
- 조회가 실제 대기로 이어질 때만 launch progress가 나타난다. 나타나는 모션은
  launch의 완결된 `Host` subtree 안에서만 소유한다.
- 인증 route와 앱 route 사이의 push, pop과 back gesture에는 별도의 전환을
  겹치지 않고 Expo Router native stack의 시스템 동작을 유지한다.
- progress 표시 때문에 앱 진입을 늦추거나 최소 노출 시간을 만들지 않는다.

### OTP 입력

- 직접 입력한 숫자는 해당 slot 안에서 짧고 절제된 시각 피드백으로 나타난다.
- 빠른 연속 입력은 앞선 모션이 끝나기를 기다리지 않고 현재 보이는 값에서 새
  값으로 이어진다.
- AutoFill이나 붙여넣기로 여러 숫자가 한 번에 들어오면 slot마다 순차 지연하지
  않고 최종 값 전체를 즉시 보여 준다.
- 잘못된 코드는 기존 오류 문구, danger 상태와 haptic이면 충분하다. slot 전체
  shake나 반복 haptic을 추가하지 않는다.

### 채팅 맨 아래 action

- 맨 아래에서 멀어졌을 때 action은 composer 위의 현재 위치에서 짧게 나타나고,
  다시 맨 아래에 도착하면 같은 경로로 사라진다.
- 사용자가 임계점 주변을 빠르게 오가면 전환은 현재 보이는 값에서 반전하며
  깜빡이거나 bounce하지 않는다.
- action이 보이는 순간부터 바로 누를 수 있고, 누르면 기존 scroll-to-end
  동작을 그대로 수행한다.
- keyboard-aware list, 72pt 맨 아래 판정과 composer 위치 정책은 유지한다.

### 채팅 오류 배너

- 오류 배너는 composer에 붙은 복구 상태로 짧게 나타나고 사라진다.
- 배너의 opacity와 실제 layout 관계를 함께 이어, 주변 content가 한 프레임에
  튀지 않게 한다.
- 재시도 action은 모션 시작과 동시에 접근 가능하다.
- 오류 문구, 재시도 동작과 chat 상태 계약은 바꾸지 않는다.

## 모션 소유권

| surface | owner | 허용 경계 |
| --- | --- | --- |
| launch progress | `@expo/ui` | 완결된 launch `Host` subtree 안의 native modifier |
| auth route handoff | System | Expo Router native stack 기본 전환 |
| OTP slot | React Native | Reanimated UI-thread opacity/transform |
| 맨 아래 action | React Native | Reanimated enter, exit와 layout |
| chat 오류 배너 | React Native | Reanimated enter, exit와 layout |

React Native 모션은 `@expo/ui` leaf를 움직이지 않고, launch의 SwiftUI 모션은
React Native나 native stack을 한 hierarchy처럼 다루지 않는다.

## Reduce Motion

- Reduce Motion이 켜지면 OTP의 scale과 맨 아래 action의 이동을 제거한다.
- 필요한 상태 피드백은 즉시 변경 또는 짧은 opacity 변화로 남긴다.
- launch progress와 오류 배너는 의미를 잃지 않으며, content와 action의
  접근 가능 시점은 일반 모드와 같다.

## 유지할 경계

- iOS 전용, Apple HIG, 앱 시맨틱 테마와 light/dark 자동 대응
- native stack header, push/pop과 interactive back gesture
- OTP 단일 투명 `TextInput`, one-time-code AutoFill과 자동 제출
- Legend List virtualization, streaming text 안정성, keyboard controller의
  interactive dismissal과 scroll ownership
- 기존 오류 문구, haptic, API 요청과 재시도 동작

## 제외 범위

- 전체 화면 공통 duration이나 motion token 체계
- navigation, system alert, Settings `FieldGroup`, native button과 vendor
  로그인 control의 커스텀 애니메이션
- 채팅 메시지 행, streaming text와 countdown 숫자의 반복 애니메이션
- send/stop symbol의 bounce나 pulse
- 이메일·표시 이름 form 오류와 빈 채팅의 첫 메시지 전환
- 패키지 업데이트, renderer 변경, Android와 web 대응

## 완료 조건

- 빠른 인증 완료에서는 launch progress가 번쩍이지 않고, 실제 대기에서는
  progress가 이해 가능한 시점에 나타난다.
- 직접 OTP 입력, 빠른 연속 입력과 AutoFill에서 값이 누락되거나 지연되지 않는다.
- 맨 아래 action을 빠르게 나타냈다 숨겨도 점프, bounce와 입력 차단이 없다.
- 채팅 오류 배너가 나타나고 사라질 때 composer와 주변 layout이 튀지 않는다.
- Reduce Motion on/off 모두에서 네 상태가 이해 가능하고 모든 action이 즉시
  사용할 수 있다.
- light/dark, 큰 Dynamic Type과 keyboard가 열린 채팅에서 clipping이나
  double-paint가 없다.
- 관련 자동 테스트와 저장소 전체 정적 검사가 통과하고 iOS simulator에서 네
  전환의 양방향을 직접 확인한다.

## 가정과 남은 위험

- launch progress 지연은 실제 조회를 늦추지 않고 시각 노출만 제어한다.
- Reanimated layout transition과 keyboard-aware composer가 같은 frame에서
  경쟁할 수 있다. 오류 배너와 keyboard가 동시에 바뀌는 상태를 직접 검증한다.
- Legend List의 맨 아래 판정은 JS 상태로 전달된다. 임계점 왕복에서 반복
  mount가 보이면 판정 의미를 바꾸지 않는 범위에서 표시 상태의 연속성을 보강한다.
- `@expo/ui`와 Reanimated의 Reduce Motion 처리가 서로 다른 경로이므로 두
  renderer에서 각각 실제 시스템 설정을 확인한다.
