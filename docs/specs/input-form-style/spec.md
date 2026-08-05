# Input form 스타일 검토

## 상태

승인·구현됐다. A의 adaptive filled capsule을 일반 single-line form input에 쓰고,
Settings 편집 sheet도 같은 `FormInput` appearance를 소비한다. 프로토타입의 B와 C는
기각된 비교안으로 남긴다.

## 검토할 결과

plain `systemBackground`를 유지하면서 이메일 OTP·프로필 온보딩·프로필 편집
sheet의 single-line input이 입력 가능한 영역으로 즉시 인식되어야 한다. 시스템
글꼴, Dynamic Type, system tint, native keyboard와 기존 상태·검증 흐름은 유지한다.

[프로토타입 열기](prototype.html)

## 화면 인벤토리

- 이메일 OTP: 빈 입력, 잘못된 이메일 오류
- 온보딩: 닉네임 입력, 사용 가능한 아이디, 중복 아이디와 추천
- 설정 편집 sheet: 닉네임, 중복 아이디

화면 구조, 한국어 카피, footer, trailing 상태 아이콘과 CTA 위치는 그대로 두고
input 외형만 바꿨다.

## 비교 변형

- **A — Filled capsule:** iOS `tertiarySystemFill`에 해당하는 adaptive fill과
  capsule shape를 쓴다.
- **B — Filled rounded rectangle:** A와 같은 fill·높이·padding을 유지하고
  continuous rounded rectangle만 쓴다.
- **C — Current rounded border:** 현재 프로필 편집 sheet의 얇은 native
  rounded-border 외형을 비교 기준으로 둔다.

## 결정

- single-line input의 최소 높이는 52pt, 좌우 padding은 18pt면 44pt hit target과
  현재 입력 밀도를 함께 보존한다.
- label이 있는 이메일 OTP·온보딩은 label을 field 밖에 유지한다. 설정 sheet는
  title이 입력 의미를 제공하므로 별도 label을 추가하지 않는다.
- 오류는 문구·아이콘·danger outline을 함께 사용한다.
- HTML의 system fill과 glass는 iOS semantic appearance의 근사치다. 선택한 외형은
  production 구현 뒤 iOS simulator의 light/dark, Increase Contrast와 가장 큰
  Dynamic Type에서 다시 확인해야 한다.

## 범위 밖

- OTP 6칸 입력과 채팅 composer의 geometry·renderer, 검색 field, Settings grouped row
- 실제 React 상태·서버 요청·키보드·routing 연결
- Android 화면 acceptance

OTP slot과 chat composer는 geometry와 renderer를 공유하지 않지만, 후속 승인에 따라
같은 semantic `inputFill`만 소비한다.
