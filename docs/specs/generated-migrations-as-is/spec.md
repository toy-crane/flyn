# 생성된 마이그레이션을 그대로 쓰는 명세

## 목표

- Supabase가 권장하는 기본 방법을 데이터베이스 작업의 기본값으로 삼는다. 기본에서
  벗어나는 SQL과 절차는 지금 필요한 이유를 그 자리에서 설명할 수 있을 때만 남긴다.
- 스키마 변경 절차를 "선언형 스키마 수정, `supabase db diff`, 커밋"으로 끝낸다.
  생성된 마이그레이션을 권한 때문에 손으로 고치는 단계와, 사람이
  `information_schema`를 조회해 권한을 확인하는 단계를 없앤다.
- Supabase의 현재 기본값을 그대로 신뢰한다. 로컬 스택은 이미 새 테이블과 함수를
  Data API 역할에 자동 노출하지 않는 기본값으로 동작한다(`supabase/config.toml`의
  `auto_expose_new_tables` 미설정). 이 기본값이 막아 주는 것을 수동 REVOKE로
  다시 막지 않는다.

## 확정 범위

- 선언형 스키마에서 테이블마다 반복하던
  `revoke all on table ... from anon, authenticated, service_role` 상용구를 없앤다.
- 함수별 `revoke all on function ...` 상용구도 같은 기준으로 정리한다. 아래 수용
  기준을 지키는 데 실제로 필요한 REVOKE만 남기고, 남는 것에는 필요한 이유를
  주석으로 붙인다. 의식으로만 남던 것은 없앤다.
- 명시적 GRANT는 접근 표면의 선언이므로 그대로 둔다. 테이블 select, profiles의
  열 단위 update, 허용한 RPC의 execute, service_role의 권한이 여기에 속한다.
  이 GRANT는 지금도 diff에 정상적으로 들어간다.
- 기존 마이그레이션 이력을 REVOKE 상용구 없는 선언형 스키마 기준의 새 이력으로
  교체한다. diff가 못 잡는 객체는 아래 보존 목록과 대조해 새 이력에 옮긴다.
- 새 테이블을 추가할 때 REVOKE를 손으로 보정하라는 문서(`supabase/schemas/README.md`의
  해당 절)를 새 절차에 맞게 바꾼다.
- [Supabase 스키마 작업 방식](../../decisions/supabase-schema-workflow.md) 계약에는
  이 결정을 반영해 두었다. 구현은 선언형 스키마와 문서, 테스트를 그 계약에 맞춘다.
- 권한 pgTAP 테스트를 "노출되면 안 되는 접근"만 고정하도록 좁힌다. Data API로
  닿을 수 없는 REFERENCES, TRIGGER, TRUNCATE의 부재는 더 이상 고정하지 않는다.

## 관찰 가능한 수용 기준

- `supabase db reset` 재생 뒤에 다음이 성립한다.
  - anon은 public 테이블 어디에도 select, insert, update, delete가 없고, 명시적으로
    grant하지 않은 함수를 실행할 수 없다.
  - authenticated는 선언형 스키마가 명시한 GRANT만 가진다. 명시하지 않은
    select, insert, update, delete와 함수 실행이 없다.
  - 모든 public 테이블에서 RLS가 켜져 있고 정책은 지금과 같다.
- 위 상태가 사람이 붙인 보정 없이 선언형 스키마와 생성된 마이그레이션만으로
  재현된다.
- 새 기준 이력으로 `supabase db reset`을 하면 지금 상태가 그대로 재현된다.
  공식 스토리 콘텐츠, 아바타 저장소 버킷과 그 정책(계정 삭제 쓰기 울타리 포함),
  회원 가입 시 프로필을 만드는 auth.users 트리거, profiles의 열 단위 update
  권한, 확장 설정이 살아나고 pgTAP가 통과한다. 수동 보완은 DML과 선언형 diff가
  표현하지 못하는 객체에만 남는다.
- 앱 동작은 바뀌지 않는다. 화면, API 경로, 로그인 사용자의 데이터 접근 결과가
  지금과 같다.

## 확정 제약과 이유

- Supabase가 권장하는 기본 방법으로 가는 방향은 사용자가 확정했다. 교차 행 규칙을
  지키는 security definer 함수는 그 기본 방법이 문서로 안내하는 공식 도구이므로,
  함수 계층 유지는 이 원칙과 충돌하지 않는다.
- 수동 REVOKE가 실제로 지우던 것은 기본 권한이 남기는 REFERENCES, TRIGGER,
  TRUNCATE 세 가지다. PostgREST는 select, insert, update, delete, rpc만 노출하므로
  이 세 권한에 닿는 경로가 없고, anon과 authenticated는 직접 로그인할 수 없는
  역할이다. 이 세 권한은 받아들인다. 매 테이블 수동 보정의 유일한 실익이
  이것이었고, 반복 비용이 실익보다 크다는 것이 이 결정이다.
- 데이터를 실제로 지키는 것은 RLS다. 정책 없는 동작은 거부되므로, GRANT가 남아
  있어도 정책이 허용하지 않는 행은 읽거나 쓸 수 없다. 이 안전망은 그대로다.
- 마이그레이션 이력은 처음부터 다시 만든다. 원격 프로젝트가 없고 지켜야 할
  사용자 데이터도 없다는 사실을 사용자가 확인했다(저장소에도 원격 링크가 없다).
  그래서 "이미 원격에 적용된 마이그레이션은 수정하지 않는다"는 규칙의 전제가
  성립하지 않는다. REVOKE 상용구를 걷어낸 선언형 스키마에서 새 기준 이력을
  생성하고, 손으로 보정해 온 기존 이력은 제거한다. 잔여 세 권한을 나중에
  되돌리는 어색한 전환 마이그레이션도 필요 없어진다.
- 원격을 위한 확인 절차는 두지 않는다. 원격 Supabase 프로젝트는 아직 없고,
  나중에 만들 원격은 새로 생성하는 프로젝트라 자동 노출을 차단하는 새 기본값을
  그대로 받는다. 과거 기본값이 문제가 되는 경우는 옛 프로젝트를 재사용할
  때뿐인데 재사용할 프로젝트 자체가 없다. 사용자가 확정했다. 플랫폼 동작이 이
  전제와 다르게 나타나면 남은 리스크의 조건대로 다시 검증한다.
- 쓰기를 함수로만 허용하는 데이터 규칙 계층(`finish_episode` 같은 RPC와
  트리거), RLS 정책, API가 secret key를 갖지 않는 서버 경계는 이 단위에서 바꾸지
  않는다. 이들은 마이그레이션 보정을 만든 원인이 아니고, diff에 정상적으로
  표현되며, 에피소드 순서, 결말 불변, 아이디 잠금 같은 제품 규칙이 사는 자리다.

## diff가 못 잡는 것과 보존 목록

Supabase 공식 문서(선언형 데이터베이스 스키마의 Known caveats, 2026-08-28 확인)는
schema diff가 놓칠 수 있는 항목을 나열하고, 엔진과 무관하게 생성된 마이그레이션을
검토하라고 안내한다. 문서의 목록: DML, 뷰 소유권과 grant·security invoker·구체화
뷰, alter policy, 열 단위 권한, 스키마별 분리 diff, 주석, 파티션, publication에
테이블 추가, domain, 기본 권한에서 복제되는 grant. 일부는 옛 migra 엔진 기준이라
지금 쓰는 pg-delta는 잡을 수도 있다. 그래서 이것은 무조건 손으로 쓸 목록이
아니라 생성물과 대조할 목록이다.

이 저장소에서 실제로 해당하는 것은 다섯 가지다. 새 기준 이력을 생성한 뒤 이
목록과 대조해서 빠진 것만 수동 보완한다.

1. 스토리·에피소드 콘텐츠와 storage 버킷 생성 DML
2. storage.objects의 아바타 정책(계정 삭제 쓰기 울타리 포함)
3. auth.users 위의 회원 가입 트리거(public 밖 스키마)
4. profiles의 열 단위 update grant(문서가 명시한 caveat)
5. 테이블·열·함수의 comment on 주석

뷰, 구체화 뷰, 파티션, domain, publication, alter policy는 저장소에 없음을
확인했다.

## 확인한 사실

- 자동 노출 차단은 테이블에만 적용된다. 로컬 스택에서 확인한 결과, `public`의 새
  테이블은 `anon`과 `authenticated`에 REFERENCES, TRIGGER, TRUNCATE만 주고
  select, insert, update, delete는 주지 않는다. 그래서 테이블 REVOKE를 없앨 수
  있었다.
- 함수는 막지 못한다. `create function`은 여전히 PUBLIC에 EXECUTE를 주고
  `anon`과 `authenticated`가 이를 물려받는다. 그러므로 함수별 REVOKE는 수용
  기준을 지키는 데 필요한 SQL로 남는다. `from public` 한 줄이 물려받는 역할까지
  모두 지우므로, 역할 이름을 덧붙이던 부분만 없앴다.
- pg-delta는 문서의 옛 caveat 목록보다 많이 잡는다. 생성된 기준 이력에 auth
  스키마의 트리거, profiles의 열 단위 grant, 주석 38개, RLS와 정책 7쌍이 모두
  들어 있었다. 손으로 보완한 것은 storage 버킷과 정책뿐이고, 스토리 콘텐츠는
  `supabase/seed.sql`이 소유한다.

## 가정

- 마이그레이션의 supabase-reviewer 검토는 유지한다. 이 결정은 사람이 손으로
  고치는 단계를 없애는 것이지 검토를 없애는 것이 아니다.

## 범위 밖

- 클라이언트 직접 쓰기 정책(insert, update policy) 도입: 순서와 불변성 같은 제품
  규칙을 둘 곳이 사라진다. 필요하면 별도 단위로 논의한다.
- 결말 직접 기록 후속 작업
  (`docs/follow-ups/signed-in-user-can-record-episode-endings-without-playing.md`):
  이 단위와 독립적으로 남는다.

## 남은 리스크

- Supabase는 2026-10-30에 `auto_expose_new_tables` 필드를 제거하고 항상 차단
  동작을 영구화할 예정이다. 그 시점의 실제 동작이 지금 로컬 관찰과 다르면 이
  명세의 수용 기준으로 다시 검증한다.
- 잔여 세 권한은 anon이나 authenticated로 임의 SQL을 실행할 수 있는 경로가
  생기는 순간 다시 의미를 갖는다. 그런 경로를 추가하는 결정이 이 명세의 재검토
  조건이다.
