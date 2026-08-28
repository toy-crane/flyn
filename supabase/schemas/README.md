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

필요한 `GRANT`만 적고 RLS를 켜세요. `REVOKE`는 쓰지 않습니다.

이 데이터베이스는 `public`의 새 테이블을 Data API 역할에 자동으로 열지 않습니다.
새 테이블은 `anon`과 `authenticated`에 `REFERENCES`·`TRIGGER`·`TRUNCATE`만 주고
PostgREST가 부를 수 있는 권한은 주지 않습니다. 그래서 적어 둔 `GRANT`가 그 테이블에
닿을 수 있는 전부입니다. 남는 세 권한은 PostgREST에 경로가 없어 그대로 둡니다.

**함수는 다릅니다.** `create function`은 지금도 `PUBLIC`에 `EXECUTE`를 주고
`anon`과 `authenticated`가 이를 물려받습니다. 그러니 새 함수마다 이렇게 적으세요.

```sql
revoke all on function public.<name>(<args>) from public;
grant execute on function public.<name>(<args>) to authenticated;  -- 부를 역할만
```

근거와 재검토 조건은 [Supabase 스키마 작업 방식](../../docs/decisions/supabase-schema-workflow.md)에
있습니다.

## 이 디렉터리에 두지 않는 것

- DML, backfill, seed 데이터: `supabase/seed.sql` 또는 별도 버전 관리 마이그레이션
- 선언형 diff가 표현하지 못하는 객체: 생성된 마이그레이션에 수동으로 보완

자세한 절차는 저장소 루트 `README.md`의 "Supabase 스키마 변경" 절을
따르세요.
