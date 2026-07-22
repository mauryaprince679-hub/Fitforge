import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { createVideoPlaybackUrl, type TrainingVideo } from '../lib/videos';

export default function VideoPlayer({ video, className = '' }: { video: TrainingVideo; className?: string }) {
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSource(null);
    setError(null);
    createVideoPlaybackUrl(video.storage_path).then(url => { if (active) setSource(url); }).catch(() => { if (active) setError('This video is currently unavailable.'); });
    return () => { active = false; };
  }, [video.storage_path]);

  return (
    <div className={`overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#030712] ${className}`}>
      <div className="relative aspect-video bg-slate-950">
        {source ? <video className="h-full w-full object-contain" controls playsInline preload="metadata"><source src={source} type="video/mp4" />Your browser does not support video playback.</video>
          : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">{error ? <AlertCircle className="text-rose-400" size={24} /> : <Loader2 className="animate-spin text-emerald-400" size={24} />}<span className="text-sm">{error ?? 'Preparing video...'}</span></div>}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5"><PlayCircle size={16} className="shrink-0 text-emerald-400" /><span className="truncate text-sm font-semibold text-white">{video.title}</span></div>
    </div>
  );
}
