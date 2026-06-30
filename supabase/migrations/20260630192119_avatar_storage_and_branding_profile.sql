-- Avatar uploads, uppercase onboarding role, signup metadata sync, and DND sessions.

alter table public.profiles
  alter column role set default 'STUDENT';

update public.profiles
set role = coalesce(nullif(upper(role), ''), 'STUDENT')
where role is null or role <> upper(role);

alter table public.sessions
  add column if not exists distraction_free boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Avatar images are publicly readable'
  ) then
    create policy "Avatar images are publicly readable"
    on storage.objects for select
    to public
    using (bucket_id = 'avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own avatar images'
  ) then
    create policy "Users can upload their own avatar images"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'avatars'
      and name like ((select auth.uid())::text || '/%')
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own avatar images'
  ) then
    create policy "Users can update their own avatar images"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'avatars'
      and name like ((select auth.uid())::text || '/%')
    )
    with check (
      bucket_id = 'avatars'
      and name like ((select auth.uid())::text || '/%')
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own avatar images'
  ) then
    create policy "Users can delete their own avatar images"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'avatars'
      and name like ((select auth.uid())::text || '/%')
    );
  end if;
end;
$$;

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
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    username = excluded.username,
    major = excluded.major,
    year = excluded.year,
    study_focus = excluded.study_focus,
    role = excluded.role;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
