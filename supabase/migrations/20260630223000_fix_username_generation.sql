-- Fix username generation to not append UUID when username is provided
-- Only append UUID suffix when auto-generating from email

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provided_username text;
  generated_username text;
begin
  -- Get the username from metadata (cleaned)
  provided_username := lower(regexp_replace(
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), ''),
    '[^a-zA-Z0-9_]',
    '',
    'g'
  ));

  -- If no username provided, generate one from email with UUID suffix
  if provided_username = '' or provided_username is null then
    generated_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
      || '_' || left(new.id::text, 8);
  else
    generated_username := provided_username;
  end if;

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
    generated_username,
    nullif(new.raw_user_meta_data ->> 'major', ''),
    nullif(new.raw_user_meta_data ->> 'year', ''),
    nullif(new.raw_user_meta_data ->> 'study_focus', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'Student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
