# 검증과 내부 테스트 배포

## 결정

- PR에서 코드·타입·테스트를 검사하고, 모바일 네이티브 구성 차이는 fingerprint 라벨로 알린다. 라벨은 merge 전 검토 정보이며 배포 판정을 대신하지 않는다.
- 필요한 검사를 통과한 `main` 변경의 배포 순서는 GitHub Actions가 관리한다. Supabase 마이그레이션, 필요한 Edge Function, Hono의 Vercel 배포를 확인한 뒤 같은 커밋의 EAS Workflows를 실행한다.
- 모바일 배포는 EAS Workflows가 맡는다. 대상에 호환되는 배포용 빌드가 있으면 EAS Update를, 없으면 EAS Build·Submit을 사용한다. runtimeVersion은 fingerprint 정책으로 관리한다.
- 최초 자동 배포 범위는 iOS `Flyn Internal`과 내부 업데이트 채널 `internal`이다. 운영 백엔드를 사용하며 상시 스테이징 DB와 Supabase 브랜치는 지금 만들지 않는다.
- 배포는 한 번에 하나씩 실행하고, 변경 없는 단계와 실패를 구분한다. 서버 배포 실패 후 앱을 배포하지 않는다. 외부 작업을 요청했다는 사실을 배포 완료로 표시하지 않는다.
- 이전 앱의 API·DB 접근과 데이터를 보존하는 변경을 먼저 배포한다. DB를 자동 롤백하지 않는다.
- 운영 배포의 사람 승인은 PR을 `main`에 합치는 것 하나다. 2026-09-11 사용자가 정했다. `main`에 들어간 커밋은 다시 묻지 않고 끝까지 배포한다. 파괴적 마이그레이션의 승인은 merge 전에 PR에서 받으며, 그 방식은 [Supabase 스키마 작업 방식](supabase-schema-workflow.md)이 정한다.
- 운영 배포의 유일한 복구 경로는 실패한 실행을 다시 실행하거나 새 커밋을 합치는 것이다. 사람이나 에이전트가 CLI로 운영 서비스를 직접 올리지 않는다. 손으로 올린 배포는 요청 ID가 없어 파이프라인이 이어받지 못한다.

### 워크플로 구조

- 검사와 배포는 `.github/workflows/ci.yml` 하나가 PR과 `main` push에서 실행한다. 배포 잡은 같은 실행의 게이트 잡에 `needs`로 잇고, 다른 실행의 검사 결과를 조회하며 기다리지 않는다.
- `fingerprint.yml`은 PR마다 iOS fingerprint를 계산하고, `fingerprint-labels.yml`은 `main`의 코드로 라벨만 쓴다. 둘은 `ci.yml`과 따로 둔다. 파괴적 마이그레이션 감지와 Codex 리뷰 확인은 라벨 이벤트와 Codex 댓글 이벤트에 반응하는 별도의 작은 PR 워크플로가 맡고, `ci.yml`은 라벨 이벤트로 다시 돌지 않는다. 운영 연결만 읽어 보던 수동 워크플로는 두지 않는다.
- 게이트 잡 이름 `Required validation`과 `Required database validation`은 브랜치 보호의 필수 검사 이름이므로 바꾸지 않는다. 게이트는 항상 실행하고, 선행 잡이 정당하게 건너뛰었을 때만 통과한다. 실패, 취소, 판정 잡 실패는 통과로 처리하지 않는다.
- PR 실행은 PR 번호별 그룹에서 진행 중인 실행을 취소한다. `main` 실행은 운영 그룹에서 취소하지 않는다. 대기 중인 `main` 실행은 더 새 실행에 밀릴 수 있다.
- 운영 배포 잡은 GitHub 환경 `production` 하나를 쓴다. 이 환경은 보호된 브랜치에서만 배포하도록 두고 필수 승인자를 두지 않는다. `main`은 PR 필수를 켜서 PR을 거치지 않은 push를 받지 않는다.
- Bun 설치 캐시는 `bun.lock` 해시로 보존한다. `vercel`과 `eas-cli`는 배포 잡에서만 고정 버전으로 설치해 캐시하고 루트 의존성에 넣지 않는다. 액션은 커밋 SHA로 고정한다.

### 변경 판정과 배포 상태

- 기준 커밋은 PR이면 base, `main`이면 같은 워크플로의 마지막 성공한 `main` 실행의 커밋이다. 성공한 실행이 없으면 모든 서비스를 대상으로 본다.
- workspace 패키지의 영향은 `turbo query affected`로 판정한다. `@repo/api`가 있으면 API, `@repo/mobile`이 있으면 모바일이 배포 대상이다. 공유 패키지와 루트 의존성의 영향도 이 명령이 판정한다. checkout은 전체 이력을 받는다. 얕은 checkout이면 모든 패키지가 영향받은 것으로 잡힌다.
- workspace 밖 경로는 따로 본다. `supabase/migrations`와 `supabase/config.toml`의 `[functions.*]` 설정은 DB와 Edge 대상이다. `.github/`, `scripts/`, 루트 설정이 바뀌면 전체 검사를 돌린다. 로컬 포트와 Studio 설정은 운영 Edge 배포를 막지 않는다.
- 영향 패키지도 위 경로 변경도 없으면 문서만 바뀐 것으로 본다. 검사 잡을 건너뛰고 게이트만 통과시키며 배포 잡을 만들지 않는다. fingerprint 계산은 문서만 바뀐 PR에서도 한다.
- 배포 상태를 저장소 안의 파일로 기록하지 않는다. 이미 올라간 것과 진행 중인 것은 각 서비스에 묻는다. Vercel은 배포 메타의 커밋과 요청 ID, Edge는 함수 소스에 새긴 커밋과 원격 설정, EAS는 실행의 커밋과 요청 ID, DB는 원격 마이그레이션 이력으로 확인한다. 서비스가 모르는 성공 기록은 신뢰하지 않는다.
- 서비스별 건너뛰기는 그 서비스가 알려 준 커밋을 기준으로 diff한다. 알려 주지 못하면 GitHub 실행 이력의 기준 커밋을 쓴다. 앞선 실행이 API에서 실패했어도 이미 올라간 Edge를 다시 배포하지 않는다. 함수 설정은 함수 소스와 함께 배포하고 원격 설정·소스를 확인한 뒤 성공으로 본다.
- 응답이 끊긴 뒤 다시 실행하면 같은 커밋과 요청 ID의 원격 작업을 찾아 이어받고 새 요청을 만들지 않는다. 이미 올라간 것보다 옛 커밋은 배포하지 않으며 조상 관계로 판정한다. 원격에만 있는 마이그레이션 버전을 만나면 실패로 멈춘다.
- seed·콘텐츠와 Auth 설정은 매 배포마다 덮어쓰지 않는다. 명시적으로 검토한 배포 대상으로 다룬다.

### 모바일 배포

- 성공한 빌드가 있다는 것과 테스터가 설치할 수 있다는 것을 구분한다. 제출 실패나 Apple 처리 대기를 배포 완료로 표시하지 않는다.
- 빌드·fingerprint·업데이트는 같은 대상의 환경 설정을 명시적으로 쓴다. 개발자의 로컬 환경 파일이나 설정 검증 우회값을 배포에 쓰지 않는다.
- EAS 환경과 업데이트 채널은 다른 개념이다. 채널을 나눈다고 DB가 격리되지 않는다. GitHub 환경 `production`과 EAS 환경 `production`도 이름만 같은 다른 것이다.

## 경계

- DB PR 검증 범위는 [Supabase 스키마 작업 방식](supabase-schema-workflow.md)이 소유한다. 임시 DB의 검증에는 운영 비밀값이나 데이터를 사용하지 않는다.
- CI 코드 리뷰 도구는 [CI 코드 리뷰](ci-code-review.md)가 정한다.
- PR fingerprint는 iOS 기준으로 base와 head 각각의 잠금 파일과 같은 공개 환경 설정을 사용한다. Expo 설정 검증을 우회하지 않는다. 계산 작업은 읽기 전용이며 라벨 작업은 기본 브랜치의 코드만 실행한다. 계산 중에는 이전 결과 라벨을 지우고, 오류는 `Fingerprint:error`로 알린다. 라벨을 갱신하기 전에 최신 PR의 head와 base를 확인한다.
- `main`에 새 커밋이 들어오면 `main`을 대상으로 열린 PR의 이전 fingerprint 라벨을 지운다. PR은 `main`만 대상으로 열며, 다른 base 브랜치를 쓰기 시작하면 라벨 워크플로의 트리거를 다시 넓힌다. 다음 PR 계산이 끝나기 전에는 호환성을 표시하지 않는다. 외부 fork 결과는 신뢰한 비교값으로 게시하지 않고 `Fingerprint:error`로 표시한다. 같은 저장소의 계산 코드 변경도 리뷰 대상이며 fingerprint 라벨을 배포 승인이나 보안 증명으로 사용하지 않는다. 파괴적 마이그레이션의 승인 라벨은 다른 라벨이며 사람만 붙인다.
- 새 빌드 전에 EAS Update 설정이 필요하고, 테스터가 그 빌드를 설치해야 후속 OTA를 받을 수 있다. OTA와 TestFlight는 같은 배포 채널이 아니다. EAS Update는 모든 기기에 즉시 적용되는 강제 업데이트가 아니다.
- 운영 공개 환경 변수는 EAS production 환경과 GitHub 저장소 변수에 따로 있고 자동으로 맞춰지지 않는다. 한쪽을 바꾸면 다른 쪽도 함께 바꾼다.
- Vercel·Supabase·EAS의 독립적인 자동 실행이 전체 순서를 우회하거나 같은 대상을 중복 배포하지 않게 한다.
- 공개 출시, Android 스토어 배포, 강제 업데이트, 원격 CI E2E와 외부 알림 채널은 별도 결정이다. 공개 출시 전에는 내부·일반 사용자 업데이트 채널을 분리한다.

## 이유

EAS Update를 일상 배포에 사용하면 호환 빌드 조회와 새 빌드 분기를 반복하게 된다. 모바일 작업은 EAS에 맡기고, DB와 API 준비 상태는 GitHub에서 먼저 확인하면 앱이 아직 없는 서버 기능을 호출하는 순서 오류를 막을 수 있다. PR 라벨은 같은 변경의 검증 부담과 OTA 가능성을 합치기 전에 검토하도록 돕는다.

배포 순서만으로 이전 앱의 호환성을 지킬 수는 없다. TestFlight 설치와 OTA 수신은 기기마다 시점이 다르므로, 새 앱을 내보내더라도 옛 요청과 데이터 접근이 계속 유효해야 한다.

검사와 배포를 한 실행에 두면 `needs`가 같은 커밋을 보장한다. 각 서비스는 자기에게 올라간 커밋을 이미 알고 있으므로, 저장소 안에 따로 적은 배포 기록은 같은 사실을 둘로 늘릴 뿐이다.

merge 뒤의 승인은 새 정보 없이 한 번 더 묻는 클릭이다. PR 검사와 `main` 검사가 같은 워크플로이고 브랜치 보호가 PR을 `main`과 최신 상태로 유지하므로, 검사한 트리와 합쳐진 커밋이 같다. 승인 화면에는 SQL이 보이지 않아 읽을 자리는 어차피 PR이다. 조사한 기준선(Supabase 공식 환경 가이드와 Branching, squawk, Atlas, strong_migrations)도 모두 PR을 게이트로 두고 merge 뒤에는 자동 배포한다.

## 재검토 조건

- 공개 App Store 출시 또는 Android 배포를 시작할 때
- 내부 테스트가 운영 데이터와 분리된 원격 환경을 요구할 때
- 이전 앱 지원 종료나 파괴적인 API·DB 변경이 필요할 때
- 서로 다른 서비스의 독립 배포가 현재 순서보다 실질적인 이점을 줄 때
- 어떤 서비스가 자신에게 올라간 커밋을 더 이상 알려 주지 못할 때
- 운영 배포를 승인하는 사람이 둘 이상이 될 때

## 계속 제외하는 대안

- 서비스마다 `main`에서 독립 자동 배포: 서버 준비 전에 앱이 배포될 수 있다.
- PR 라벨만으로 OTA 결정: 실제 대상 빌드의 존재·배포 상태를 확인하지 못한다.
- 모든 변경을 새 앱으로 빌드: 호환되는 JS 변경에도 설치와 빌드 비용이 발생한다.
- 배포 실패 시 DB 자동 되돌리기: 이미 저장된 데이터와 기존 요청을 손상할 수 있다.
- 저장소 안에 서명한 배포 상태 파일 두기: 처음의 구조였다. 서비스와 GitHub 실행 이력이 같은 사실을 이미 알고 있어 기록이 둘로 늘고, 서명 키와 검증 코드가 따라온다.
- 검토한 SQL의 SHA-256 목록을 저장소에 두기: PR 승인과 같은 일을 두 번 한다.
- merge 뒤 GitHub 환경 승인으로 DB·Edge 배포 막기: 2026-09-10부터 하루 썼다. 승인 화면에 SQL이 없고, 앞선 실행이 실패하면 기준 커밋이 없어 마이그레이션 없는 커밋도 두 번 승인해야 했다(실행 #81). 에이전트가 merge를 대신할 수 있게 되면서 merge와 승인이 같은 사람의 같은 판단이 됐다.
- 배포 잡이 다른 워크플로의 검사 결과를 API로 조회해 기다리기: 같은 실행의 `needs`가 같은 커밋을 보장하며 대기 코드가 필요 없다.
- 트리거의 `paths-ignore`로 문서 변경 건너뛰기: 필수 검사가 Pending으로 남아 PR을 합칠 수 없다. 워크플로 안에서 판정하고 게이트 잡은 항상 실행한다.
- `fingerprint.yml`을 `ci.yml`에 합치기: PR 제목이나 base가 바뀔 때도 다시 계산해야 하고, 라벨 워크플로가 이 워크플로의 이름과 아티팩트를 보고 동작하며, 계산과 라벨 쓰기의 권한 분리가 깨진다.
- `concurrency.queue`를 식으로 만든 `group`과 함께 쓰기: GitHub이 워크플로 파일을 읽지 못해 잡 하나 없이 실패했다.

## 보존할 근거

- 공식 문서: [EAS Workflows 배포 예제](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/), [EAS Workflows 외부 실행](https://docs.expo.dev/eas/workflows/rest-api/), [Supabase 배포](https://supabase.com/docs/guides/deployment/managing-environments), [Vercel 배포](https://vercel.com/docs/cli/deploy)
- 2026-09-11 기준선 조사. Supabase 공식 [환경 관리](https://supabase.com/docs/guides/deployment/managing-environments)와 [GitHub 연동](https://supabase.com/docs/guides/deployment/branching/github-integration)은 PR 필수 검사와 merge 뒤 자동 `db push`만 두고 별도 승인이 없다. 파괴적 변경은 린터가 잡는다. [squawk](https://squawkhq.com/docs/rules)는 무료이고 PR 댓글을 남기며 문장별 무시 주석을 둔다. [Atlas](https://atlasgo.io/lint/analyzers)는 같은 구조에 `-- atlas:nolint` 주석을 쓰고 2025년 10월부터 유료다. Bytebase만 rollout 이슈와 DBA 승인을 merge 앞에 둔다. 배포 뒤 승인은 어디에도 없었다.
- 2026-09-10과 11에 CLI로 운영 API를 두 번 손수 올렸다. 요청 ID가 없어 파이프라인 조회에 잡히지 않는 배포였다.
- Vercel 프로젝트 한정 토큰으로는 `vercel pull`이 `User not found (404)`로 실패한다. 그래서 프로젝트 API로 빌드 설정만 읽고, 빈 CLI 인증 폴더에서 토큰 없이 빌드한 뒤 `@vercel/client`로 prebuilt 결과를 배포한다. 토큰 범위를 넓히는 방식은 택하지 않았다.
- DB 검사가 받는 Supabase 이미지는 `ghcr.io`에서 가져온다. 기본 저장소에서는 이미지 요청 제한으로 DB 검사가 실패했다.
- Bun 1.3.6은 Linux ARM64에서 잠금 파일 설치가 종료 코드 137로 끝났고, 1.4.0은 같은 잠금 파일을 설치했다. CI와 로컬, EAS 프로필이 1.4.0을 쓴다.
- EAS의 두 분기(같은 fingerprint의 TestFlight 빌드를 재사용한 Update, 호환 빌드가 없을 때의 Build·Submit)는 원격 실행으로 확인했다. 실제 iPhone에서 첫 Update 지원 빌드를 설치한 뒤 OTA를 받는 것과 Metro 없는 셀룰러 환경의 로그인·기록 조회·AI 응답은 확인하지 않았다.
