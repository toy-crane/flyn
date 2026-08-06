-- public에 테이블을 만들면 anon·authenticated가 Dxtm(TRUNCATE·REFERENCES·
-- TRIGGER·MAINTAIN)을 딸려 받는다. Supabase가 2026년에 기본 권한에서 걷어낸 것은
-- arwd(CRUD)뿐이라, 이 넷은 지금도 새 테이블마다 자동으로 붙는다.
--
-- **RLS는 이것을 가르지 못한다.** 정책은 select·insert·update·delete에만 걸리고,
-- 테이블 전체에 적용되는 연산은 행 보안의 대상이 아니다(PostgreSQL 문서). 그래서
-- 정책이 여섯 개 걸려 있어도 앱 역할이 truncate로 프로필을 통째로 비울 수 있었다.
--
-- 에피소드 계열은 만들 때부터 revoke를 함께 넣었는데 profiles만 빠져 있었다. 이
-- 테이블이 리포에서 가장 오래돼, 기본 권한이 무엇을 붙이는지 알기 전에 만들어진
-- 탓이다. 지금부터는 tests/table_grants.test.sql의 불변식이 스키마를 통째로 훑으므로
-- 새 테이블이 revoke를 빠뜨리면 db:test가 막는다.
REVOKE MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles FROM anon;
REVOKE MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles FROM authenticated;
