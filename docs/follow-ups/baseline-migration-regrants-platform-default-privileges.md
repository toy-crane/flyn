# 기준 이력이 플랫폼 기본 권한을 명시적 GRANT로 다시 준다

**Symptom**: `supabase/migrations/20260828114642_baseline_schema.sql`이 `public`의
일곱 테이블마다
`GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON <table> TO anon;`을 적어 둔다.
[Supabase 스키마 작업 방식](../decisions/supabase-schema-workflow.md)은 이 네 권한을
"플랫폼 기본값이 주는 것을 그대로 받아들인다"로 정했는데, 이력은 받아들이는 대신
직접 준다. 그래서 플랫폼이 나중에 기본값을 더 좁혀도 이 이력을 재생한 데이터베이스는
계속 네 권한을 갖는다. 계약의 재검토 조건("자동 노출 차단 동작이 로컬 관찰과 다르게
바뀔 때")이 걸려도 이력이 스스로 되돌지 않는다.

`MAINTAIN`은 PostgreSQL 17에서 생긴 권한이다. `supabase/config.toml`이
`major_version = 17`로 고정하고 원격도 없으므로 지금 깨지는 경로는 없지만, 16 이하
데이터베이스에 이 이력을 재생하면 `unrecognized privilege type: "MAINTAIN"`으로
즉시 실패한다.

**Observed evidence**: 2026-08-28 로컬 스택에서 확인했다.

```bash
grep -c "GRANT MAINTAIN" supabase/migrations/20260828114642_baseline_schema.sql   # 14
```

빈 데이터베이스에 새 테이블을 만들면 플랫폼 기본값이 같은 네 권한을 준다.

```
anon          | REFERENCES,TRIGGER,TRUNCATE
authenticated | REFERENCES,TRIGGER,TRUNCATE
```

`pg_default_acl`에는 `anon=Dxtm/postgres`로 들어 있다(`m`이 MAINTAIN). 즉 이력의
GRANT가 없어도 결과 상태는 같다. 지금 동작에는 차이가 없고, `db reset` 재생과 pgTAP
227개, Data API 확인이 모두 통과한다.

**Suspected cause**: Supabase 공식 문서가 Known caveats에 적은 "기본 권한에서
복제되는 grant"다. `db diff`는 빈 데이터베이스와 선언형 스키마를 적용한 데이터베이스를
비교하는데, 후자에는 기본 권한이 이미 실체화되어 있다. 그래서 엔진이 그 차이를
명시적 GRANT로 적는다.

**What was tried**: 고치지 않았다. 이 GRANT를 지우려면 생성된 마이그레이션을 권한을
이유로 손으로 고쳐야 하는데, 그것이 이번 결정이 없애기로 한 바로 그 절차다. 대신
`MAINTAIN`을 빠뜨렸던 결정 계약, 명세, 스키마 주석과 테스트 주석을 네 권한으로
바로잡았다.

**한 번 더 확인한 것**: 이 GRANT는 기준 이력에만 생기는 것이 아니다. 선언형 스키마에
테이블 하나를 임시로 더해 `db diff`를 돌렸더니 새 테이블에도 같은 세 줄이 생겼다.

```
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.zz_probe_table TO anon;
GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.zz_probe_table TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.zz_probe_table TO service_role;
```

즉 지우기로 하면 한 번이 아니라 새 테이블을 만들 때마다 지워야 한다. 그것은 이번
결정이 없앤 "생성물을 권한 때문에 손으로 고치는 절차"를 그대로 되살린다.

**Proposed next step**: 그대로 두기를 권한다. 결과 상태가 지금과 같고, 지우는 쪽은
매번 반복되는 손 보정을 되살리기 때문이다. 대신 [Supabase 스키마 작업 방식](../decisions/supabase-schema-workflow.md)에
"생성된 이력은 이 네 권한을 명시적으로 준다"는 사실을 적어, 나중에 마이그레이션을
읽는 사람이 `GRANT TRUNCATE ... TO anon`을 보고 놀라지 않게 한다. 플랫폼이 기본값을
더 좁히면 그때는 선언형 스키마에서 다시 생성하는 것으로 정리한다. 재현은
`grep "GRANT MAINTAIN" supabase/migrations/*.sql`로 충분하다.
