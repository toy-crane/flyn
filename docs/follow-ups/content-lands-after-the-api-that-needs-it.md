# 콘텐츠가 그것을 필요로 하는 API보다 늦게 운영에 올라간다

**Symptom**: 자동 배포는 마이그레이션과 API를 올리지만 `supabase/seed.sql`은 올리지 않는다. 그래서 콘텐츠 테이블을 새로 만드는 변경에서는, 새 API가 아직 비어 있는 그 테이블을 읽는 구간이 생긴다.

**Observed evidence**: 2026-09-10 `scripts/ci/delivery.ts:54`가 `supabase/seed.sql`을 `manual` 대상으로 분류하고 `supabase/migrations/`와 `apps/api/`만 자동 대상에 넣는 것을 확인했다. [검증과 내부 테스트 배포](../decisions/continuous-delivery.md)도 seed·콘텐츠와 Auth 설정을 매 배포마다 덮어쓰지 않는다고 정한다. 이번 인물 구조 변경에서 실제로 그 구간이 생겼다. 마이그레이션이 `characters`를 빈 채로 만들고, 같은 배포의 API가 그 테이블에서 프롬프트의 등장인물 문장을 만든다.

**Suspected cause**: 배포 단계가 서비스 단위(DB, API, 모바일)로만 나뉘어 있고, 콘텐츠는 그 순서 밖의 수동 작업으로 남아 있다. 스키마와 콘텐츠가 한 변경으로 묶이는 경우를 배포 절차가 표현하지 못한다.

**What was tried**: API가 인물 행을 찾지 못하면 이전 화자 목록(`episodes.cast_names`)으로 인물을 세우도록 대비를 두었다(`apps/api/src/features/episode/story.ts`의 `namesOnlyCast`). 이 대비로 그 구간에도 말풍선과 이름표는 살고 인물 설명만 빠진다. 다만 그 대비는 순서를 그 화의 배열 자리에서 얻으므로, 같은 인물이 화마다 다른 번호를 받아 이름표 색이 화마다 달라질 수 있다. `first-week-office` 1화는 `['Dan','Grace']`, 2화는 `['Grace','Dan']`이라 그 구간에서 Dan의 색이 바뀐다. 스토리 전체의 순서는 이 대비가 볼 수 없어 고칠 수 없다. 대비는 `cast_names`를 지우는 다음 마이그레이션과 함께 사라지므로, 그때까지 근본 순서 문제와 이 색 흔들림은 그대로다.

**Proposed next step**: `cast_names`를 지우기 전에, 콘텐츠 적용을 배포 순서 안에 넣을지 정한다. 후보는 둘이다. 콘텐츠 DML을 버전 관리 마이그레이션으로 옮겨 DB 단계에서 함께 들어가게 하거나, 배포 실행에 seed 단계를 API보다 앞에 두는 것이다. 어느 쪽이든 [검증과 내부 테스트 배포](../decisions/continuous-delivery.md)를 함께 고친다.
