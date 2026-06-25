-- Demo organizer + attendee accounts with an active demo room
-- Password for both: RoomsDemo2026!
-- Organizer: organizer@rooms.demo (@demorganizer)
-- Attendee:  attendee@rooms.demo  (@demattendee) — linked to Tyler Wong in /r/demo

create extension if not exists pgcrypto;

do $$
declare
  demo_room_id uuid := '00000000-0000-4000-8000-000000000001';
  organizer_id uuid := '00000000-0000-4000-8000-000000000010';
  attendee_id uuid := '00000000-0000-4000-8000-000000000011';
  demo_password text := crypt('RoomsDemo2026!', gen_salt('bf'));
begin
  if not exists (select 1 from auth.users where id = organizer_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      organizer_id,
      'authenticated',
      'authenticated',
      'organizer@rooms.demo',
      demo_password,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Alex Organizer","username":"demorganizer","account_type":"organizer"}'::jsonb,
      now(),
      now()
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      organizer_id,
      organizer_id::text,
      jsonb_build_object(
        'sub', organizer_id::text,
        'email', 'organizer@rooms.demo',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  if not exists (select 1 from auth.users where id = attendee_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      attendee_id,
      'authenticated',
      'authenticated',
      'attendee@rooms.demo',
      demo_password,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Tyler Wong","username":"demattendee","account_type":"attendee"}'::jsonb,
      now(),
      now()
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      attendee_id,
      attendee_id::text,
      jsonb_build_object(
        'sub', attendee_id::text,
        'email', 'attendee@rooms.demo',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  end if;
end $$;

-- Ensure profiles match demo metadata (trigger may have created them already)
insert into public.profiles (id, display_name, account_type, username)
values
  ('00000000-0000-4000-8000-000000000010', 'Alex Organizer', 'organizer', 'demorganizer'),
  ('00000000-0000-4000-8000-000000000011', 'Tyler Wong', 'attendee', 'demattendee')
on conflict (id) do update set
  display_name = excluded.display_name,
  account_type = excluded.account_type,
  username = excluded.username;

-- Wire demo room to organizer
update public.rooms
set
  organizer_id = '00000000-0000-4000-8000-000000000010',
  organizer_name = 'Alex Organizer'
where slug = 'demo';

-- Link demo attendee row to attendee account
update public.attendees
set
  username = 'demattendee',
  email = 'attendee@rooms.demo',
  profile_id = '00000000-0000-4000-8000-000000000011'
where room_id = '00000000-0000-4000-8000-000000000001'
  and name = 'Tyler Wong';

-- Seed connections so Pulse and the map feel alive
insert into public.connections (room_id, from_attendee_id, to_attendee_id, tags, follow_up, note)
select
  '00000000-0000-4000-8000-000000000001',
  a1.id,
  a2.id,
  tags,
  follow_up,
  note
from (values
  ('Tyler Wong', 'Marcus Lee', array['Founder chat', 'Follow up'], true, 'Discussed technical cofounder search'),
  ('Tyler Wong', 'Priya Shah', array['Recruiting'], true, 'Resume feedback scheduled'),
  ('Tyler Wong', 'Sarah Chen', array['Engineering'], false, 'Backend architecture tips'),
  ('Tyler Wong', 'Aisha Khan', array['Students'], false, 'Hackathon teammate potential'),
  ('Marcus Lee', 'Ryan Foster', array['Healthcare AI'], true, 'Shared pitch deck'),
  ('Marcus Lee', 'Elena Rodriguez', array['Product'], false, 'PM perspective on MVP'),
  ('Priya Shah', 'Kate Sullivan', array['Hiring'], false, 'Talent pipeline chat'),
  ('Priya Shah', 'Omar Hassan', array['Internships'], true, 'ML internship intro'),
  ('Sarah Chen', 'Alex Morrison', array['Cloud'], false, 'AWS architecture review'),
  ('Sarah Chen', 'David Park', array['Mobile'], false, 'React Native side project'),
  ('James Okonkwo', 'Rachel Green', array['Research'], true, 'Paper collaboration'),
  ('James Okonkwo', 'Maya Johnson', array['UX Research'], false, 'User study methods'),
  ('Nina Patel', 'Chris Bell', array['Climate'], true, 'Pre-seed interest'),
  ('Nina Patel', 'Ryan Foster', array['Healthcare'], false, 'HealthAI overview'),
  ('Elena Rodriguez', 'Jenny Liu', array['Design'], false, 'Design system chat'),
  ('Elena Rodriguez', 'Lisa Wang', array['Branding'], false, 'Visual identity feedback'),
  ('Mike Thompson', 'Marcus Lee', array['MBA', 'Startups'], true, 'Cofounder fit discussion'),
  ('Mike Thompson', 'Tyler Wong', array['Students'], false, 'Campus builder network')
) as pairs(from_name, to_name, tags, follow_up, note)
join public.attendees a1
  on a1.room_id = '00000000-0000-4000-8000-000000000001'
  and a1.name = pairs.from_name
join public.attendees a2
  on a2.room_id = '00000000-0000-4000-8000-000000000001'
  and a2.name = pairs.to_name
on conflict (from_attendee_id, to_attendee_id) do nothing;

-- Demo attendee saved a few people to meet later
insert into public.saved_people (room_id, from_attendee_id, saved_attendee_id)
select
  '00000000-0000-4000-8000-000000000001',
  tyler.id,
  saved.id
from public.attendees tyler
join public.attendees saved
  on saved.room_id = tyler.room_id
  and saved.name in ('Sarah Chen', 'James Okonkwo', 'Nina Patel')
where tyler.room_id = '00000000-0000-4000-8000-000000000001'
  and tyler.name = 'Tyler Wong'
on conflict (from_attendee_id, saved_attendee_id) do nothing;
