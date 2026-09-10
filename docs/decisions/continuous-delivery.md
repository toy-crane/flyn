# 검증과 내부 테스트 배포

## 결정

- PR에서 코드·타입·테스트를 검사하고, 모바일 네이티브 구성 차이는 fingerprint 라벨로 알린다. 라벨은 merge 전 검토 정보이며 배포 판정을 대신하지 않는다.
- 필요한 검사를 통과한 `main` 변경의 배포 순서는 GitHub Actions가 관리한다. Supabase 마이그레이션, 필요한 Edge Function, Hono의 Vercel 배포를 확인한 뒤 같은 커밋의 EAS Workflows를 실행한다.
- 모바일 배포는 EAS Workflows가 맡는다. 대상에 호환되는 배포용 빌드가 있으면 EAS Update를, 없으면 EAS Build·Submit을 사용한다. runtimeVersion은 fingerprint 정책으로 관리한다.
- 최초 자동 배포 범위는 iOS `Flyn Internal`과 내부 업데이트 채널이다. 운영 백엔드를 사용하며 상시 스테이징 DB와 Supabase 브랜치는 지금 만들지 않는다.
- 배포는 한 번에 하나씩 실행하고, 변경 없는 단계와 실패를 구분한다. 서버 배포 실패 후 앱을 배포하지 않는다. 외부 작업을 요청했다는 사실을 배포 완료로 표시하지 않는다.
- 이전 앱의 API·DB 접근과 데이터를 보존하는 변경을 먼저 배포한다. DB를 자동 롤백하지 않으며 파괴적 변경은 별도 검토·승인을 요구한다.
- 2026-09-10 사용자가 승인한 신규 서비스 전환에 한해 `episode_corrections`와 기존 교정 25개를 삭제하고 이전 교정 기능의 호환을 종료한다. 메시지 39개와 플레이 7개의 값·관계는 보존한다. 이 예외는 표현 결과 전환 마이그레이션에만 적용하며 다른 삭제나 향후 호환 종료를 허용하지 않는다.

## 경계

- DB PR 검증 범위는 [Supabase 스키마 작업 방식](supabase-schema-workflow.md)이 소유한다. 임시 DB의 검증에는 운영 비밀값이나 데이터를 사용하지 않는다.
- PR fingerprint는 iOS 기준으로 base와 head 각각의 잠금 파일과 같은 공개 환경 설정을 사용한다. Expo 설정 검증을 우회하지 않는다. 계산 작업은 읽기 전용이며 라벨 작업은 기본 브랜치의 코드만 실행한다. 계산 중에는 이전 결과 라벨을 지우고, 오류는 `Fingerprint:error`로 알린다. 라벨을 갱신하기 전에 최신 PR의 head와 base를 확인한다.
- base 브랜치에 새 커밋이 들어오면 해당 브랜치를 대상으로 열린 PR의 이전 fingerprint 라벨을 지운다. 다음 PR 계산이 끝나기 전에는 호환성을 표시하지 않는다. 외부 fork 결과는 신뢰한 비교값으로 게시하지 않고 `Fingerprint:error`로 표시한다. 같은 저장소의 계산 코드 변경도 리뷰 대상이며 라벨을 배포 승인이나 보안 증명으로 사용하지 않는다.
- 새 빌드 전에 EAS Update 설정이 필요하고, 테스터가 그 빌드를 설치해야 후속 OTA를 받을 수 있다. OTA와 TestFlight는 같은 배포 채널이 아니다.
- Vercel·Supabase·EAS의 독립적인 자동 실행이 전체 순서를 우회하거나 같은 대상을 중복 배포하지 않게 한다.
- 배포 대상 판정은 공유 패키지·루트 의존성과 실패 후 남은 변경을 포함한다. 문서만 바뀌면 배포하지 않는다.
- `deployment-state`의 상태 본문은 GitHub Secret의 HMAC 키로 서명한다. 서명이 없거나 본문과 맞지 않으면 어떤 성공 기록도 신뢰하지 않는다.
- 새 DB 마이그레이션이나 Edge Function 운영 설정이 있으면 `flyn-production-review` 환경에서 별도 승인을 받아야 한다. 같은 PR에 SQL 해시를 넣어도 이 승인을 대신하지 못한다. 그 외 변경은 `flyn-production-automatic` 환경에서 계속 자동 배포한다.
- `supabase/config.toml`에서는 `[functions.*]` 설정만 Edge 배포 대상으로 본다. 승인한 함수 설정은 함수 소스와 함께 배포하고 원격 설정·소스를 확인한 뒤 성공 기준을 전진시킨다. 로컬 포트와 Studio 설정은 운영 Edge 배포를 막지 않는다.
- 공개 출시, Android 스토어 배포, 강제 업데이트, 원격 CI E2E와 외부 알림 채널은 별도 결정이다. 공개 출시 전에는 내부·일반 사용자 업데이트 채널을 분리한다.

## 이유

EAS Update를 일상 배포에 사용하면 호환 빌드 조회와 새 빌드 분기를 반복하게 된다. 모바일 작업은 EAS에 맡기고, DB와 API 준비 상태는 GitHub에서 먼저 확인하면 앱이 아직 없는 서버 기능을 호출하는 순서 오류를 막을 수 있다. PR 라벨은 같은 변경의 검증 부담과 OTA 가능성을 합치기 전에 검토하도록 돕는다.

배포 순서만으로 이전 앱의 호환성을 지킬 수는 없다. TestFlight 설치와 OTA 수신은 기기마다 시점이 다르므로, 새 앱을 내보내더라도 옛 요청과 데이터 접근이 계속 유효해야 한다.

## 재검토 조건

- 공개 App Store 출시 또는 Android 배포를 시작할 때
- 내부 테스트가 운영 데이터와 분리된 원격 환경을 요구할 때
- 이전 앱 지원 종료나 파괴적인 API·DB 변경이 필요할 때
- 서로 다른 서비스의 독립 배포가 현재 순서보다 실질적인 이점을 줄 때

## 계속 제외하는 대안

- 서비스마다 `main`에서 독립 자동 배포: 서버 준비 전에 앱이 배포될 수 있다.
- PR 라벨만으로 OTA 결정: 실제 대상 빌드의 존재·배포 상태를 확인하지 못한다.
- 모든 변경을 새 앱으로 빌드: 호환되는 JS 변경에도 설치와 빌드 비용이 발생한다.
- 배포 실패 시 DB 자동 되돌리기: 이미 저장된 데이터와 기존 요청을 손상할 수 있다.

## 공식 문서

- [EAS Workflows 배포 예제](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/)
- [EAS Workflows 외부 실행](https://docs.expo.dev/eas/workflows/rest-api/)
- [Supabase 배포](https://supabase.com/docs/guides/deployment/managing-environments)
- [Vercel 배포](https://vercel.com/docs/cli/deploy)

구현 시 원본과 설치 버전을 다시 확인한다. 스펙의 완료 조건은 [내부 테스트 자동 배포](../specs/continuous-delivery/spec.md)가 정한다.
