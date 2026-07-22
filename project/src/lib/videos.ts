import { supabase } from './supabase';

export type TrainingVideo = {
  id: string;
  title: string;
  storage_path: string;
  mime_type: 'video/mp4';
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
};

const BUCKET = 'training-videos';
const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

export async function listTrainingVideos() {
  const { data, error } = await supabase.from('training_videos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainingVideo[];
}

export async function createVideoPlaybackUrl(storagePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadTrainingVideo(file: File, title: string, userId: string) {
  if (file.type !== 'video/mp4') throw new Error('Please choose an MP4 video.');
  if (file.size > MAX_VIDEO_SIZE) throw new Error('Videos must be 250 MB or smaller.');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, { contentType: 'video/mp4', upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: metadataError } = await supabase
    .from('training_videos')
    .insert({ title: title.trim() || file.name.replace(/\.mp4$/i, ''), storage_path: storagePath, mime_type: 'video/mp4', size_bytes: file.size, uploaded_by: userId })
    .select()
    .single();

  if (metadataError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw metadataError;
  }
  return data as TrainingVideo;
}
