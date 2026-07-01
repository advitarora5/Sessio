-- Calendar events RLS.
--
-- calendar_events had no explicit owner policies, so event creators could not
-- delete their own events and invited users could not read events they were
-- invited to (pending invites silently resolved to null through the
-- event_rsvps embed). This adds owner-scoped CRUD plus invited/public read.
--
-- Note: this follows the same assumption as 0004_calendar_advanced.sql — the
-- calendar_events base table already exists in the project database.

alter table public.calendar_events enable row level security;

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
