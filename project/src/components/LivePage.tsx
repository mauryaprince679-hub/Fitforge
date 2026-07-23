import React, { useEffect, useState } from 'react';
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
  Award,
  Clock3,
  Users
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
    category: 'HIIT',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-2',
    title: 'Advanced Mobility & Core',
    coach: 'Coach Maya',
    date: '3 days ago',
    duration: '30 mins',
    category: 'Mobility',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-3',
    title: 'Nutrition Q&A Masterclass',
    coach: 'Coach Maya',
    date: '1 week ago',
    duration: '60 mins',
    category: 'Nutrition',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-4',
    title: 'Strength Foundations Flow',
    coach: 'Coach Arun',
    date: '2 weeks ago',
    duration: '40 mins',
    category: 'Strength',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

const LIVE_SCHEDULES = [
  { title: 'Strength Lab Live', time: 'Today • 7:30 PM', coach: 'Coach Maya', status: 'LIVE NOW' },
  { title: 'Mobility Reset', time: 'Tomorrow • 6:00 AM', coach: 'Coach Arun', status: 'Starts Soon' },
  { title: 'Nutrition Sprint Q&A', time: 'Thu • 8:00 PM', coach: 'Coach Priya', status: 'Booked' },
];

const FILTER_CATEGORIES = ['All', 'HIIT', 'Mobility', 'Strength', 'Nutrition'];

interface Props {
  subscriptionTier?: 'free' | 'monthly' | 'quarterly' | 'annual';
  onNavigateToCoach?: () => void;
  showRecordingsOnly?: boolean;
}

export default function RecordedSessions({ subscriptionTier, onNavigateToCoach, showRecordingsOnly }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'replays'>('live');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [countdown, setCountdown] = useState('12h 18m');
  void subscriptionTier;
  void onNavigateToCoach;
  void showRecordingsOnly;

  useEffect(() => {
    const target = new Date(Date.now() + 12 * 60 * 60 * 1000 + 18 * 60 * 1000 + 24 * 1000);
    const tick = () => {
      const remaining = Math.max(0, target.getTime() - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredVideos = RECORDED_VIDEOS.filter((video) => {
    if (selectedCategory === 'All') return true;
    return video.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            FitForge Live Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Classes & Replays
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Join the next class in real time or dive into polished replays whenever you want.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/70 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'live' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            🔴 Live Classes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('replays')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'replays' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            🎬 On-Demand Replays
          </button>
        </div>

        <div className={`transition-all duration-300 ${activeTab === 'live' ? 'opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'}`}>
          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center rounded-full border border-emerald-800/60 bg-emerald-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">
                  <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {countdown === '0h 0m 0s' ? 'LIVE NOW' : `Starts in ${countdown}`}
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">Strength Lab Live</h3>
                <p className="mt-1 text-sm text-slate-400">
                  A high-energy strength and recovery session with real-time coaching and chat support.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Next Up</p>
                <p className="text-sm font-semibold text-white">7:30 PM</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                128 members queued
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs">
                <Clock3 className="h-3.5 w-3.5 text-emerald-400" />
                45 mins
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98]">
                <Play className="h-4 w-4 fill-slate-950" />
                Enter Stream
              </button>
              <button className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-white">
                View Schedule
              </button>
            </div>
          </section>

          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upcoming Live Sessions</h3>
              <span className="text-xs text-slate-400">3 scheduled</span>
            </div>
            <div className="space-y-2">
              {LIVE_SCHEDULES.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.coach} • {item.time}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${item.status === 'LIVE NOW' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={`transition-all duration-300 ${activeTab === 'replays' ? 'opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'}`}>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">On-Demand Replays</h3>
              <span className="text-xs text-slate-400">{filteredVideos.length} ready</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTER_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${selectedCategory === category ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-white'}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 transition-colors group-hover:bg-slate-950/20">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/90 text-slate-950 shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 fill-slate-950" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-slate-100">
                      {video.duration}
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300">
                        {video.coach.split(' ').map((word) => word[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{video.coach}</p>
                        <p className="truncate text-xs text-slate-400">{video.category}</p>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{video.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {video.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
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