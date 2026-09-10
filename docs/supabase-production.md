# Supabase 운영 배포

## GitHub 배포 인증

- 2026-09-10: Flyn 전용 키체인의 DB 비밀번호를 `toy-crane/flyn` 저장소의 `SUPABASE_DB_PASSWORD` Secret에 등록했다. 값은 파일이나 로그에 남기지 않았다.
- 사용자가 계정 전체 권한의 classic PAT 사용을 승인하고 직접 발급해 `SUPABASE_ACCESS_TOKEN` Secret에 등록했다. 2026-09-10 01:21:05 UTC 등록 시각을 확인했다. 기존 로컬 CLI 토큰을 복사하지 않았으며 새 토큰의 값과 정확한 만료일은 읽지 않았다.
- 계정의 실제 토큰 생성 화면에는 이름과 만료만 있으며 프로젝트·권한 제한 선택이 없었다. 토큰 권한과 무관하게 자동화의 작업 대상은 Flyn 프로젝트로 제한한다.
- `Deployment access` 수동 workflow는 `main`에서 새 Secret으로 Flyn 연결과 `db push --linked --dry-run`을 검사한다. PR에는 운영 비밀값을 제공하지 않는다. 이 검사는 마이그레이션·seed·Auth 설정을 적용하지 않으며 실제 배포 성공을 증명하지 않는다.
- [실제 GitHub 실행 34425985225](https://github.com/toy-crane/flyn/actions/runs/34425985225)이 커밋 `3efd17ccb7d1a2b4733d390cb2d02a5136792ac4`에서 통과했다. 새 Secret으로 프로젝트 연결과 DB 이력 조회를 확인했다. 미적용 항목은 `20260909123219_story_cover_blurhash.sql` 하나이며 적용하지 않았다.

## DB 배포 실행

- `.github/workflows/deploy.yml`은 현재 DB 단계만 수동 실행한다. 전체 자동 배포와 API·EAS 연결 완료를 뜻하지 않는다.
- 같은 SHA의 필수 검사 두 개가 성공해야 시작한다. `deployment-state` 브랜치에 요청과 확인 결과를 기록하며, 없는 기록을 성공 이력으로 추정하지 않는다.
- `supabase/deployment-approvals.json`은 검토한 미적용 SQL의 버전과 SHA-256을 연결한다. SQL이 바뀌면 기존 해시로 배포할 수 없다. 위험한 변경의 별도 승인을 이 목록이나 `impact.json`으로 대신하지 않는다.
- 첫 허용 항목은 nullable text 열 추가인 `20260909123219`다. 전용 Supabase 검토에서 actionable finding이 없었고 기존 앱의 NULL 처리를 확인했다. 운영 잠금 시간과 실제 이전 앱 동작은 별도 검증 대상이다. seed·Storage·Auth 변경은 포함하지 않는다.

## 프로젝트 정보

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

1. [해결] 원격 기본 권한이 저장소의 전제와 달랐다. 원격 테이블에는 `anon` SELECT와
   의도하지 않은 `authenticated` CRUD 권한이 남아 있다. 함수에도 세 API 역할의
   직접 EXECUTE 권한이 남아 있어 `REVOKE ... FROM PUBLIC`만으로 회수되지 않는다.
   `has_table_privilege`, `has_function_privilege`, `proacl` 조회로 확인했다.
   RLS가 켜졌다는 사실만으로 열 단위 쓰기 제한까지 보장하지 못한다.
   원격 기본 권한을 반영한 선언형 원본과 전진 마이그레이션, 권한 테스트를 추가하고 운영에 적용했다.
   이미 적용한 마이그레이션을 수정하거나 원격만 수동 보정하지 않는다.
2. 원격 pgTAP 테스트는 `plan(integer)` 함수가 없어 테스트 0개로 종료됐다.
   테스트 통과로 기록하지 않는다. 테스트 확장을 준비한 검증 경로가 필요하다.
3. 원격 Apple·Google 제공자, 이메일 OTP 6자리와 두 이메일 템플릿은 아직 설정·검증하지
   않았다. 기본 SMTP 유지와 앱의 코드 로그인 템플릿 설정은 별개다.
4. 실제 가입, 프로필 수정, 에피소드 진행과 계정 삭제는 아직 검증하지 않았다.

`supabase/config.toml` 전체를 운영에 push하지 않는다. 로컬 URL,
`email_sent = 200`, `enable_confirmations = false`는 로컬 전용 값이다.

## 권한 보완 마이그레이션 준비

`20260909053318_restrict_client_write_and_function_grants.sql`을 추가했다.
2026-09-09 운영에 적용했다. 함수 호출 허용 목록과 열 단위 쓰기 제한만 보완하며,
기본 ACL, RLS와 나머지 테이블 권한은 변경하지 않는다.

- 넓은 권한을 재현한 별도 로컬 DB에서 새 테스트 40개 중 34개가 수정 전 실패했다.
- 새 마이그레이션 적용 후 40개 모두 통과했다.
- 전체 재생 후 DB 테스트 310개와 public 스키마 lint가 통과했다.

검증 중 CLI 2.113.0의 `db reset --db-url`에 별도 로컬 DB 주소를 지정했지만,
결과는 `target: local`이었고 기존 `supabase_db_flyn`이 재생성됐다.
기존 로컬 DB를 보존하려던 의도와 달리 초기화가 일어났다. 초기화 전 사용자 수는
확인하지 못했으며, 이후 사용자 수는 0명이다. 확인한 Docker 볼륨·DB 디렉터리와
저장소에서 복구용 백업은 찾지 못했다. 이 검증 당시 운영 DB에는 reset이나 권한 보완을 실행하지 않았다.
이 CLI에서 `--db-url`만으로 reset 대상을 격리한다고 가정하지 않는다.

## 2026-09-09 후속 마이그레이션 배포

- `db push --linked --dry-run`으로 대상을 확인한 뒤 권한 보완과
  `20260909053746_generate_content_ids.sql`을 적용했다. reset은 실행하지 않았다.
- 스토리 5개와 에피소드 25개가 유지됐고, 두 테이블의 ID 목록 지문이 적용 전후 같았다.
- 두 테이블의 ID 기본값이 `gen_random_uuid()`로 설정됐다. seed는 재실행하지 않았다.
- `authenticated`의 profiles 전체 UPDATE와 story_plays 전체 INSERT는 차단되고,
  display_name UPDATE와 story_id INSERT는 허용되는 것을 확인했다.
- username_status 함수는 anon 호출이 차단되고 authenticated 호출은 허용된다.
- 배포 후 dry-run에서 미적용 마이그레이션이 없었다. 실제 로그인과 사용자 흐름 검증은 남아 있다.
