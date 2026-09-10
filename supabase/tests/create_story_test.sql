-- 만든 스토리를 저장하는 한 문장을 확인한다.
--
-- 스토리 하나를 저장하려면 네 테이블에 행이 들어간다. 앱이 이것을 네 번의
-- 요청으로 나누면 중간에 끊긴 자리마다 절반짜리 스토리가 남는데, 스펙은 실패한
-- 시도가 아무것도 남기지 않기를 요구한다. 그래서 저장을 함수 하나가 도맡고
-- 네 테이블에 대한 insert 권한은 아무에게도 주지 않는다.
--
-- 주인이 부르는 사람인지도 이 함수가 스스로 답한다. `security definer`라 RLS가
-- 걸리지 않으므로, 남의 이름으로 스토리를 만드는 요청을 막는 곳이 여기다.
BEGIN;
SELECT plan(19);

INSERT INTO auth.users (id, email)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'maker@example.test');

SELECT has_function(
  'public', 'create_story', ARRAY['jsonb'],
  'a made story is saved by one call'
);

-- 네 테이블에 직접 쓰는 길이 없어야 이 함수가 유일한 저장 경로가 된다.
SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('authenticated', t, p))
    FROM unnest(ARRAY[
      'public.stories', 'public.characters',
      'public.episodes', 'public.episode_characters'
    ]) AS t,
    unnest(ARRAY['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'nobody writes story content through the Data API directly'
);

SELECT ok(
  NOT (SELECT has_function_privilege('anon', 'public.create_story(jsonb)', 'EXECUTE')),
  'a signed-out visitor cannot make a story'
);

SELECT ok(
  (SELECT has_function_privilege('authenticated', 'public.create_story(jsonb)', 'EXECUTE')),
  'a signed-in person may make a story'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

CREATE TEMP TABLE made AS
SELECT * FROM public.create_story($json${
  "title": "베를린 출장 일주일",
  "hook": "다음 달 베를린 출장인데, 호텔부터 거래처 미팅까지 혼자 해내야 해요",
  "intro": "첫 해외 출장으로 떠난 베를린에서 보내는 일주일.",
  "coverEmoji": "🧳",
  "completionTitle": "출장을 마쳤어요",
  "completionCopy": "호텔부터 미팅까지 영어로 지나왔어요.",
  "characters": [
    { "name": "Lena", "position": 1, "persona": "30대 호텔 프런트 직원이다. 규정을 정확히 지키고 근거가 보이면 방법을 찾아 준다." },
    { "name": "Markus", "position": 2, "persona": "40대 거래처 담당자다. 숫자 근거를 집요하게 묻는다." }
  ],
  "episodes": [
    {
      "number": 1,
      "title": "예약이 없는 호텔",
      "preview": "밤 열한 시에 도착했는데 프런트에 제 예약이 없대요.",
      "situation": "예약을 찾아 오늘 밤 묵을 방을 받아 보세요",
      "situationEmoji": "🏨",
      "opening": "밤 열한 시, 베를린 호텔 프런트 앞에 도착했다.\nLena: I cannot find a reservation under your name.",
      "stage": "상황:\n- 사용자는 예약 확인 이메일을 가지고 있다.\n- 사용자가 말을 해야 이 일이 풀린다.",
      "castNames": ["Lena"],
      "endingSuccess": "방을 배정받았을 때",
      "endingCompromise": "임시 해결 방법을 받았을 때",
      "endingFailure": "방을 받지 못했을 때"
    },
    {
      "number": 2,
      "title": "숫자를 묻는 담당자",
      "preview": "발표 중간에 담당자가 말을 끊고 근거를 물어요.",
      "situation": "수치의 근거를 설명해 발표를 이어 보세요",
      "situationEmoji": "📊",
      "opening": "다음 날 오후, 지사 회의실에서 발표 자료를 띄워 두었다.\nMarkus: What is the basis for this forecast?",
      "stage": "상황:\n- Markus는 근거를 묻는다.\n- 사용자가 말을 해야 이 일이 풀린다.",
      "castNames": ["Markus", "Lena"],
      "endingSuccess": "근거를 설명했을 때",
      "endingCompromise": "핵심만 답하고 자료를 약속했을 때",
      "endingFailure": "설명하지 못했을 때"
    }
  ]
}$json$::jsonb);

SELECT is(
  (SELECT count(*) FROM made), 1::bigint,
  'making a story answers once with what the app needs to open it'
);

SELECT is(
  (SELECT owner_id FROM public.stories WHERE id = (SELECT story_id FROM made)),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
  'the story belongs to whoever called, not to whoever the request named'
);

SELECT is(
  (SELECT number FROM public.episodes WHERE id = (SELECT first_episode_id FROM made)),
  1::smallint,
  'the answer points at the first episode, which is the one that opens next'
);

SELECT is(
  (SELECT count(*) FROM public.characters WHERE story_id = (SELECT story_id FROM made)),
  2::bigint,
  'every person in the card is saved once for the whole story'
);

SELECT is(
  (SELECT count(*) FROM public.episodes WHERE story_id = (SELECT story_id FROM made)),
  2::bigint,
  'every episode in the card is saved'
);

-- 화의 인물은 카드에 적힌 차례 그대로 선다. 프롬프트의 등장인물 문장이 이
-- 차례로 이름을 부른다.
SELECT results_eq(
  $$
    select e.number, ec.at, c.name
    from public.episode_characters ec
    join public.episodes e on e.id = ec.episode_id
    join public.characters c on c.id = ec.character_id
    where ec.story_id = (select story_id from made)
    order by e.number, ec.at
  $$,
  $$
    values
      (1::smallint, 1::smallint, 'Lena'::text),
      (2::smallint, 1::smallint, 'Markus'::text),
      (2::smallint, 2::smallint, 'Lena'::text)
  $$,
  'each episode stands its own people in the order the card listed them'
);

-- 옛 열은 아직 앞선 API가 읽는다. 같은 이름을 같은 차례로 담아야 한다.
SELECT results_eq(
  $$select number, cast_names from public.episodes
    where story_id = (select story_id from made) order by number$$,
  $$
    values
      (1::smallint, array['Lena']::text[]),
      (2::smallint, array['Markus', 'Lena']::text[])
  $$,
  'the older speaker column carries the same names in the same order'
);

SELECT ok(
  (SELECT slug IS NULL AND position IS NULL
     FROM public.stories WHERE id = (SELECT story_id FROM made)),
  'a made story takes no official slug or place, so the seed cannot reach it'
);

RESET ROLE;

-- 카드에 없는 이름이 화에 서면 그 스토리는 통째로 없던 일이 된다. 절반만 저장된
-- 스토리가 남지 않는다는 약속이 여기서 확인된다.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

SELECT throws_ok(
  $$select public.create_story($json${
    "title": "이름이 어긋난 스토리",
    "hook": "훅",
    "intro": "소개",
    "coverEmoji": "📘",
    "completionTitle": "끝",
    "completionCopy": "완주",
    "characters": [
      { "name": "Lena", "position": 1, "persona": "설명" }
    ],
    "episodes": [
      {
        "number": 1,
        "title": "화 제목",
        "preview": "상황 설명",
        "situation": "해 보세요",
        "situationEmoji": "🏨",
        "opening": "장면 서술.\nLena: Hello.",
        "stage": "상황:\n- 사용자가 말을 해야 이 일이 풀린다.",
        "castNames": ["Nobody"],
        "endingSuccess": "성공했을 때",
        "endingCompromise": "타협했을 때",
        "endingFailure": "실패했을 때"
      }
    ]
  }$json$::jsonb)$$,
  '23502', NULL,
  'an episode cannot stand someone the story never introduced'
);

SELECT is(
  (SELECT count(*) FROM public.stories WHERE title = '이름이 어긋난 스토리'),
  0::bigint,
  'a story that failed halfway leaves nothing behind'
);

/*
  아래 넷은 이 함수를 PostgREST로 바로 부르는 요청을 막는다. API가 같은 것을
  먼저 세지만 그 길을 건너뛰는 요청이 있고, 여기서 걸리지 않으면 열 수 없는
  스토리나 규칙을 넘는 스토리가 목록에 남는다.

  화가 빠진 요청이 특히 조용하다. 배열을 펴는 문장이 오류 없이 0행을 내므로,
  막지 않으면 스토리 행만 남고 앱은 실패를 본다.
*/
SELECT throws_ok(
  $$select public.create_story(
    jsonb_build_object(
      'title', '화가 없는 스토리', 'hook', '훅', 'intro', '소개',
      'coverEmoji', '📘', 'completionTitle', '끝', 'completionCopy', '완주',
      'characters', jsonb_build_array(
        jsonb_build_object('name', 'Lena', 'position', 1, 'persona', '설명')
      )
    )
  )$$,
  '22023', NULL,
  'a story cannot be saved without a single episode'
);

SELECT is(
  (SELECT count(*) FROM public.stories WHERE title = '화가 없는 스토리'),
  0::bigint,
  'the story row does not survive a request that carried no episodes'
);

SELECT throws_ok(
  $$select public.create_story(
    jsonb_build_object(
      'title', '너무 긴 스토리', 'hook', '훅', 'intro', '소개',
      'coverEmoji', '📘', 'completionTitle', '끝', 'completionCopy', '완주',
      'characters', jsonb_build_array(
        jsonb_build_object('name', 'Lena', 'position', 1, 'persona', '설명')
      ),
      'episodes', (
        select jsonb_agg(
          jsonb_build_object(
            'number', number, 'title', '화', 'preview', '설명',
            'situation', '해 보세요', 'situationEmoji', '📘',
            'opening', E'서술.\nLena: Hello.', 'stage', '상황:',
            'castNames', jsonb_build_array('Lena'),
            'endingSuccess', '성공', 'endingCompromise', '타협',
            'endingFailure', '실패'
          )
        )
        from generate_series(1, 6) as number
      )
    )
  )$$,
  '22023', NULL,
  'a story cannot run past five episodes'
);

SELECT throws_ok(
  $$select public.create_story(
    jsonb_build_object(
      'title', '붐비는 화', 'hook', '훅', 'intro', '소개',
      'coverEmoji', '📘', 'completionTitle', '끝', 'completionCopy', '완주',
      'characters', jsonb_build_array(
        jsonb_build_object('name', 'A', 'position', 1, 'persona', '설명'),
        jsonb_build_object('name', 'B', 'position', 2, 'persona', '설명'),
        jsonb_build_object('name', 'C', 'position', 3, 'persona', '설명'),
        jsonb_build_object('name', 'D', 'position', 4, 'persona', '설명')
      ),
      'episodes', jsonb_build_array(
        jsonb_build_object(
          'number', 1, 'title', '화', 'preview', '설명',
          'situation', '해 보세요', 'situationEmoji', '📘',
          'opening', E'서술.\nA: Hello.', 'stage', '상황:',
          'castNames', jsonb_build_array('A', 'B', 'C', 'D'),
          'endingSuccess', '성공', 'endingCompromise', '타협',
          'endingFailure', '실패'
        )
      )
    )
  )$$,
  '22023', NULL,
  'an episode cannot stand four people, and the error names that rule'
);

SELECT throws_ok(
  $$select public.create_story(
    jsonb_build_object(
      'title', '자리가 겹친 스토리', 'hook', '훅', 'intro', '소개',
      'coverEmoji', '📘', 'completionTitle', '끝', 'completionCopy', '완주',
      'characters', jsonb_build_array(
        jsonb_build_object('name', 'A', 'position', 1, 'persona', '설명'),
        jsonb_build_object('name', 'B', 'position', 1, 'persona', '설명')
      ),
      'episodes', jsonb_build_array(
        jsonb_build_object(
          'number', 1, 'title', '화', 'preview', '설명',
          'situation', '해 보세요', 'situationEmoji', '📘',
          'opening', E'서술.\nA: Hello.', 'stage', '상황:',
          'castNames', jsonb_build_array('A'),
          'endingSuccess', '성공', 'endingCompromise', '타협',
          'endingFailure', '실패'
        )
      )
    )
  )$$,
  '22023', NULL,
  'two people cannot share one place, so name colours cannot collide'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
