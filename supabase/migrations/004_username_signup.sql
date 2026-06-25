-- Store username from signup metadata on profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acct_type text;
  uname text;
begin
  acct_type := coalesce(new.raw_user_meta_data->>'account_type', 'attendee');
  if acct_type not in ('organizer', 'attendee') then
    acct_type := 'attendee';
  end if;

  uname := lower(trim(new.raw_user_meta_data->>'username'));
  if uname = '' then
    uname := null;
  end if;

  insert into public.profiles (id, display_name, avatar_url, account_type, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    acct_type,
    uname
  );
  return new;
end;
$$;
