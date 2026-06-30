-- Reconciliation: this version was already applied directly to the remote
-- database (outside this migrations folder) before being captured here.
-- Schema diffing against the live database (via the PostgREST OpenAPI
-- introspection endpoint) found exactly one undocumented column: a nullable
-- media_url on sessions, presumably for the PRD's session-snapshot/timelapse
-- feature. This file makes that change idempotent and reproducible from a
-- clean migration history; it is a no-op against the already-live database.

alter table public.sessions
  add column if not exists media_url text;
