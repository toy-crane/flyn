# 프로필은 인증 사용자와 1:1인 비공개 계정 정보다

`public.profiles`는 공개 사용자 카드가 아니라 인증 사용자의 앱 내 계정 정보다.
`auth.users.id`와 같은 기본키를 쓰고, 이메일 복제본·사용자가 정한 표시 이름·
생성/수정 시각만 담는다.

## 기각한 대안

- **앱이 첫 진입 때 프로필을 만들기** — 세션은 생겼는데 프로필은 없는 중간
  상태가 생기고, 클라이언트에 생성 권한도 열어야 해서 기각했다.
- **별도 `onboarding_completed` 플래그** — `display_name is null`과 같은 상태를
  두 값으로 표현하면 둘이 어긋날 수 있어 기각했다.
- **provider 이름을 자동 저장하거나 재로그인 때 덮어쓰기** — 사용자가 확인해
  정한 값을 외부 provider가 바꾸게 되므로 기각했다. 이름은 후보로만 채운다.
- **공개 프로필 필드 미리 만들기** — 제품 도메인이 정해지지 않았으므로
  username·avatar·bio 같은 필드를 선점하지 않는다.

## 현재 규칙

- `auth.users` 생성 트리거가 같은 경계에서 프로필을 만든다. 세션이 앱에
  돌아왔을 때 행이 없으면 온보딩이 아니라 데이터 무결성 오류다.
- 조회 실패, 행 없음, `display_name is null`을 서로 다른 상태로 다룬다.
  `display_name is null`만 첫 온보딩이며, 별도 완료 플래그는 없다.
- 사용자는 RLS 안에서 자기 행을 읽고 `display_name`만 수정한다. 이메일의
  원본은 Auth이고, 생성·삭제·이메일 변경은 클라이언트 권한이 아니다.
- 표시 이름은 입력칸에서 50 grapheme으로 제한한다. 앱과 DB가 같은 보이지
  않는 가장자리 문자를 잘라내며, DB의 500자 상한은 남용 방지 backstop이다.

근거가 되는 구현은
[`supabase/schemas/profiles.sql`](../../supabase/schemas/profiles.sql),
[`use-profile.ts`](../../apps/mobile/src/lib/use-profile.ts),
[`display-name.ts`](../../apps/mobile/src/lib/display-name.ts)에 있고, RLS·트리거·
삭제 cascade는
[`profiles_rls.test.sql`](../../supabase/tests/profiles_rls.test.sql)이 검증한다.

계정 삭제와 Apple 승인 취소의 경계는
[no-apple-token-revocation](no-apple-token-revocation.md)이 별도로 들고 있다.
