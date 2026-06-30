-- Groups overhaul: public/private groups with hashed passwords, course
-- tagging, member roster visibility, and locked-down sensitive columns.

alter table public.groups
  add column if not exists visibility text not null default 'public',
  add column if not exists password_hash text,
  add column if not exists course text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'groups_visibility_check'
      and conrelid = 'public.groups'::regclass
  ) then
    alter table public.groups
      add constraint groups_visibility_check check (visibility in ('public', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'groups_private_password_check'
      and conrelid = 'public.groups'::regclass
  ) then
    alter table public.groups
      add constraint groups_private_password_check
      check ((visibility = 'private') = (password_hash is not null));
  end if;
end;
$$;

-- password_hash is verified server-side only (service role); invite_code is
-- only needed by confirmed members and must never leak to non-members, since
-- it's the sole join path for private groups.
revoke select (password_hash, invite_code) on public.groups from authenticated;

-- SECURITY DEFINER avoids RLS self-reference recursion: this function reads
-- group_members with the privileges of its owner (the table owner), bypassing
-- RLS for its internal query, rather than being re-evaluated through the
-- group_members SELECT policy that itself depends on this function.
create or replace function public.is_group_member(p_group_id bigint)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_group_member(bigint) from public;
grant execute on function public.is_group_member(bigint) to authenticated;

drop policy if exists "Members can read their groups" on public.groups;

create policy "Groups visible per privacy setting"
on public.groups for select
to authenticated
using (
  visibility = 'public'
  or owner_id = (select auth.uid())
  or public.is_group_member(id)
);

drop policy if exists "Users can read their memberships" on public.group_members;

create policy "Members can read fellow members"
on public.group_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_group_member(group_members.group_id)
);
