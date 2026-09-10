-- 만든 스토리를 플레이한 계정을 지우면 무엇이 남는지 확인한다.
--
-- 계정 삭제는 `auth.users` 한 행을 지우고, 거기서 시작한 연쇄가 `profiles`를
-- 지나 사람에게 딸린 모든 것을 훑는다. 만든 스토리가 그 연쇄에 들어오면서
-- 새 위험이 생겼다. 스토리에 달린 인물과 화가 `on delete restrict`로 묶여
-- 있으면 연쇄가 거기서 막히고, 계정 삭제가 절반만 지운 채 실패한다.
--
-- 공식 콘텐츠를 지키는 `restrict`는 그대로 필요하다. 회차와 저장한 표현이
-- 남아 있는 공식 스토리를 실수로 지우는 문장은 여전히 막혀야 한다. 그래서
-- 스토리가 소유한 것은 함께 지우고(cascade), 스토리를 바깥에서 가리키는 것은
-- 문장이 끝날 때 확인한다(deferred). 계정 삭제는 그 둘을 한 문장 안에서
-- 지우므로 확인 시점에는 가리키는 쪽이 이미 사라져 있다.
BEGIN;
SELECT plan(11);

INSERT INTO auth.users (id, email)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'maker@example.test');

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
    { "name": "Lena", "position": 1, "persona": "30대 호텔 프런트 직원이다. 규정을 지키고 근거가 보이면 방법을 찾아 준다." }
  ],
  "episodes": [
    {
      "number": 1,
      "title": "예약이 없는 호텔",
      "preview": "밤 열한 시에 도착했는데 프런트에 제 예약이 없대요.",
      "situation": "예약을 찾아 오늘 밤 묵을 방을 받아 보세요",
      "situationEmoji": "🏨",
      "opening": "밤 열한 시, 베를린 호텔 프런트 앞에 도착했다.\nLena: I cannot find a reservation under your name.",
      "stage": "상황:\n- 사용자가 말을 해야 이 일이 풀린다.",
      "castNames": ["Lena"],
      "endingSuccess": "방을 배정받았을 때",
      "endingCompromise": "임시 해결 방법을 받았을 때",
      "endingFailure": "방을 받지 못했을 때"
    }
  ]
}$json$::jsonb);

RESET ROLE;

-- 만든 스토리를 실제로 플레이한 자리를 만든다. 회차와 플레이, 저장한 표현까지
-- 달아야 삭제가 지나야 할 참조가 모두 선다. 누가 이 행을 쓸 수 있는지는 다른
-- 검사가 답하므로 여기서는 그냥 채운다.
INSERT INTO public.story_plays (id, user_id, story_id)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  (SELECT story_id FROM made)
);

INSERT INTO public.episode_plays (user_id, story_play_id, episode_id)
VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  (SELECT first_episode_id FROM made)
);

INSERT INTO public.saved_expressions (
  user_id, episode_id, kind, english, speaker, meaning, utterance_at
)
VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  (SELECT first_episode_id FROM made),
  'utterance',
  'I cannot find a reservation under your name.',
  'Lena',
  '예약이 확인되지 않는다는 말이다.',
  1
);

SELECT is(
  (SELECT count(*) FROM public.stories WHERE owner_id IS NOT NULL), 1::bigint,
  'the made story is there before the account goes'
);

SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 1::bigint,
  'an expression saved from the made story is there too'
);

-- 계정 삭제가 지나는 길 그대로다. Edge Function은 `auth.users` 한 행을 지우고
-- 나머지는 데이터베이스가 도맡는다.
SELECT lives_ok(
  $$delete from auth.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'deleting the account is not blocked by anything the person made'
);

SELECT is(
  (SELECT count(*) FROM public.stories WHERE owner_id IS NOT NULL), 0::bigint,
  'the story they made is gone'
);

SELECT is(
  (SELECT count(*) FROM public.characters WHERE story_id = (SELECT story_id FROM made)),
  0::bigint,
  'the people in that story are gone'
);

SELECT is(
  (SELECT count(*) FROM public.episodes WHERE story_id = (SELECT story_id FROM made)),
  0::bigint,
  'the episodes of that story are gone'
);

SELECT is(
  (SELECT count(*) FROM public.episode_characters WHERE story_id = (SELECT story_id FROM made)),
  0::bigint,
  'nothing still says who stood in those episodes'
);

SELECT is(
  (SELECT count(*) FROM public.story_plays), 0::bigint,
  'the runs through that story are gone'
);

SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 0::bigint,
  'the expressions saved along the way are gone'
);

-- 공식 콘텐츠는 주인이 없어 이 연쇄에 들어오지 않는다.
SELECT is(
  (SELECT count(*) FROM public.stories), 5::bigint,
  'the five official stories are untouched'
);

-- 지키던 것은 그대로 지킨다. 회차가 남아 있는 공식 스토리를 지우는 요청은
-- 여전히 실패한다. 달라진 것은 막히는 시점뿐이라, 확인을 문장이 아니라 거래가
-- 끝날 때 한다. PostgREST는 요청 하나를 거래 하나로 감싸므로 앱이 보는 결과는
-- 같다. `set constraints all immediate`가 그 시점을 여기서 앞당긴다.
INSERT INTO auth.users (id, email)
VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'player@example.test');

INSERT INTO public.story_plays (user_id, story_id)
VALUES (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  (SELECT id FROM public.stories WHERE slug = 'mia-cafe')
);

SELECT throws_ok(
  $outer$do $do$
    begin
      delete from public.stories where slug = 'mia-cafe';
      set constraints all immediate;
    end
  $do$$outer$,
  '23503', NULL,
  'an official story with runs hanging from it still refuses to be deleted'
);

SELECT * FROM finish();
ROLLBACK;
