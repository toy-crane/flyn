-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.saved_expressions
  DROP CONSTRAINT saved_expressions_utterance_whole;

COMMENT ON COLUMN public.saved_expressions.meaning IS 'One Korean line saying what the sentence means. Required for character lines, copied from the review for corrections and guidance.';

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_utterance_whole CHECK ((kind <> 'utterance'::text OR meaning IS NOT NULL) AND (kind = 'utterance'::text) = (speaker IS
    NOT NULL) AND (kind = 'utterance'::text) = (utterance_at IS NOT NULL));

-- 규칙을 바꾸기 전에 담아 둔 교정과 안내에 뜻을 채운다. 선언형 diff는 DML을
-- 표현하지 못하므로 같은 마이그레이션에 손으로 더한다.
--
-- 값을 새로 만들지 않는다. 표현 돌아보기가 그 메시지에 대해 이미 저장해 둔
-- 고친 문장의 뜻을 그대로 옮긴다. 읽을 때마다 메시지를 찾아가지 않기 위해
-- 여기서 한 번에 채운다.
--
-- 곁에 있던 메시지가 사라진 항목은 옮겨 올 곳이 없으므로 뜻이 빈 채로 남는다.
-- 판정이 `corrected`가 아닌 행에는 뜻이 없으므로 조건에서 함께 걸러진다.
--
-- 주인까지 맞춰 보는 이유는 이 문장이 계정 경계를 스스로 들게 하기 위해서다.
-- 지금은 정책과 복합 외래키가 담은 사람과 메시지 주인을 같게 만들지만, 그 보증은
-- `authenticated`로 들어온 행에만 걸린다. 마이그레이션은 그 문을 지나지 않는다.
UPDATE public.saved_expressions AS s
SET meaning = r.meaning
FROM public.episode_expression_results AS r
WHERE s.message_id = r.message_id
  AND s.user_id = r.user_id
  AND s.kind <> 'utterance'
  AND s.meaning IS NULL
  AND r.status = 'corrected'
  AND r.meaning IS NOT NULL;
