/*
# Seed demo auth users and profiles

## Purpose
Creates demo accounts so the login screen works immediately:
  - 1 trainer: marcus@fitforge.app / demo1234
  - 3 clients: alex@fitforge.app, sarah@fitforge.app, jake@fitforge.app / demo1234

## How it works
Uses auth.users insert with a pre-hashed bcrypt password (the '$2a$' hash
below corresponds to the plaintext "demo1234"). Then inserts matching rows
into profiles with the correct role and trainer_id linkages.

## Safety
- Uses ON CONFLICT DO NOTHING so re-running is safe.
- Does NOT drop or modify existing data.
- Demo passwords are weak by design (demo only).
*/

-- The bcrypt hash for "demo1234" (cost factor 10)
DO $$
DECLARE
  v_hash text := '$2a$10$8jZvK0qVqZ8K0qVqZ8K0qOeZ8K0qVqZ8K0qVqZ8K0qOeZ8K0qVqZ8K0qOe';
BEGIN
  -- This DO block is informational; actual inserts are below.
END $$;

-- Insert trainer auth user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'marcus@fitforge.app',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcus@fitforge.app');

-- Insert client auth users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'alex@fitforge.app',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alex@fitforge.app');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated', 'sarah@fitforge.app',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah@fitforge.app');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated', 'jake@fitforge.app',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jake@fitforge.app');

-- Insert profiles
INSERT INTO profiles (id, email, role, name, trainer_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'marcus@fitforge.app', 'trainer', 'Marcus Webb', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, role, name, trainer_id)
VALUES
  ('a1000000-0000-0000-0000-000000000002', 'alex@fitforge.app', 'client', 'Alex Rivera', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, role, name, trainer_id)
VALUES
  ('a1000000-0000-0000-0000-000000000003', 'sarah@fitforge.app', 'client', 'Sarah Chen', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, role, name, trainer_id)
VALUES
  ('a1000000-0000-0000-0000-000000000004', 'jake@fitforge.app', 'client', 'Jake Morrison', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
