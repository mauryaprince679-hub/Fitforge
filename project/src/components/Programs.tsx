import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Clock, 
  Globe, 
  Dumbbell, 
  Download, 
  Lock, 
  ChevronRight, 
  CheckCircle2, 
  Flame,
  Sparkles,
  MessageCircleMore,
  PlayCircle
} from 'lucide-react';

export type DetailTab = 'about' | 'trainers' | 'trial' | 'schedule' | 'faq';
export type CatalogView = 'batches' | 'coaching';
export type FilterTag = 'All' | 'Fat Loss' | '1-on-1 PT' | 'Hypertrophy' | 'Beginner Friendly' | 'Home Workout';

export interface FeaturedVideo {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  url: string;
}

export interface CatalogCard {
  id: string;
  title: string;
  category: string;
  subBadge: string;
  headline: string;
  audienceTag: string;
  languageTag: string;
  programName: string;
  bullets: string[];
  price: string;
  originalPrice: string;
  discount: string;
  startsOn: string;
  duration: string;
  tags: FilterTag[];
  gradient: string;
  accent: string;
  topBadge: string;
  view: CatalogView;
  trainers: Array<{ name: string; role: string; avatar: string; followers: string }>;
  trialVideoTitle: string;
  trialVideoUrl: string;
  featuredVideos: FeaturedVideo[];
  schedule: Array<{
    date: string;
    month: string;
    time: string;
    category: string;
    title: string;
    trainer: string;
    locked: boolean;
  }>;
}

const filterOptions: FilterTag[] = ['All', 'Fat Loss', '1-on-1 PT', 'Hypertrophy', 'Beginner Friendly', 'Home Workout'];

export const batchCatalog: CatalogCard[] = [
  {
    id: 'batch-1',
    title: 'SHREDDED 2.0 BATCH',
    category: 'FAT LOSS',
    subBadge: 'Includes Custom Diet Protocol',
    headline: 'Transform 90: High-Intensity Shred',
    audienceTag: 'Goal: Extreme Fat Loss',
    languageTag: 'Hinglish / English',
    programName: '90-day transformation batch with daily accountability and guided nutrition.',
    bullets: ['Personalized Daily Workout Splits', 'Custom Calorie & Macro Meal Plans', 'Starts on 27th July'],
    price: '₹2,999',
    originalPrice: '₹4,500',
    discount: '33% OFF',
    startsOn: '27th Jul\'26',
    duration: '3 Months',
    tags: ['Fat Loss', 'Hypertrophy', 'Beginner Friendly'],
    gradient: 'from-blue-900/40 via-slate-900/60 to-[#091124]',
    accent: 'text-blue-400',
    topBadge: '⭐ Multiple Tiers inside: Basic, Pro, Elite',
    view: 'batches',
    trainers: [
      { name: 'Aarav Sharma', role: 'Head Hypertrophy Coach', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', followers: '14K followers' },
      { name: 'Megha Kapoor', role: 'Nutritionist & Fat Loss Specialist', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', followers: '21K followers' },
      { name: 'Sidharth Verma', role: 'Mobility & HIIT Trainer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', followers: '8.5K followers' },
    ],
    trialVideoTitle: 'High Intensity Fat Burn & Core Activation Prep',
    trialVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    featuredVideos: [
      {
        id: 'vid-1',
        title: 'High Intensity Fat Burn & Core Activation Prep',
        subtitle: 'Form breakdown & warmup protocol',
        duration: '12 mins',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        id: 'vid-2',
        title: 'Lower Body Mobility & Core Warmup',
        subtitle: 'Hip openers & dynamic stretches',
        duration: '10 mins',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      }
    ],
    schedule: [
      { date: '20', month: 'JUL', time: '5:30 PM', category: 'FAT LOSS HIIT', title: 'Metabolic Conditioning & Core Sculpting', trainer: 'Aarav Sharma', locked: true },
      { date: '21', month: 'JUL', time: '6:00 PM', category: 'NUTRITION', title: 'Macro Counting & Meal Prep Masterclass', trainer: 'Megha Kapoor', locked: true },
      { date: '23', month: 'JUL', time: '5:30 PM', category: 'STRENGTH', title: 'Upper Body Hypertrophy & Technique', trainer: 'Sidharth Verma', locked: true },
    ]
  },
  {
    id: 'batch-2',
    title: 'MUSCLE BUILD 360',
    category: 'HYPERTROPHY',
    subBadge: 'Includes Weekly Progress Review',
    headline: 'Lean Bulk Sprint Cohort',
    audienceTag: 'Goal: Hypertrophy',
    languageTag: 'English / Hindi',
    programName: 'A muscle-building batch built for consistent gain without the fluff.',
    bullets: ['Structured 4-Day Training Split', 'Protein-first meal targets', 'Starts on 3rd August'],
    price: '₹3,499',
    originalPrice: '₹5,200',
    discount: '32% OFF',
    startsOn: '3rd Aug\'26',
    duration: '4 Months',
    tags: ['Hypertrophy', 'Home Workout'],
    gradient: 'from-cyan-900/40 via-slate-900/60 to-[#091124]',
    accent: 'text-cyan-400',
    topBadge: '⭐ Multiple Tiers inside: Basic, Pro, Elite',
    view: 'batches',
    trainers: [
      { name: 'Aarav Sharma', role: 'Head Hypertrophy Coach', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', followers: '14K followers' },
      { name: 'Rohan Mehra', role: 'Powerlifting Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', followers: '18K followers' }
    ],
    trialVideoTitle: 'Hypertrophy Form Demo & Hypertrophy Class',
    trialVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    featuredVideos: [
      {
        id: 'vid-101',
        title: 'Hypertrophy Form Demo & Hypertrophy Class',
        subtitle: 'Barbell setups and compound movement cues',
        duration: '15 mins',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      }
    ],
    schedule: [
      { date: '03', month: 'AUG', time: '7:00 AM', category: 'HYPERTROPHY', title: 'Barbell Squats & Quad Hypertrophy Focus', trainer: 'Aarav Sharma', locked: true },
      { date: '04', month: 'AUG', time: '7:00 AM', category: 'BENCH PRESS', title: 'Chest, Shoulders & Triceps Drive', trainer: 'Rohan Mehra', locked: true },
    ]
  },
];

export const coachingCatalog: CatalogCard[] = [
  {
    id: 'coach-1',
    title: '1:1 COACHING LAB',
    category: 'PERSONAL COACHING',
    subBadge: 'Includes Weekly Check-Ins',
    headline: 'Dedicated Personal Trainer for Fat Loss',
    audienceTag: 'Goal: 1-on-1 PT',
    languageTag: 'Hinglish / English',
    programName: 'Private coaching with nutrition feedback, form review, and habit tracking.',
    bullets: ['Personalized daily workout plan', 'Weekly video form check-ins', 'Starts this week'],
    price: '₹4,999',
    originalPrice: '₹7,500',
    discount: '33% OFF',
    startsOn: 'Flexible',
    duration: '1 Month Renewal',
    tags: ['1-on-1 PT', 'Fat Loss'],
    gradient: 'from-blue-900/40 via-indigo-950/60 to-[#091124]',
    accent: 'text-blue-300',
    topBadge: '⭐ Dedicated Coach + Premium Support',
    view: 'coaching',
    trainers: [
      { name: 'Sidharth Verma', role: '1:1 Coach', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', followers: '8.5K followers' },
    ],
    trialVideoTitle: '1:1 Form Check & Assessment Walkthrough',
    trialVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    featuredVideos: [
      {
        id: 'vid-201',
        title: '1:1 Form Check & Assessment Walkthrough',
        subtitle: 'Movement audit and mobility baseline',
        duration: '8 mins',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
      }
    ],
    schedule: [
      { date: '25', month: 'JUL', time: '10:00 AM', category: '1:1 CONSULT', title: 'Personalized Movement & Mobility Audit', trainer: 'Sidharth Verma', locked: true },
    ]
  },
];

// Exports both for default component import and for named 'programs' import in Exercise Library
export const programs = [...batchCatalog, ...coachingCatalog];

interface ProgramsProps {
  onNavigate?: (page: string) => void;
}

export default function Programs({ onNavigate }: ProgramsProps) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<CatalogView>('batches');
  const [activeFilter, setActiveFilter] = useState<FilterTag>('All');
  const [search, setSearch] = useState('');
  const [goalLabel, setGoalLabel] = useState('Goal: Fat Loss & Muscle Building');
  const [selectedGoal, setSelectedGoal] = useState<'all' | 'fat-loss' | 'muscle'>('all');

  // Redirection / Detail View state
  const [selectedProgram, setSelectedProgram] = useState<CatalogCard | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('about');

  const catalog = activeView === 'batches' ? batchCatalog : coachingCatalog;
  const visibleOffers = catalog.filter(item => {
    const matchesFilter = activeFilter === 'All' || item.tags.includes(activeFilter);
    const searchText = `${item.title} ${item.headline} ${item.programName}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase().trim());
    return matchesFilter && (search.trim() === '' || matchesSearch);
  });

  const handleGoalChange = () => {
    if (selectedGoal === 'all') {
      setSelectedGoal('fat-loss');
      setActiveFilter('Fat Loss');
      setGoalLabel('Goal: Fat Loss Focus');
    } else if (selectedGoal === 'fat-loss') {
      setSelectedGoal('muscle');
      setActiveFilter('Hypertrophy');
      setGoalLabel('Goal: Muscle Building Focus');
    } else {
      setSelectedGoal('all');
      setActiveFilter('All');
      setGoalLabel('Goal: Fat Loss & Muscle Building');
    }
  };

  // --- 1. DETAILED SCREEN REDIRECT PAGE (MATCHES IMAGES 1, 2, 3 UI) ---
  if (selectedProgram) {
    return (
      <div className="min-h-screen bg-[#091124] text-slate-100 pb-28 animate-fade-in font-sans">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between bg-[#030712]/90 backdrop-blur px-4 py-3 border-b border-blue-900/30">
          <button 
            type="button" 
            onClick={() => setSelectedProgram(null)}
            className="p-1.5 text-slate-300 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-none">
            {selectedProgram.title}
          </h2>
          <button type="button" className="p-1.5 text-slate-300 hover:bg-white/10 rounded-full transition">
            <Share2 size={18} />
          </button>
        </div>

        {/* Tab Navigation Menu (About, Educators, Trial, Schedule, FAQ) */}
        <div className="flex border-b border-white/10 bg-[#060c1a] px-3 overflow-x-auto no-scrollbar sticky top-[53px] z-30">
          {(['about', 'trainers', 'trial', 'schedule', 'faq'] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold capitalize whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'trainers' ? 'Educators' : tab}
            </button>
          ))}
        </div>

        <div className="p-4 max-w-xl mx-auto space-y-4">
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#0e1935] p-3 rounded-2xl border border-blue-500/20 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mb-1.5">
                    <Calendar size={16} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Starts on</div>
                  <div className="text-xs font-bold text-white mt-0.5">{selectedProgram.startsOn}</div>
                </div>

                <div className="bg-[#0e1935] p-3 rounded-2xl border border-blue-500/20 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mb-1.5">
                    <Clock size={16} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Duration</div>
                  <div className="text-xs font-bold text-white mt-0.5">{selectedProgram.duration}</div>
                </div>

                <div className="bg-[#0e1935] p-3 rounded-2xl border border-blue-500/20 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mb-1.5">
                    <Globe size={16} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Language</div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">{selectedProgram.languageTag}</div>
                </div>
              </div>

              {/* Batch Includes Card */}
              <div className="bg-[#0e1935] p-4 rounded-2xl border border-blue-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white">Batch includes</h3>
                <div className="space-y-2.5">
                  {selectedProgram.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                        <Dumbbell size={14} />
                      </div>
                      <span className="text-xs font-medium text-slate-200">{bullet}</span>
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-blue-500/40 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/10 transition mt-2"
                >
                  <Download size={14} />
                  Download Brochure
                </button>
              </div>

              {/* Educators / Trainers Section */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-white">Educators</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {selectedProgram.trainers.map((trainer, idx) => (
                    <div key={idx} className="min-w-[140px] bg-[#0e1935] rounded-2xl border border-blue-500/20 p-3 text-center shrink-0">
                      <img 
                        src={trainer.avatar} 
                        alt={trainer.name} 
                        className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-400 mb-2"
                      />
                      <div className="text-xs font-bold text-white truncate">{trainer.name}</div>
                      <div className="text-[10px] text-slate-400">{trainer.followers}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATORS */}
          {activeTab === 'trainers' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Assigned Educators & Coaches</h3>
              {selectedProgram.trainers.map((trainer, idx) => (
                <div key={idx} className="flex items-center gap-3.5 bg-[#0e1935] p-3.5 rounded-2xl border border-blue-500/20">
                  <img src={trainer.avatar} alt={trainer.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-400" />
                  <div>
                    <h4 className="font-bold text-white text-xs">{trainer.name}</h4>
                    <p className="text-[11px] text-blue-400 font-medium">{trainer.role}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{trainer.followers}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TRIAL */}
          {activeTab === 'trial' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Top Trial Classes</h3>
                <div className="mt-2.5 bg-[#0e1935] rounded-2xl border border-blue-500/20 overflow-hidden">
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <video 
                      src={selectedProgram.trialVideoUrl} 
                      controls 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs font-bold text-white">{selectedProgram.trialVideoTitle}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Aarav Sharma • 122 views</div>
                  </div>
                </div>
              </div>

              {/* Batch Schedule preview inside Trial Tab */}
              <div className="bg-[#0e1935] p-3.5 rounded-2xl border border-blue-500/20 space-y-2.5">
                <div className="text-xs font-bold text-white">Batch schedule</div>
                {selectedProgram.schedule.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="text-center font-bold text-white shrink-0">
                      <div className="text-[10px] text-slate-400">{item.month}</div>
                      <div className="text-sm">{item.date}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">{item.time}</span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase">{item.category}</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.trainer}</div>
                    </div>
                    {item.locked && <Lock size={14} className="text-slate-400 shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="bg-[#0e1935] p-4 rounded-2xl border border-blue-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white">Batch schedule</h3>

              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Week 2: Jul 20 – Jul 26, 2026
                </div>
                {selectedProgram.schedule.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="text-center font-bold text-white shrink-0">
                      <div className="text-[10px] text-slate-400">{item.month}</div>
                      <div className="text-sm">{item.date}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">{item.time}</span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase">{item.category}</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.trainer}</div>
                    </div>
                    {item.locked && <Lock size={14} className="text-slate-400 shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="bg-[#0e1935] p-4 rounded-2xl border border-blue-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white">Frequently Asked Questions</h3>
              <div className="border-b border-white/10 pb-2.5">
                <div className="text-xs font-bold text-white">What equipment do I need?</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dumbbells and a mat are sufficient for live workout sessions.</div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Purchase Footer Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-[#030712] border-t border-blue-900/40 px-4 py-3 z-50 flex items-center justify-between shadow-2xl max-w-xl mx-auto">
          <div>
            <div className="text-lg font-extrabold text-white">{selectedProgram.price}/mo</div>
            <div className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> Live Sessions Included
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('coach') : navigate('/coach')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            Buy now
          </button>
        </div>
      </div>
    );
  }

  // --- 2. BATCH LIST CATALOG ---
  return (
    <div className="space-y-4 pb-24 animate-fade-in font-sans">
      <div className="sticky top-0 z-30 rounded-[1.4rem] border border-blue-500/20 bg-[#08111f]/90 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#030712]/80 px-3 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search batches, transformation plans, or coaches..."
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <span className="text-blue-400">🎯</span>
            <span>{goalLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleGoalChange}
            className="rounded-full border border-blue-500/30 bg-[#030712]/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-400"
          >
            Change Goal
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map(filter => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${activeFilter === filter ? 'bg-blue-600 text-white' : 'border border-white/10 bg-[#030712]/70 text-slate-300'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-full border border-blue-500/20 bg-[#091124]/80 p-1.5">
          <button
            type="button"
            onClick={() => setActiveView('batches')}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all ${activeView === 'batches' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Group Batches
          </button>
          <button
            type="button"
            onClick={() => setActiveView('coaching')}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all ${activeView === 'coaching' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            1-on-1 Personal Coaching
          </button>
        </div>
      </div>

      {/* BATCH CARDS */}
      <div className="space-y-3">
        {visibleOffers.map(item => (
          <div 
            key={item.id} 
            onClick={() => {
              setSelectedProgram(item);
              setActiveTab('about');
            }}
            className="cursor-pointer overflow-hidden rounded-[1.35rem] border border-blue-500/20 bg-[#091124] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:border-blue-500/40"
          >
            <div className={`relative bg-gradient-to-br ${item.gradient} p-4`}>
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-full border border-white/20 bg-[#030712]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                    {item.topBadge}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-xs font-semibold text-white">AR</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-blue-600/50 text-xs font-semibold text-white">MK</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-cyan-600/50 text-xs font-semibold text-white">SN</div>
                  </div>
                  <div className="text-xs text-slate-200">
                    <div className="font-semibold">Aarav • Megha • Sidh</div>
                  </div>
                </div>

                <h3 className="mt-3 text-xl font-black tracking-tight text-white uppercase">{item.title}</h3>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#030712]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                  <Sparkles size={11} className="text-blue-400" />
                  {item.subBadge}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                  {item.audienceTag}
                </span>
                <span className="rounded-full border border-white/10 bg-[#030712]/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  {item.languageTag}
                </span>
              </div>

              <div className="mt-3 text-base font-bold text-white">{item.headline}</div>
              <p className="mt-1 text-xs text-slate-400">{item.programName}</p>

              <div className="mt-3 space-y-2">
                {item.bullets.map(bullet => (
                  <div key={bullet} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                      {item.view === 'batches' ? <Dumbbell size={13} /> : <MessageCircleMore size={13} />}
                    </div>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Free Trial Button inside card */}
              <div className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-left">
                <div className="flex items-center gap-2">
                  <PlayCircle size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-blue-300">Watch Free Trial Video</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.trialVideoTitle}</div>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-blue-300 uppercase shrink-0">
                  Preview
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="line-through">{item.originalPrice}</span>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 font-semibold text-blue-300">{item.discount}</span>
                  </div>
                  <div className="mt-1 text-2xl font-black tracking-tight text-white">{item.price}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
                  >
                    Buy Now
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#030712]/70 text-slate-200">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300">
                <Flame size={13} />
                MONARCH SALE: Extra 10% OFF if booked today
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}