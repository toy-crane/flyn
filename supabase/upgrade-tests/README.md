# 기존 데이터 보존 검사

마이그레이션이 기존 행을 바꾸면 같은 버전의 폴더에 보존 검사를 둡니다.
데이터 변환, 열 타입 변경, 기존 행에 적용되는 제약 조건이 여기에 해당합니다.
보존 검사가 필요한지는 리뷰에서 판단하고, CI는 폴더에 두 파일이 있을 때만
실행합니다. 기존 마이그레이션은 수정하지 않습니다.

```text
supabase/
  migrations/<version>_<name>.sql
  upgrade-tests/<version>/
    before.sql
    after.test.sql
```

- `before.sql`: 대상 바로 이전 마이그레이션의 스키마에서 합성 데이터를 넣습니다.
  운영 데이터를 사용하거나 현재 seed를 가져오지 않습니다. 비교에 필요하면
  테스트 전용 스키마에 기존 값을 저장합니다.
- `after.test.sql`: 대상부터 현재 커밋까지 마이그레이션을 적용한 뒤 실행할
  pgTAP 테스트입니다. 행 수뿐 아니라 ID, 관계와 실제 값을 확인합니다.
  `plan`과 `finish`를 포함하고 테스트가 실패하면 종료 코드가 실패하도록 합니다.
- 두 파일은 함께 둡니다. 하나만 있거나 내용이 비어 있으면 CI가 실패합니다.
- 각 사례는 별도로 초기화합니다. 끝나면 임시 DB만 정리합니다.

PR 검사는 새 마이그레이션과 변경된 보존 검사의 버전을 고르고, 그중 두 파일이
있는 버전만 실행합니다. 과거 사례를 매 DB PR마다 실행하지 않습니다.

로컬에서 특정 사례만 확인할 때는 저장소 루트에서 실행합니다.

```sh
bun scripts/ci/database.ts upgrade 20260908155308
```

CI와 같은 비교 범위의 기본 검사와 보존 검사는 다음과 같이 실행합니다.
커밋한 변경을 기준으로 대상을 고르므로 먼저 변경을 커밋해야 합니다.

```sh
bun scripts/ci/database.ts verify <base-sha> HEAD
```

`verify`에 비교 범위를 생략하면 기존 기본 검사만 실행합니다.

## 데이터를 지우는 문장

테이블 삭제, 열 삭제, TRUNCATE CASCADE처럼 데이터가 사라지는 문장은 보존
검사 대신 PR에서 사람의 승인을 받습니다. 마이그레이션을 쓰는 쪽이 문장 바로
윗줄에 무엇이 사라지고 왜 지워도 되는지, 사용자가 언제 결정했는지 적습니다.

```sql
-- 삭제 이유: 교정 25건은 표현 돌아보기로 옮겼다.
-- 2026-09-10 사용자가 신규 전환에 한해 삭제를 승인했다.
drop table public.episode_corrections;
```

PR의 `Destructive migration approval` 검사가 squawk로 새 마이그레이션에서 이런
문장을 찾아 PR 댓글에 위치를 남깁니다. 사람이 이유를 읽고
`DB:destructive-approved` 라벨을 붙이면 통과하고, 새 커밋을 push하면 라벨이
떨어집니다. 이 규칙을 끄는 `squawk-ignore` 주석은 검사가 받지 않습니다.
규칙은 [Supabase 스키마 작업 방식](../../docs/decisions/supabase-schema-workflow.md)이
정합니다.

PR을 올리기 전에 저장소 루트에서 같은 검사 결과를 미리 볼 수 있습니다.

```sh
bunx squawk-cli@2.65.0 --config .squawk.toml supabase/migrations/<version>_<name>.sql
```

보존 검사와 이유 주석의 충실성은 코드 리뷰 대상입니다. squawk가 아무것도
찾지 못했다고 위험이 없다는 뜻은 아닙니다. 합성 데이터의 통과는 운영 규모의
잠금 시간과 모든 데이터 형태를 보장하지 않습니다.
