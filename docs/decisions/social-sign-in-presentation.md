# root sign-in의 인증 수단 표현

## Decisions

- root sign-in은 RN surface로 두고 Apple system button과 Google branding button을
  같은 너비·시각적 무게의 주 수단으로 묶는다.
- 소셜 버튼 높이는 52pt, corner radius는 16pt, 버튼 사이는 12pt다. Apple과
  Google의 공식 light/dark appearance와 컬러 mark를 유지한다.
- 이메일은 Google 아래의 17pt muted text action으로 두고 최소 44pt hit target을
  유지한다. card, icon, border 또는 `또는` 구분선을 추가하지 않는다.
- wordmark와 설명은 위에, 인증 action 묶음은 safe area를 지켜 화면 아래에 둔다.
- Apple 또는 Google 요청 중에는 기존 action을 움직이지 않은 채 모두 잠그고
  화면 중앙에 full-screen progress overlay를 표시한다.
- 일반 단일 form의 submit은 이 예외를 따르지 않고 같은 자리의 button-local
  progress를 사용한다.

## Why

Apple system button은 내부 label과 accessory layout을 앱에 열지 않는다. Google만
button-local progress를 쓰면 provider 상태 표현이 달라지고, Apple label 위에
overlay를 얹으면 locale·Dynamic Type에 취약하다. 전체 overlay는 세 인증 경로를
함께 잠그면서 layout을 유지한다.

## Boundaries

- vendor button은 앱 테마로 다시 칠하지 않는다.
- pending 실패나 provider sheet 취소 뒤에는 같은 위치의 action 묶음으로 돌아간다.
- 소셜 provider 선택과 token 교환은 [로그인 수단 계약](sign-in-methods.md)이
  소유한다.

## Reconsider when

Apple이 공식 button accessory/progress API를 제공하거나 custom Apple button을
감수해야 할 명확한 제품 필요가 생기면 button-local 상태를 다시 평가한다.

## Still-rejected alternatives

- Apple·Google·이메일을 같은 위계로 표시하기.
- provider button 내부 label을 progress로 바꾸거나 Apple label 위치를 추정해
  overlay하기.
- custom Apple button으로 공식 appearance와 접근성을 다시 구현하기.
- pending 때 버튼을 제거하거나 사이에 progress를 삽입해 layout을 움직이기.

## Evidence worth preserving

실제 simulator 비교에서 Google button-local progress는 자연스러웠지만 Apple
system button과 같은 방식으로 구현할 수 없었다. Apple label을 추정한 absolute
overlay는 영문 label과 겹쳤다.
