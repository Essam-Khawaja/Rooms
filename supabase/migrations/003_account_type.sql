-- Add account_type to profiles (organizer vs attendee)
alter table public.profiles
  add column if not exists account_type text not null default 'attendee'
  check (account_type in ('organizer', 'attendee'));

-- Rewrite signup trigger to read account_type and display_name from auth metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acct_type text;
begin
  acct_type := coalesce(new.raw_user_meta_data->>'account_type', 'attendee');
  if acct_type not in ('organizer', 'attendee') then
    acct_type := 'attendee';
  end if;

  insert into public.profiles (id, display_name, avatar_url, account_type)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    acct_type
  );
  return new;
end;
$$;
