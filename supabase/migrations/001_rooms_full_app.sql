-- Rooms Full App schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  role text,
  company text,
  interests text[] default '{}',
  looking_for text,
  can_help_with text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  organizer_name text,
  organizer_id uuid references public.profiles(id) on delete set null,
  description text,
  status text not null default 'live',
  is_public boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists rooms_slug_idx on public.rooms (slug);
create index if not exists rooms_organizer_idx on public.rooms (organizer_id);

-- Attendees
create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  username text,
  claimed_by uuid references public.profiles(id) on delete set null,
  session_token uuid default gen_random_uuid(),
  name text not null,
  email text,
  role text,
  company text,
  interests text[] default '{}',
  looking_for text,
  can_help_with text,
  cluster text,
  avatar_url text,
  is_guest boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists attendees_room_idx on public.attendees (room_id);
create index if not exists attendees_profile_idx on public.attendees (profile_id);
create index if not exists attendees_claimed_idx on public.attendees (claimed_by);
create index if not exists attendees_username_idx on public.attendees (lower(username));

-- Connections
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  from_attendee_id uuid not null references public.attendees(id) on delete cascade,
  to_attendee_id uuid not null references public.attendees(id) on delete cascade,
  note text,
  tags text[] default '{}',
  follow_up boolean default false,
  created_at timestamptz default now(),
  unique (from_attendee_id, to_attendee_id)
);

create index if not exists connections_room_idx on public.connections (room_id);

-- Saved people
create table if not exists public.saved_people (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  from_attendee_id uuid not null references public.attendees(id) on delete cascade,
  saved_attendee_id uuid not null references public.attendees(id) on delete cascade,
  created_at timestamptz default now(),
  unique (from_attendee_id, saved_attendee_id)
);

-- Helper: is user in room?
create or replace function public.is_room_member(room_uuid uuid, user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rooms r
    where r.id = room_uuid
      and (r.is_public or r.organizer_id = user_uuid)
  )
  or exists (
    select 1 from public.attendees a
    where a.room_id = room_uuid
      and (a.claimed_by = user_uuid or a.profile_id = user_uuid)
  );
$$;

-- Aggregate metrics (no private notes)
create or replace function public.get_room_metrics(room_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  room_uuid uuid;
  result json;
begin
  select id into room_uuid from public.rooms where slug = room_slug;
  if room_uuid is null then
    return null;
  end if;

  with att as (
    select * from public.attendees where room_id = room_uuid
  ),
  con as (
    select * from public.connections where room_id = room_uuid
  ),
  active_ids as (
    select distinct from_attendee_id as id from con
    union
    select distinct to_attendee_id from con
  ),
  cluster_activity as (
    select coalesce(a.cluster, 'Other') as name, count(*)::int as count
    from con c
    join att a on a.id = c.from_attendee_id
    group by coalesce(a.cluster, 'Other')
    order by count desc
  ),
  tag_dist as (
    select unnest(tags) as tag, count(*)::int as count
    from con
    group by unnest(tags)
    order by count desc
    limit 10
  ),
  time_buckets as (
    select date_trunc('hour', created_at) as hour, count(*)::int as count
    from con
    group by date_trunc('hour', created_at)
    order by hour
  ),
  bridge_pairs as (
    select
      least(coalesce(f.cluster, 'Other'), coalesce(t.cluster, 'Other')) as c1,
      greatest(coalesce(f.cluster, 'Other'), coalesce(t.cluster, 'Other')) as c2,
      count(*)::int as count
    from con c
    join att f on f.id = c.from_attendee_id
    join att t on t.id = c.to_attendee_id
    where coalesce(f.cluster, 'Other') != coalesce(t.cluster, 'Other')
    group by 1, 2
    order by count desc
    limit 5
  )
  select json_build_object(
    'attendeeCount', (select count(*)::int from att),
    'conversationCount', (select count(*)::int from con),
    'activeAttendeePercentage', case
      when (select count(*) from att) = 0 then 0
      else (select count(*)::float from active_ids) / (select count(*)::float from att)
    end,
    'averageConnectionsPerActiveAttendee', case
      when (select count(*) from active_ids) = 0 then 0
      else (select count(*)::float from con) / (select count(*)::float from active_ids)
    end,
    'followUpIntentCount', (select count(*)::int from con where follow_up),
    'strongestBridge', (
      select json_build_object('from', c1, 'to', c2, 'count', count)
      from bridge_pairs limit 1
    ),
    'mostActiveCluster', (
      select json_build_object('name', name, 'count', count)
      from cluster_activity limit 1
    ),
    'highestFollowUpTag', (
      select json_build_object('tag', tag, 'count', count)
      from tag_dist limit 1
    ),
    'clusterActivity', (select coalesce(json_agg(json_build_object('name', name, 'count', count)), '[]'::json) from cluster_activity),
    'tagDistribution', (select coalesce(json_agg(json_build_object('tag', tag, 'count', count)), '[]'::json) from tag_dist),
    'conversationsOverTime', (select coalesce(json_agg(json_build_object('hour', hour, 'count', count)), '[]'::json) from time_buckets),
    'topBridges', (select coalesce(json_agg(json_build_object('from', c1, 'to', c2, 'count', count)), '[]'::json) from bridge_pairs)
  ) into result;

  return result;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.attendees enable row level security;
alter table public.connections enable row level security;
alter table public.saved_people enable row level security;

-- Profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Rooms
create policy "Public rooms are viewable"
  on public.rooms for select using (
    is_public
    or organizer_id = auth.uid()
    or public.is_room_member(id, auth.uid())
  );

create policy "Authenticated users can create rooms"
  on public.rooms for insert with check (auth.uid() = organizer_id);

create policy "Organizers can update own rooms"
  on public.rooms for update using (organizer_id = auth.uid());

create policy "Organizers can delete own rooms"
  on public.rooms for delete using (organizer_id = auth.uid());

-- Attendees
create policy "Attendees viewable in accessible rooms"
  on public.attendees for select using (
    public.is_room_member(room_id, auth.uid())
    or exists (select 1 from public.rooms r where r.id = room_id and r.is_public)
  );

create policy "Organizers can insert attendees"
  on public.attendees for insert with check (
    exists (
      select 1 from public.rooms r
      where r.id = room_id and r.organizer_id = auth.uid()
    )
  );

create policy "Users can claim attendee row"
  on public.attendees for update using (
    public.is_room_member(room_id, auth.uid())
    or exists (select 1 from public.rooms r where r.id = room_id and r.is_public)
  );

-- Connections: only owner can read/write their connections
create policy "Users read own connections"
  on public.connections for select using (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

create policy "Organizers read aggregate connections in their rooms"
  on public.connections for select using (
    exists (
      select 1 from public.rooms r
      where r.id = room_id and r.organizer_id = auth.uid()
    )
  );

create policy "Users insert own connections"
  on public.connections for insert with check (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

create policy "Users update own connections"
  on public.connections for update using (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

-- Saved people
create policy "Users read own saved"
  on public.saved_people for select using (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

create policy "Users insert own saved"
  on public.saved_people for insert with check (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

create policy "Users delete own saved"
  on public.saved_people for delete using (
    exists (
      select 1 from public.attendees a
      where a.id = from_attendee_id
        and (a.claimed_by = auth.uid() or a.profile_id = auth.uid())
    )
  );

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Realtime
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.attendees;

-- Updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
