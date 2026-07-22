/*
# Create profiles table for role-based authentication

## Purpose
Stores user profile data (name, role, avatar) linked to Supabase auth.users.
Each user is either a "client" or a "trainer". Clients optionally reference
their assigned trainer via trainer_id.

## New Tables
- `profiles`
  - `id` (uuid, PK, references auth.users) — one row per auth user
  - `email` (text, not null) — denormalized from auth.users for convenience
  - `role` (text, not null, default 'client') — 'client' | 'trainer'
  - `name` (text, not null) — display name
  - `avatar_url` (text, nullable) — optional avatar image URL
  - `trainer_id` (uuid, nullable, references profiles.id) — set for clients
  - `created_at` (timestamptz, default now())

## Security (RLS)
- RLS enabled on profiles.
- Users can read their own profile row (SELECT, auth.uid() = id).
- Users can insert their own profile row (INSERT, WITH CHECK auth.uid() = id).
- Users can update their own profile row (UPDATE, auth.uid() = id).
- Trainers can read profiles of clients assigned to them
  (SELECT where trainer_id = auth.uid()).
- No DELETE policy — profiles are not deletable from the client.

## Notes
1. The `role` column lives in the profiles table (not raw_app_meta_data)
   so it is queryable and updatable via standard Supabase client calls.
2. trainer_id self-references profiles.id, allowing a trainer's own profile
   to be the target of a client's foreign key.
3. On signup, the frontend inserts a profiles row with the chosen role.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'trainer')),
  name text NOT NULL DEFAULT '',
  avatar_url text,
  trainer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Trainers can read profiles of their assigned clients
DROP POLICY IF EXISTS "trainer_read_assigned_clients" ON profiles;
CREATE POLICY "trainer_read_assigned_clients"
  ON profiles FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

-- Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index for trainer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_id ON profiles(trainer_id) WHERE trainer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
