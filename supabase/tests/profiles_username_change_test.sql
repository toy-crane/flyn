-- Renaming an account id: what it costs, what it holds back, and what it leaves
-- alone.
--
-- The whole rule lives in a trigger rather than in the app, so these run as the
-- roles that reach the table. A client that skipped the screen and called
-- PostgREST directly has to land in the same place.
BEGIN;
SELECT plan(28);

INSERT INTO auth.users (id, email)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'name-a@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'name-b@example.test');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

-- ── choosing a first id is not a change ──
--
-- Onboarding writes null -> value. If that counted, everyone would finish signing
-- up locked out of fixing the id they had just typed for the first time.
SELECT lives_ok(
  $$update public.profiles set username = 'firstid'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'a first account id is accepted'
);

SELECT is(
  (SELECT username_locked_until FROM public.profiles
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  NULL::timestamptz,
  'and it does not start the 30 day lock'
);

-- The lock is the whole record of a change. A second column holding when the id
-- changed would say the same thing in another name, and nothing reads it.
SELECT hasnt_column(
  'public', 'profiles', 'username_changed_at',
  'a change is recorded only by the lock it starts'
);

-- The edit screen asks about the id already in the field every time it opens.
-- Counting the caller's own row would answer that their own id is somebody else's.
SELECT is(
  public.username_status('firstid'),
  'available',
  'the id a person already holds reads as available to them'
);

-- ── a change locks the id and retires the old one ──
SELECT lives_ok(
  $$update public.profiles set username = 'secondid'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'changing an account id is accepted'
);

SELECT is(
  (SELECT username_locked_until FROM public.profiles
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  now() + interval '30 days',
  'and the next allowed change is 30 days out'
);

-- How long the old id stays protected is the only thing the retired list needs to
-- know. When it was released is not read by anything.
SELECT hasnt_column(
  'public', 'retired_usernames', 'retired_at',
  'and the retired id keeps only when its protection ends'
);

SELECT throws_ok(
  $$update public.profiles set username = 'thirdid'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  '23514',
  NULL,
  'a second change inside the 30 days is rejected'
);

-- ── the lock covers the id and nothing else ──
--
-- Someone who renamed last week still has to be able to fix their nickname or
-- swap a bad photo. This is the line between the two.
SELECT lives_ok(
  $$update public.profiles set display_name = '바꾼 닉네임'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'the nickname is still editable while the id is locked'
);

SELECT lives_ok(
  $$update public.profiles
    set avatar_path = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/photo.jpg',
        avatar_chosen_by_user = true
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'the picture is still editable while the id is locked'
);

-- The path is the caller's own folder in the bucket, which is what the storage
-- policies match on. A row that could name another folder would point the app at
-- a file its owner never agreed to show.
SELECT throws_ok(
  $$update public.profiles
    set avatar_path = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/photo.jpg'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  '23514',
  NULL,
  'a picture path in another person''s folder is rejected'
);

-- ── the record of the rule is not the caller's to write ──
SELECT throws_ok(
  $$update public.profiles set username_locked_until = now() - interval '1 day'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  '42501',
  NULL,
  'a client cannot clear its own lock'
);

SELECT throws_ok(
  $$select * from public.retired_usernames$$,
  '42501',
  NULL,
  'a client cannot read which ids are about to come free'
);

SELECT throws_ok(
  $$delete from public.retired_usernames$$,
  '42501',
  NULL,
  'and cannot empty the table that holds the protection'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

-- ── the id somebody gave up is not free ──
--
-- 'firstid' belongs to no profile row now. Only the retired list knows it is
-- spoken for, and every route to it has to agree.
SELECT is(
  public.username_status('firstid'),
  'taken',
  'a released id reads as taken to everybody else'
);

SELECT is(
  public.available_usernames(ARRAY['firstid', 'freeone']),
  ARRAY['freeone'],
  'and it is never offered as a suggestion'
);

-- The advisory answer above is a moment in time. This is the one that decides, and
-- it has to hold even when the check is skipped or raced.
--
-- B holds no id at all yet, so this is also the onboarding route to somebody's
-- released id. Renaming into it is the obvious way in; signing up is the quiet one,
-- and a rule that only watched renames would leave it open.
SELECT throws_ok(
  $$update public.profiles set username = 'firstid'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  '23505',
  NULL,
  'and an account choosing its first id cannot take it either'
);

RESET ROLE;

-- The 30 days have passed for A. Written directly because these tests cannot wait
-- a month, and because the column is deliberately out of reach of every client.
UPDATE public.profiles
SET username_locked_until = now() - interval '1 day'
WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

-- ── the person who left an id may come back to it ──
--
-- The protection is there so nobody is mistaken for the person who left. That
-- reason does not apply to the person who left.
SELECT lives_ok(
  $$update public.profiles set username = 'firstid'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'the previous owner can take their own released id back'
);

SELECT is(
  (SELECT username_locked_until FROM public.profiles
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  now() + interval '30 days',
  'and that change locks the id again like any other'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

SELECT is(
  public.username_status('firstid'),
  'taken',
  'the id reads as taken again now that its owner holds it'
);

SELECT is(
  public.username_status('secondid'),
  'taken',
  'and the id they left behind this time is protected in its turn'
);

RESET ROLE;

-- A row taken back by its owner must not stay in the retired list, or the account
-- that now holds the id would be blocked from ever renaming into it again.
SELECT is(
  (SELECT count(*) FROM public.retired_usernames WHERE username = 'firstid'),
  0::bigint,
  'taking an id back releases its protection rather than leaving a stale row'
);

-- Counted over this test's own accounts rather than the whole table. A bare
-- count(*) passes only on an empty database, so it would fail against any
-- developer's local data and pass again after the next reset — which is exactly
-- the kind of green that stops meaning anything.
SELECT is(
  (SELECT count(*) FROM public.retired_usernames
    WHERE retired_by IN (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    )),
  1::bigint,
  'and the list holds one row per released id rather than one per change'
);

-- ── protection ends ──
UPDATE public.retired_usernames
SET protected_until = now() - interval '1 day'
WHERE username = 'secondid';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

SELECT is(
  public.username_status('secondid'),
  'available',
  'once the 30 days are up the id is free again'
);

SELECT lives_ok(
  $$update public.profiles set username = 'secondid'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'and somebody else can take it'
);

RESET ROLE;

-- ── an id given up again is protected from the latest release ──
--
-- 'secondid' still has its expired row from A's release. When B gives it up in
-- turn, that row has to move to B and start a fresh 30 days, or the id would be
-- free the moment B left it.
UPDATE public.profiles
SET username_locked_until = now() - interval '1 day'
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

SELECT lives_ok(
  $$update public.profiles set username = 'bnewid'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'the second holder can give the id up as well'
);

RESET ROLE;

SELECT ok(
  (SELECT retired_by = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      AND protected_until = now() + interval '30 days'
    FROM public.retired_usernames WHERE username = 'secondid'),
  'and its protection restarts from that latest release'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

SELECT is(
  public.username_status('secondid'),
  'taken',
  'so the account that first gave it up cannot take it while that runs'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
