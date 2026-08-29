-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.episode_messages
  DROP CONSTRAINT episode_messages_ordered_in_play;

ALTER TABLE public.episode_messages
  DROP CONSTRAINT episode_messages_position_usable;

ALTER TABLE public.episode_messages
  DROP COLUMN "position";

ALTER TABLE public.episode_messages
  ALTER COLUMN created_at SET DEFAULT clock_timestamp();

COMMENT ON TABLE public.episode_messages IS 'One AI SDK UI message per row, ordered inside a play by created_at.';

COMMENT ON COLUMN public.episode_messages.created_at IS 'When the row landed, and the order the conversation is read in. Written by the database, never by a client.';

-- 생성물은 여기에 `"position"`도 함께 적었지만, 그 열은 위에서 이미 지워져
-- 이대로는 재생이 42703으로 멈춘다. 열을 지우면 그 열의 권한도 함께 사라지므로
-- 이름만 뺐다. docs/follow-ups/db-diff-revokes-a-column-it-just-dropped.md 참고.
REVOKE INSERT (id, parts, play_id, ROLE) ON public.episode_messages FROM authenticated;

GRANT INSERT (id, parts, play_id, ROLE) ON public.episode_messages TO authenticated;

CREATE INDEX episode_messages_play_id_created_at_idx ON public.episode_messages (play_id, created_at);