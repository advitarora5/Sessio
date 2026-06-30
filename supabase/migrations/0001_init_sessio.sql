-- Sessio MVP schema, indexes, Row Level Security, and auth hooks.

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  major text,
  year text,
  study_focus text,
  role text default 'STUDENT',
  created_at timestamptz not null default now()
);

create table public.spots (
  id bigserial primary key,
  name text not null,
  description text,
  area text,
  lat numeric,
  lng numeric,
  tags text[],
  created_at timestamptz not null default now(),
  constraint spots_name_unique unique (name)
);

create table public.groups (
  id bigserial primary key,
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table public.group_members (
  id bigserial primary key,
  group_id bigint not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  constraint group_members_group_user_unique unique (group_id, user_id)
);

create table public.sessions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id bigint references public.groups(id) on delete set null,
  spot_id bigint references public.spots(id) on delete set null,
  title text not null,
  category text,
  start_time timestamptz not null,
  end_time timestamptz,
  status text not null default 'active',
  target_duration_minutes int not null,
  duration_minutes int,
  distraction_free boolean not null default false,
  goal_completed boolean,
  notes text,
  summary_ai text,
  visibility text not null default 'group',
  created_at timestamptz not null default now(),
  constraint sessions_status_check check (status in ('active', 'completed', 'canceled')),
  constraint sessions_visibility_check check (visibility in ('private', 'group', 'public')),
  constraint sessions_target_duration_positive check (target_duration_minutes > 0),
  constraint sessions_duration_nonnegative check (duration_minutes is null or duration_minutes >= 0)
);

create table public.likes (
  id bigserial primary key,
  session_id bigint not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_session_user_unique unique (session_id, user_id)
);

create table public.deadlines (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course text,
  title text,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.friendships (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_status_check check (status in ('pending', 'accepted', 'blocked')),
  constraint friendships_not_self_check check (user_id <> friend_id),
  constraint friendships_pair_unique unique (user_id, friend_id)
);

create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_group_id on public.sessions(group_id);
create index idx_sessions_spot_id on public.sessions(spot_id);
create index idx_sessions_start_time on public.sessions(start_time);
create index idx_sessions_status on public.sessions(status);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_group_members_group_id on public.group_members(group_id);
create index idx_groups_owner_id on public.groups(owner_id);
create index idx_likes_session_id on public.likes(session_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_deadlines_user_id on public.deadlines(user_id);
create index idx_friendships_user_id on public.friendships(user_id);
create index idx_friendships_friend_id on public.friendships(friend_id);
create index idx_friendships_status on public.friendships(status);

alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.sessions enable row level security;
alter table public.likes enable row level security;
alter table public.deadlines enable row level security;
alter table public.friendships enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can read profiles attached to visible sessions"
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.sessions s
    where s.user_id = profiles.id
      and (
        s.user_id = (select auth.uid())
        or s.visibility = 'public'
        or (
          s.visibility = 'group'
          and s.group_id is not null
          and exists (
            select 1
            from public.group_members gm
            where gm.group_id = s.group_id
              and gm.user_id = (select auth.uid())
          )
        )
      )
  )
);

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can read spots"
on public.spots for select
to authenticated
using (true);

create policy "Members can read their groups"
on public.groups for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = (select auth.uid())
  )
);

create policy "Users can create owned groups"
on public.groups for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "Owners can update their groups"
on public.groups for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Owners can delete their groups"
on public.groups for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can read their memberships"
on public.group_members for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can join as themselves"
on public.group_members for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can remove their own memberships"
on public.group_members for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read visible sessions"
on public.sessions for select
to authenticated
using (
  user_id = (select auth.uid())
  or visibility = 'public'
  or (
    visibility = 'group'
    and group_id is not null
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = sessions.group_id
        and gm.user_id = (select auth.uid())
    )
  )
);

create policy "Users can create their own sessions"
on public.sessions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    group_id is null
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = sessions.group_id
        and gm.user_id = (select auth.uid())
    )
  )
);

create policy "Users can update their own sessions"
on public.sessions for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (
    group_id is null
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = sessions.group_id
        and gm.user_id = (select auth.uid())
    )
  )
);

create policy "Users can delete their own sessions"
on public.sessions for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Authenticated users can read likes on visible sessions"
on public.likes for select
to authenticated
using (
  exists (
    select 1
    from public.sessions s
    where s.id = likes.session_id
  )
);

create policy "Users can like visible sessions as themselves"
on public.likes for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.sessions s
    where s.id = likes.session_id
  )
);

create policy "Users can remove their own likes"
on public.likes for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their deadlines"
on public.deadlines for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their deadlines"
on public.deadlines for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their deadlines"
on public.deadlines for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their deadlines"
on public.deadlines for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their friendships"
on public.friendships for select
to authenticated
using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

create policy "Users can request friendships"
on public.friendships for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Friend request recipients can respond"
on public.friendships for update
to authenticated
using (friend_id = (select auth.uid()) or user_id = (select auth.uid()))
with check (
  (friend_id = (select auth.uid()) or user_id = (select auth.uid()))
  and user_id <> friend_id
);

create policy "Users can remove their friendships"
on public.friendships for delete
to authenticated
using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    username,
    major,
    year,
    study_focus,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
        || '_' || left(new.id::text, 8)
    ),
    nullif(new.raw_user_meta_data ->> 'major', ''),
    nullif(new.raw_user_meta_data ->> 'year', ''),
    nullif(new.raw_user_meta_data ->> 'study_focus', ''),
    coalesce(nullif(upper(new.raw_user_meta_data ->> 'role'), ''), 'STUDENT')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
