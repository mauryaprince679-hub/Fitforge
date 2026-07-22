/* Secure trainer/admin video uploads with authenticated in-app playback. */

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'trainer', 'admin'));

CREATE TABLE IF NOT EXISTS training_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL DEFAULT 'video/mp4' CHECK (mime_type = 'video/mp4'),
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE training_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_users_can_view_training_videos"
  ON training_videos FOR SELECT TO authenticated USING (true);

CREATE POLICY "publishers_can_add_training_videos"
  ON training_videos FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

CREATE POLICY "publishers_can_delete_their_training_videos"
  ON training_videos FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

CREATE INDEX IF NOT EXISTS idx_training_videos_created_at ON training_videos(created_at DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('training-videos', 'training-videos', false, 262144000, ARRAY['video/mp4'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "authenticated_users_can_play_training_videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'training-videos');

CREATE POLICY "publishers_can_upload_training_videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'training-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

CREATE POLICY "publishers_can_delete_own_training_videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'training-videos'
    AND owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );
