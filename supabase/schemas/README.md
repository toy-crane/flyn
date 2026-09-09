# 선언형 스키마

이 디렉터리의 `.sql` 파일이 데이터베이스 구조의 원본입니다. 원하는 최종
상태를 여기에 적고, 마이그레이션은 `supabase db diff -f <descriptive-name>`으로
생성합니다. 마이그레이션 파일을 먼저 손으로 쓰지 마세요.

## 실행 순서

`supabase/config.toml`의 `[db.migrations] schema_paths`가 `./schemas/*.sql`을
읽고, 파일은 이름의 사전순으로 실행합니다. 순서를 이름만으로 읽을 수 있도록 두 자리
숫자 접두사를 사용합니다.

```text
10-extensions.sql
20-username-rules.sql
30-tables.sql
50-functions.sql
60-policies.sql
```

번호는 자리를 나눌 뿐이고 빈 번호를 채우지 않습니다. 새 파일은 자기가 만드는
객체가 무엇에 기대는지를 보고 번호를 고릅니다. `20-username-rules.sql`이 함수인데도
30번대 앞에 있는 이유가 이것입니다. `public.profiles`의 check 제약이 이 함수를
부르므로 테이블보다 먼저 있어야 합니다.

사전순 위치보다 먼저 실행해야 하는 파일이 생기면 `schema_paths`의 glob 위에 그
파일 경로를 명시적으로 추가하세요.

## 새 테이블을 추가할 때: 권한

필요한 `GRANT`를 적고 RLS를 켜세요. 원격에는 전체 CRUD 기본 권한이 남을 수 있습니다.
열 단위로 INSERT 또는 UPDATE를 제한한다면 해당 역할의 테이블 전체 권한을 먼저
회수하세요. `REFERENCES`·`TRIGGER`·`TRUNCATE`·`MAINTAIN`은 그대로 둡니다.

**함수는 PUBLIC뿐 아니라 API 역할에 직접 EXECUTE가 부여될 수 있습니다.**
새 함수마다 기본 실행 권한을 회수한 뒤 필요한 역할만 허용하세요.

```sql
revoke all on function public.<name>(<args>) from public, anon, authenticated, service_role;
grant execute on function public.<name>(<args>) to authenticated;  -- 부를 역할만
```

근거와 재검토 조건은 [Supabase 스키마 작업 방식](../../docs/decisions/supabase-schema-workflow.md)에
있습니다.

## 이 디렉터리에 두지 않는 것

- DML, backfill, seed 데이터: `supabase/seed.sql` 또는 별도 버전 관리 마이그레이션
- 선언형 diff가 표현하지 못하는 객체: 생성된 마이그레이션에 수동으로 보완

자세한 절차는 저장소 루트 `README.md`의 "Supabase 스키마 변경" 절을
따르세요.
