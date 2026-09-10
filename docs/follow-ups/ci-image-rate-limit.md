# DB 검사가 이미지 저장소의 요청 제한으로 실패한다

**Symptom**: SQL 검사를 통과한 GitHub DB 검사가 타입 생성 도구 이미지를 받다가 실패한다.

**Observed evidence**: 2026-09-10 실행 `34433063768`에서 pgTAP 318개가 통과한 뒤 `public.ecr.aws/supabase/postgres-meta:v0.96.8` 다운로드가 `toomanyrequests: Rate exceeded`로 실패했다. 실행 `34427601260` 전의 PR 검사에서도 같은 요청 제한을 확인했다.

**Suspected cause**: 공유 GitHub runner의 공개 ECR 요청 한도다. SQL·생성 타입 불일치로 확인된 실패는 아니다.

**What was tried**: 실패한 검사만 재실행했다. 검사를 건너뛰거나 운영 DB를 사용하지 않았다.

**Proposed next step**: 재발하면 고정된 도구 이미지의 사전 다운로드·캐시 또는 공식 대체 저장소를 검토한다. 다운로드 재시도와 SQL 재실행을 분리하고, 실제 SQL 실패는 그대로 차단한다.
