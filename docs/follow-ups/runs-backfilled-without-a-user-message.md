# 사용자가 말하지 않은 옛 진입은 회차를 받고도 목록에 안 선다

## 증상

`20260908155308_story_runs.sql`의 백필은 (사람, 스토리) 짝마다 회차를 하나 만든다.
그 회차의 `last_user_message_at`은 남은 사용자 메시지에서 읽는다. 사용자 메시지가
하나도 없는 짝은 그 값이 NULL로 남고, 대화 기록과 최근 대화가 둘 다 그 값을
not null로 거르므로 회차가 목록에 서지 않는다.

플레이와 메시지 행은 그대로 남는다. 그 스토리를 다시 시작하면 `startStoryRun`이
새 회차를 만들고 1화가 그 아래로 들어가므로, 옛 회차는 아무 데서도 닿지 않는
행으로 남는다.

## 관찰한 근거

원격 데이터는 보지 않았다. 코드와 로컬에서 확인한 경로다.

- 백필 세 번째 문장이 `WHERE message.role = 'user'`인 메시지만 읽는다.
- main의 `apps/api/src/features/episode/route.ts`는 `POST /`에서 사용자 메시지가
  없어도 `openEpisodePlay`를 먼저 부르고, `play.messages.length === 0`이면
  `onEnd: saveScene`으로 첫 장면을 assistant 메시지로 저장한다. 첫 장면만 보고
  나온 진입이 assistant 메시지만 가진 플레이를 남긴다.
- `apps/api/src/features/episode/runs.ts`의 `readRunRows`와 `readRecentStories`가
  `.not("last_user_message_at", "is", null)`로 거른다.
- 2026-09-09에 로컬에서 센 것은 "메시지 행이 하나도 없는 플레이"였다. 역할을
  가리지 않는 세기라 첫 장면만 있는 플레이는 그 0에 걸리지 않았다.

## 해 본 것

숨기는 쪽을 그대로 둔다. 사용자가 한마디도 하지 않은 진입을 기록으로 세우지 않는
것이 수락 기준 4와 9가 정한 방향이고, 새 구조에서 회차는 첫 사용자 메시지에
생긴다. `coalesce`로 `started_at`을 넣어 목록에 세우면 새 구조가 만들지 않기로 한
빈 줄을 마이그레이션이 되살린다.

## 다음으로 제안하는 것

push 전에 원격에서 읽기 전용으로 몇 개인지 센다.

```sql
select count(*)
from (
  select played.user_id, episode.story_id
  from public.episode_plays played
  join public.episodes episode on episode.id = played.episode_id
  group by 1, 2
  having not exists (
    select 1
    from public.episode_plays inner_play
    join public.episode_messages message on message.play_id = inner_play.id
    join public.episodes inner_episode on inner_episode.id = inner_play.episode_id
    where inner_play.user_id = played.user_id
      and inner_episode.story_id = episode.story_id
      and message.role = 'user'
  )
) t;
```

push 뒤에는 `select count(*) from public.story_runs where last_user_message_at is null`이
같은 수를 내야 한다. 0이면 이 문서는 닫는다. 0이 아니면 남은 플레이를 지울지
그대로 둘지 정하고, 그 판단을 결정 계약에 남긴다.

## 관련

- [스토리 재플레이 명세](../specs/story-replay/spec.md)의 "사용자가 말하지 않은 옛 진입"
- [Supabase 스키마 작업 흐름](../decisions/supabase-schema-workflow.md)
