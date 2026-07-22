import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard, 
  Dumbbell, 
  Video, 
  TrendingUp, 
  MessageSquare, 
  Award 
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  coach: string;
  date: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoSrc: string;
}

const RECORDED_VIDEOS: Recording[] = [
  {
    id: 'rec-1',
    title: 'Full-Body HIIT Circuit',
    coach: 'Coach Maya',
    date: 'Yesterday',
    duration: '45 mins',
    category: 'HIIT & Cardio',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-2',
    title: 'Advanced Mobility & Core',
    coach: 'Coach Maya',
    date: '3 days ago',
    duration: '30 mins',
    category: 'Recovery',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-3',
    title: 'Nutrition Q&A Masterclass',
    coach: 'Coach Maya',
    date: '1 week ago',
    duration: '60 mins',
    category: 'Wellness',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

export default function RecordedSessions() {
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-8">
        {/* Hero Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            FitForge Live
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recorded Sessions On Demand
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Replay premium workouts and nutrition classes anytime.
          </p>
        </div>

        {/* Next Class Highlight Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/50">
              Fast-Track Live Fitness
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Your Next Coach-Led Class</h3>
          <p className="text-xs text-slate-400 leading-normal mb-4 max-w-md">
            Interactive movement cues, live chat feedback, and post-workout recovery summaries.
          </p>

          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
            <span>Join Live Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Past Sessions List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Past Live Sessions & Replays
            </h3>
            <span className="text-xs text-slate-400">{RECORDED_VIDEOS.length} Available</span>
          </div>

          <div className="space-y-3">
            {RECORDED_VIDEOS.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 p-3.5 transition-all duration-200 flex items-center gap-4 shadow-sm hover:shadow-md"
              >
                {/* Thumbnail Preview */}
                <div className="relative w-24 h-20 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur-xs text-[10px] font-medium text-slate-200 px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium mb-1">
                    <span>{video.coach}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{video.category}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors truncate mb-1.5">
                    {video.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {video.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{selectedVideo.title}</h3>
                <p className="text-xs text-slate-400">{selectedVideo.coach}</p>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video 
                src={selectedVideo.videoSrc} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
          <button className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400 hover:text-slate-200 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Dumbbell className="w-4 h-4" />
            <span className="text-[10px] font-medium">Programs</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-1 px-2 text-emerald-400 font-semibold">
            <Video className="w-4 h-4" />
            <span className="text-[10px]">Recorded</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400 hover:text-slate-200 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-medium">Progress</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400 hover:text-slate-200 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-medium">Messages</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-1 px-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-bold tracking-tight">Coach Pro</span>
          </button>
        </div>
      </nav>
    </div>
  );
}