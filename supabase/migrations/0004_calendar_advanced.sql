alter table public.calendar_events 
  add column if not exists visibility text not null default 'public',
  add column if not exists is_busy_mask boolean not null default false,
  add column if not exists location text,
  add column if not exists group_id bigint references public.groups(id) on delete set null;

alter table public.calendar_events
  add constraint calendar_events_visibility_check check (visibility in ('public', 'friends', 'group', 'private'));

create table public.event_rsvps (
  id bigserial primary key,
  event_id bigint not null references public.calendar_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint event_rsvps_status_check check (status in ('pending', 'accepted', 'declined')),
  constraint event_rsvps_unique unique (event_id, user_id)
);

create index idx_event_rsvps_event_id on public.event_rsvps(event_id);
create index idx_event_rsvps_user_id on public.event_rsvps(user_id);

alter table public.event_rsvps enable row level security;

create policy "Users can read their own rsvps"
on public.event_rsvps for select
to authenticated
using (user_id = (select auth.uid()));

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

create policy "Users can update their own rsvps"
on public.event_rsvps for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

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
