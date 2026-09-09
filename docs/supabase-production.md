# Supabase 운영 배포

## 프로젝트

- 조직: ODD (`doeklaqqvlojxjhvemzg`)
- 프로젝트: `flyn` (`owtajtnfleiobyfocdjy`)
- 지역: 서울 (`ap-northeast-2`)
- 사양: Micro. 기존 Pro 조직에 추가하며 월 약 $10의 컴퓨팅 비용을 승인받았다.
- Dashboard: https://supabase.com/dashboard/project/owtajtnfleiobyfocdjy
- API URL: https://owtajtnfleiobyfocdjy.supabase.co
- 별도 스테이징 프로젝트와 브랜치는 만들지 않았다.
- SMTP는 기본값을 유지한다. 조직 구성원 이메일로만 인증 메일을 받을 수 있다.
- DB 비밀번호는 macOS 키체인의 서비스 `flyn-supabase-production-db`, 계정
  `flyn`에 보관한다. 비밀번호와 비밀 키는 저장소에 기록하지 않는다.

## 2026-09-09 최초 배포

- CLI로 프로젝트를 생성하고 이 worktree를 연결했다.
- 저장소에 고정된 Supabase CLI 2.113.0으로 마이그레이션 10개와 seed를 적용했다.
- 공식 스토리 5개, 에피소드 25개, 표지 이미지 5개를 확인했다.
- `delete-account` Edge Function을 JWT 검증을 유지한 채 배포했다.
- 비로그인 함수 호출은 HTTP 401, 공개 표지 URL은 HTTP 200을 반환했다.
- 모든 public 테이블에 RLS가 켜져 있다. 검증 시 Auth 사용자는 0명이었다.
- 재실행한 `db push --linked --dry-run`에서 미적용 마이그레이션은 없었다.

## 앱 연결 전 해결할 항목

초기 업로드는 끝났지만 운영 사용 준비가 끝난 상태는 아니다.

1. 원격 기본 권한이 저장소의 전제와 다르다. 원격 테이블에는 `anon` SELECT와
   의도하지 않은 `authenticated` CRUD 권한이 남아 있다. 함수에도 세 API 역할의
   직접 EXECUTE 권한이 남아 있어 `REVOKE ... FROM PUBLIC`만으로 회수되지 않는다.
   `has_table_privilege`, `has_function_privilege`, `proacl` 조회로 확인했다.
   RLS가 켜졌다는 사실만으로 열 단위 쓰기 제한까지 보장하지 못한다.
   원격 기본 권한을 반영한 선언형 원본과 전진 마이그레이션, 권한 테스트가 필요하다.
   이미 적용한 마이그레이션을 수정하거나 원격만 수동 보정하지 않는다.
2. 원격 pgTAP 테스트는 `plan(integer)` 함수가 없어 테스트 0개로 종료됐다.
   테스트 통과로 기록하지 않는다. 테스트 확장을 준비한 검증 경로가 필요하다.
3. 원격 Apple·Google 제공자, 이메일 OTP 6자리와 두 이메일 템플릿은 아직 설정·검증하지
   않았다. 기본 SMTP 유지와 앱의 코드 로그인 템플릿 설정은 별개다.
4. 실제 가입, 프로필 수정, 에피소드 진행과 계정 삭제는 아직 검증하지 않았다.

`supabase/config.toml` 전체를 운영에 push하지 않는다. 로컬 URL,
`email_sent = 200`, `enable_confirmations = false`는 로컬 전용 값이다.
