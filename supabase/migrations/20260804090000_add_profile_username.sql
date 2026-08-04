alter table public.profiles add column username text;

alter table public.profiles
  add constraint profiles_username_format
  check (
    username is null
    or (
      char_length(username) between 4 and 20
      and username ~ '^[a-z0-9][a-z0-9_.]{2,18}[a-z0-9]$'
      and username !~ '\.\.'
      and username not in (
        'admin',
        'administrator',
        'flyn',
        'official',
        'root',
        'staff',
        'support',
        'system'
      )
    )
  );

create unique index profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.profiles_normalize()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  invisible constant text :=
    '[[:cntrl:] ' || U&'\00a0\1680\2000-\200d\2028\2029\202f\205f\3000\feff' || ']';
begin
  new.display_name := regexp_replace(
    new.display_name,
    '^' || invisible || '+|' || invisible || '+$',
    '',
    'g'
  );
  new.username := lower(new.username);
  return new;
end;
$$;

grant update (username) on table public.profiles to authenticated;

create function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate_username is not null
    and char_length(lower(candidate_username)) between 4 and 20
    and lower(candidate_username) ~ '^[a-z0-9][a-z0-9_.]{2,18}[a-z0-9]$'
    and lower(candidate_username) !~ '\.\.'
    and lower(candidate_username) not in (
      'admin',
      'administrator',
      'flyn',
      'official',
      'root',
      'staff',
      'support',
      'system'
    )
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(candidate_username)
        and id <> (select auth.uid())
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to authenticated;
grant execute on function public.is_username_available(text) to service_role;
