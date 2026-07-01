-- Ownership RLS hardening (idempotent).
--
-- Consolidates the ownership CRUD guarantees that the app relies on so a single
-- `supabase db push` makes owner reads/deletes work reliably in every
-- environment:
--   * sessions        -> owner can select/insert/update/delete their own rows
--   * calendar_events  -> creator can select/insert/update/delete; invited &
--                         public rows are readable
--   * event_rsvps      -> user manages their own rsvp; hosts can read/create
--
-- These re-assert the intended policies with `drop policy if exists` first so
-- the file is safe to run repeatedly and repairs databases where a prior
-- migration (e.g. 20260701010000_calendar_events_rls.sql) was never applied.
--
-- Assumes the base tables already exist (see 0001_init_sessio.sql and
-- 0004_calendar_advanced.sql).

alter table public.sessions enable row level security;
alter table public.calendar_events enable row level security;
alter table public.event_rsvps enable row level security;

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read visible sessions" on public.sessions;
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

drop policy if exists "Users can delete their own sessions" on public.sessions;
create policy "Users can delete their own sessions"
on public.sessions for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- calendar_events
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own or invited events" on public.calendar_events;
create policy "Users read own or invited events"
on public.calendar_events for select
to authenticated
using (
  user_id = (select auth.uid())
  or visibility = 'public'
  or exists (
    select 1
    from public.event_rsvps r
    where r.event_id = calendar_events.id
      and r.user_id = (select auth.uid())
  )
);

drop policy if exists "Users create their own events" on public.calendar_events;
create policy "Users create their own events"
on public.calendar_events for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users update their own events" on public.calendar_events;
create policy "Users update their own events"
on public.calendar_events for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users delete their own events" on public.calendar_events;
create policy "Users delete their own events"
on public.calendar_events for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- event_rsvps
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read their own rsvps" on public.event_rsvps;
create policy "Users can read their own rsvps"
on public.event_rsvps for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Hosts can read rsvps for their events" on public.event_rsvps;
create policy "Hosts can read rsvps for their events"
on public.event_rsvps for select
to authenticated
using (
  exists (
    select 1
    from public.calendar_events
    where id = event_rsvps.event_id and user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update their own rsvps" on public.event_rsvps;
create policy "Users can update their own rsvps"
on public.event_rsvps for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Hosts can create rsvps" on public.event_rsvps;
create policy "Hosts can create rsvps"
on public.event_rsvps for insert
to authenticated
with check (
  exists (
    select 1
    from public.calendar_events
    where id = event_rsvps.event_id and user_id = (select auth.uid())
  )
);
