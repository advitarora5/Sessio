-- Migration: likes
-- Description: Kudos on sessions
-- Docs: docs/backend_schema.md §3.5

-- TODO: CREATE TABLE public.likes (
--   id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--   session_id bigint NOT NULL REFERENCES public.sessions(id),
--   user_id uuid NOT NULL REFERENCES public.profiles(id),
--   created_at timestamptz DEFAULT now()
-- );
