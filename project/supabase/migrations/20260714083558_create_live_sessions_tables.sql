/*
# Create live_sessions and live_chat tables

## Purpose
Support the Live Streaming Studio feature. Trainers host live workout sessions;
clients join and chat in real time.

## New Tables

### live_sessions
- `id` (uuid, PK)
- `trainer_id` (uuid, FK → profiles.id, NOT NULL, DEFAULT auth.uid()) — the hosting trainer
- `title` (text, NOT NULL) — stream title e.g. "Live Full Body HIIT - 9:00 AM"
- `linked_workout_id` (text, nullable) — optional reference to a workout routine
- `status` (text, NOT NULL, DEFAULT 'scheduled') — 'scheduled' | 'live' | 'ended'
- `started_at` (timestamptz, nullable) — when the stream went live
- `ended_at` (timestamptz, nullable) — when the stream ended
- `viewer_count` (int, DEFAULT 0) — current viewer count
- `created_at` (timestamptz, DEFAULT now())

### live_chat
- `id` (uuid, PK)
- `session_id` (uuid, FK → live_sessions.id ON DELETE CASCADE, NOT NULL)
- `user_id` (uuid, FK → profiles.id, NOT NULL, DEFAULT auth.uid())
- `user_name` (text, NOT NULL) — denormalized display name
- `user_role` (text, NOT NULL, DEFAULT 'client') — 'client' | 'trainer'
- `message` (text, NOT NULL)
- `timestamp` (timestamptz, DEFAULT now())

## Security (RLS)
Both tables have RLS enabled.

### live_sessions
- SELECT: authenticated users can see all sessions (clients need to discover
  live sessions from their trainer). Using true here because session discovery
  is intentionally shared among authenticated users.
- INSERT/UPDATE: only the trainer who owns the session (trainer_id = auth.uid()).
- DELETE: only the owning trainer.

### live_chat
- SELECT: authenticated users can read chat messages for any session (chat is
  visible to all participants).
- INSERT: any authenticated user can post messages (DEFAULT auth.uid() fills
  user_id).
- DELETE/UPDATE: only the message author (user_id = auth.uid()).

## Notes
1. `trainer_id` defaults to auth.uid() so trainers can insert without passing it.
2. `user_id` on live_chat defaults to auth.uid() for the same reason.
3. Status column uses a CHECK constraint to ensure valid values.
4. Session discovery (SELECT) is shared among authenticated users because clients
   must see when their trainer goes live — this is intentional shared data.
*/

CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  linked_workout_id text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  started_at timestamptz,
  ended_at timestamptz,
  viewer_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can discover sessions
DROP POLICY IF EXISTS "select_live_sessions" ON live_sessions;
CREATE POLICY "select_live_sessions"
  ON live_sessions FOR SELECT
  TO authenticated USING (true);

-- Only the trainer can insert their own sessions
DROP POLICY IF EXISTS "insert_own_session" ON live_sessions;
CREATE POLICY "insert_own_session"
  ON live_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = trainer_id);

-- Only the trainer can update their own sessions
DROP POLICY IF EXISTS "update_own_session" ON live_sessions;
CREATE POLICY "update_own_session"
  ON live_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);

-- Only the trainer can delete their own sessions
DROP POLICY IF EXISTS "delete_own_session" ON live_sessions;
CREATE POLICY "delete_own_session"
  ON live_sessions FOR DELETE
  TO authenticated USING (auth.uid() = trainer_id);

CREATE INDEX IF NOT EXISTS idx_live_sessions_trainer ON live_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);

-- live_chat table
CREATE TABLE IF NOT EXISTS live_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_role text NOT NULL DEFAULT 'client' CHECK (user_role IN ('client', 'trainer')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE live_chat ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read chat messages (shared during live sessions)
DROP POLICY IF EXISTS "select_live_chat" ON live_chat;
CREATE POLICY "select_live_chat"
  ON live_chat FOR SELECT
  TO authenticated USING (true);

-- Any authenticated user can post messages
DROP POLICY IF EXISTS "insert_live_chat" ON live_chat;
CREATE POLICY "insert_live_chat"
  ON live_chat FOR INSERT
  TO authenticated WITH CHECK (true);

-- Only the author can delete their own messages
DROP POLICY IF EXISTS "delete_own_chat" ON live_chat;
CREATE POLICY "delete_own_chat"
  ON live_chat FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Only the author can update their own messages
DROP POLICY IF EXISTS "update_own_chat" ON live_chat;
CREATE POLICY "update_own_chat"
  ON live_chat FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_live_chat_session ON live_chat(session_id, timestamp);
