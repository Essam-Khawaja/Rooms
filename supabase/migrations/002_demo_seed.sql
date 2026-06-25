-- Demo room seed (run after 001)
-- Inserts public demo room with sample attendees

insert into public.rooms (id, slug, name, organizer_name, description, status, is_public)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo',
  'Startup Mixer 2026',
  'Essam',
  'A networking night for builders and founders.',
  'live',
  true
) on conflict (slug) do nothing;

insert into public.attendees (room_id, name, email, role, company, interests, looking_for, can_help_with, cluster) values
('00000000-0000-4000-8000-000000000001', 'Aisha Khan', 'aisha@example.com', 'ML Student', 'UCalgary', array['AI','Robotics','Computer Vision'], 'ML internship leads', 'Model evaluation and Python', 'Students'),
('00000000-0000-4000-8000-000000000001', 'Marcus Lee', 'marcus@example.com', 'Founder', 'Nova Labs', array['Startups','AI','Product'], 'Technical cofounder', 'Pitch strategy', 'Founders'),
('00000000-0000-4000-8000-000000000001', 'Priya Shah', 'priya@example.com', 'Recruiter', 'Northstar Tech', array['Hiring','Software Engineering','Internships'], 'Strong student builders', 'Resume feedback', 'Recruiters'),
('00000000-0000-4000-8000-000000000001', 'Daniel Kim', 'daniel@example.com', 'Designer', 'Freelance', array['UX','Branding','Startups'], 'Founder projects', 'Landing page design', 'Designers'),
('00000000-0000-4000-8000-000000000001', 'Sarah Chen', 'sarah@example.com', 'Software Engineer', 'Stripe', array['AI','Distributed Systems','Startups'], 'Side project collaborators', 'Backend architecture', 'Engineers'),
('00000000-0000-4000-8000-000000000001', 'James Okonkwo', 'james@example.com', 'PhD Researcher', 'MIT', array['AI','Research','Computer Vision'], 'Industry partnerships', 'Research collaboration', 'Researchers'),
('00000000-0000-4000-8000-000000000001', 'Elena Rodriguez', 'elena@example.com', 'Product Manager', 'Figma', array['Product','Design','Startups'], 'Early-stage founders', 'Product strategy', 'Founders'),
('00000000-0000-4000-8000-000000000001', 'Tyler Wong', 'tyler@example.com', 'CS Student', 'UCalgary', array['AI','Startups','Web Development'], 'Hackathon teammates', 'Full-stack development', 'Students'),
('00000000-0000-4000-8000-000000000001', 'Nina Patel', 'nina@example.com', 'VC Associate', 'Horizon Ventures', array['Startups','AI','Investing'], 'Pre-seed founders', 'Fundraising advice', 'Recruiters'),
('00000000-0000-4000-8000-000000000001', 'Alex Morrison', 'alex@example.com', 'DevOps Engineer', 'AWS', array['Cloud','Distributed Systems','Startups'], 'Infrastructure challenges', 'Cloud architecture', 'Engineers'),
('00000000-0000-4000-8000-000000000001', 'Maya Johnson', 'maya@example.com', 'UX Researcher', 'Google', array['UX','Research','AI'], 'Design partners', 'User research methods', 'Researchers'),
('00000000-0000-4000-8000-000000000001', 'Ryan Foster', 'ryan@example.com', 'Founder', 'HealthAI', array['AI','Healthcare','Startups'], 'ML engineers', 'Healthcare domain expertise', 'Founders'),
('00000000-0000-4000-8000-000000000001', 'Lisa Wang', 'lisa@example.com', 'Brand Designer', 'Studio L', array['Branding','Design','Startups'], 'Startup clients', 'Visual identity', 'Designers'),
('00000000-0000-4000-8000-000000000001', 'Omar Hassan', 'omar@example.com', 'Data Science Student', 'UCalgary', array['AI','Data Science','Research'], 'Research mentors', 'Data analysis', 'Students'),
('00000000-0000-4000-8000-000000000001', 'Kate Sullivan', 'kate@example.com', 'Talent Lead', 'Shopify', array['Hiring','Startups','Product'], 'Senior engineers', 'Interview prep', 'Recruiters'),
('00000000-0000-4000-8000-000000000001', 'David Park', 'david@example.com', 'Mobile Engineer', 'Spotify', array['Mobile','Startups','Design'], 'iOS side projects', 'Swift and React Native', 'Engineers'),
('00000000-0000-4000-8000-000000000001', 'Rachel Green', 'rachel@example.com', 'Research Scientist', 'DeepMind', array['AI','Research','Robotics'], 'Academic collaborators', 'Paper reviews', 'Researchers'),
('00000000-0000-4000-8000-000000000001', 'Chris Bell', 'chris@example.com', 'Founder', 'GreenTech', array['Startups','Climate','Product'], 'Climate tech engineers', 'Sustainability strategy', 'Founders'),
('00000000-0000-4000-8000-000000000001', 'Jenny Liu', 'jenny@example.com', 'Product Designer', 'Airbnb', array['UX','Design','Startups'], 'Design system work', 'Design critiques', 'Designers'),
('00000000-0000-4000-8000-000000000001', 'Mike Thompson', 'mike@example.com', 'MBA Student', 'Haskayne', array['Startups','Investing','Product'], 'Technical cofounders', 'Business development', 'Students')
on conflict do nothing;
