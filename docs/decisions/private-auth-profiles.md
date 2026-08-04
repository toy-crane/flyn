# 인증 프로필과 온보딩 상태

## Decisions

- `public.profiles`는 `auth.users.id`와 같은 기본키를 쓰는 1:1 비공개 계정
  정보다. 공개 사용자 카드가 아니다.
- Auth 사용자 생성 trigger가 같은 경계에서 프로필을 만든다. 세션 뒤 행이 없으면
  온보딩이 아니라 데이터 무결성 오류다.
- `display_name is null`만 첫 온보딩을 뜻하며 별도 완료 flag를 두지 않는다.
- 사용자는 RLS 안에서 자기 행을 읽고 `display_name`만 수정한다. 이메일의 원본은
  Auth이며 프로필 복제본을 클라이언트가 고치지 않는다.
- provider 이름은 입력 후보로만 사용하고, 사용자가 확인한 표시 이름을 로그인 때
  덮어쓰지 않는다.
- 입력은 50 grapheme으로 제한하고 보이지 않는 가장자리 문자를 정규화한다. DB의
  500자 상한은 남용 방지 backstop이다.

## Why

Auth 생성과 프로필 생성을 분리하면 세션은 있지만 행은 없는 상태와 클라이언트
생성 권한이 생긴다. 온보딩 완료를 nullable 표시 이름 하나로 표현하면 서로 다른
두 상태 값의 드리프트를 피할 수 있다.

## Boundaries

- 조회 실패, 행 없음과 `display_name is null`은 서로 다른 상태다.
- 공개 username·avatar·bio와 학습 취향은 현재 프로필 스키마의 책임이 아니다.
- 계정 삭제는 [계정 삭제 계약](no-apple-token-revocation.md)이 소유한다.

## Reconsider when

다른 사용자에게 보이는 identity나 표시 이름 없이 끝낼 수 있는 온보딩 경로가
제품 요구가 되면 공개 프로필과 완료 상태를 별도 결정한다.

## Still-rejected alternatives

- 앱 첫 진입 때 클라이언트가 프로필을 만들기.
- `onboarding_completed`와 `display_name` null을 함께 유지하기.
- provider 이름으로 사용자 값을 자동 저장하거나 덮어쓰기.
- 필요가 없는 공개 프로필 필드를 미리 만들기.
