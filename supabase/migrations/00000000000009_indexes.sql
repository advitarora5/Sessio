-- Migration: indexes
-- Description: Indexes for analytics and RLS performance
-- Docs: docs/backend_schema.md §3.4, docs/trd.md NFR-3

-- TODO: CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
-- TODO: CREATE INDEX idx_sessions_group_id ON public.sessions(group_id);
-- TODO: CREATE INDEX idx_sessions_spot_id ON public.sessions(spot_id);
-- TODO: CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
-- TODO: CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
-- TODO: CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
