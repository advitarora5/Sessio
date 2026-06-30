-- Idempotent upgrade for profile onboarding fields, friend requests, and Illini spot upserts.

alter table public.profiles
  add column if not exists year text,
  add column if not exists study_focus text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'spots_name_unique'
      and conrelid = 'public.spots'::regclass
  ) then
    alter table public.spots
      add constraint spots_name_unique unique (name);
  end if;
end;
$$;

create table if not exists public.friendships (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_status_check check (status in ('pending', 'accepted', 'blocked')),
  constraint friendships_not_self_check check (user_id <> friend_id),
  constraint friendships_pair_unique unique (user_id, friend_id)
);

create index if not exists idx_friendships_user_id on public.friendships(user_id);
create index if not exists idx_friendships_friend_id on public.friendships(friend_id);
create index if not exists idx_friendships_status on public.friendships(status);

alter table public.friendships enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can create their own profile'
  ) then
    create policy "Users can create their own profile"
    on public.profiles for insert
    to authenticated
    with check ((select auth.uid()) = id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'friendships'
      and policyname = 'Users can read their friendships'
  ) then
    create policy "Users can read their friendships"
    on public.friendships for select
    to authenticated
    using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'friendships'
      and policyname = 'Users can request friendships'
  ) then
    create policy "Users can request friendships"
    on public.friendships for insert
    to authenticated
    with check (user_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'friendships'
      and policyname = 'Friend request recipients can respond'
  ) then
    create policy "Friend request recipients can respond"
    on public.friendships for update
    to authenticated
    using (friend_id = (select auth.uid()) or user_id = (select auth.uid()))
    with check (
      (friend_id = (select auth.uid()) or user_id = (select auth.uid()))
      and user_id <> friend_id
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'friendships'
      and policyname = 'Users can remove their friendships'
  ) then
    create policy "Users can remove their friendships"
    on public.friendships for delete
    to authenticated
    using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));
  end if;
end;
$$;
