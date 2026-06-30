-- Add media_url column to sessions table for photo/video uploads
alter table public.sessions
add column if not exists media_url text;

-- Create storage bucket for session media
insert into storage.buckets (id, name, public)
values ('session-media', 'session-media', true)
on conflict (id) do nothing;

-- Storage policies for session media bucket
create policy "Users can upload their own session media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'session-media' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own session media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'session-media' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public can view session media"
on storage.objects for select
to public
using (bucket_id = 'session-media');

create policy "Users can update their own session media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'session-media' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own session media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'session-media' and
  (storage.foldername(name))[1] = auth.uid()::text
);
