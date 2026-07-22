import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  X, 
  Plus, 
  Minus, 
  Bookmark, 
  Share2, 
  Star, 
  MessageSquare, 
  LayoutDashboard, 
  Dumbbell, 
  Video, 
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  avatarText: string;
  avatarBg: string;
  image: string;
  description: string;
  detailedBio: string;
  tags: string[];
  batchPrice: number;
  oneOnOnePrice: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

const TRAINERS_DATA: Trainer[] = [
  {
    id: '1',
    name: 'Marcus Webb',
    specialty: 'Strength & Muscle Growth',
    avatarText: 'MW',
    avatarBg: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    description: 'Ideal for athletes who want a structured plan, weekly check-ins, and measurable progress.',
    detailedBio: 'Certified CSCS strength coach with 8+ years experience training competitive lifters and bodybuilders. Includes form analysis, macro targets, and direct WhatsApp messaging.',
    tags: ['Powerlifting', 'Nutrition', 'Recovery'],
    batchPrice: 2999,
    oneOnOnePrice: 4999,
    originalPrice: 6999,
    rating: 4.9,
    reviewCount: 128,
    reviews: [
      { id: 'r1', userName: 'Aman S.', rating: 5, comment: 'Gained 4kg of lean mass in 12 weeks. Form reviews are super fast!', date: '2 days ago' },
      { id: 'r2', userName: 'Rohan M.', rating: 5, comment: 'Great diet plan options that actually fit Indian household meals.', date: '1 week ago' },
    ],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    specialty: 'Olympic Lifting & Mobility',
    avatarText: 'SC',
    avatarBg: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    description: 'Perfect for clients who want better movement mechanics, cleaner form, and sustainable progress.',
    detailedBio: 'Former Olympic lifting competitor focusing on mobility drills, posture restoration, and snatch/clean & jerk technique perfection.',
    tags: ['Mobility', 'Technique', 'HIIT'],
    batchPrice: 2799,
    oneOnOnePrice: 4599,
    originalPrice: 5999,
    rating: 4.8,
    reviewCount: 94,
    reviews: [
      { id: 'r3', userName: 'Priya K.', rating: 5, comment: 'My shoulder pain vanished after 3 mobility routines with Coach Sarah.', date: '3 days ago' },
    ],
  },
  {
    id: '3',
    name: 'Dr. James Park',
    specialty: 'Sports Science & Nutrition',
    avatarText: 'JP',
    avatarBg: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    description: 'Best for clients chasing performance optimization with a science-led nutrition and recovery plan.',
    detailedBio: 'Ph.D. in Kinesiology specializing in metabolic rate recovery, blood biomarker analysis, and elite endurance conditioning.',
    tags: ['Recovery', 'Nutrition', 'Endurance'],
    batchPrice: 3499,
    oneOnOnePrice: 5999,
    originalPrice: 7999,
    rating: 5.0,
    reviewCount: 156,
    reviews: [
      { id: 'r4', userName: 'Vikram R.', rating: 5, comment: 'Science-backed approach, no fluff. Best investment for my marathon prep.', date: 'Yesterday' },
    ],
  },
];

interface Props {
  onNavigate?: (tab: string) => void;
}

export default function TrainerSubscriptionFlow({ onNavigate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [planType, setPlanType] = useState<'batch' | '1on1'>('1on1');
  const [months, setMonths] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTrainer(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSubscriptionModal = (trainer: Trainer, initialPlan: 'batch' | '1on1' = '1on1') => {
    setSelectedTrainer(trainer);
    setPlanType(initialPlan);
    setMonths(1);
    setSpecialNote('');
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTrainers = TRAINERS_DATA.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* SCREEN 1: TRAINER DIRECTORY (Image 2 UI Style) */}
      <header className="px-4 py-3 bg-slate-950/90 border-b border-slate-900 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h1 className="text-lg font-bold text-white">Coach</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-6">
        {/* Banner Highlights */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            1-ON-1 COACHING
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
            Train smarter with a dedicated coach
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Personalized programming, form reviews, nutrition guidance, and direct support from experts who keep you accountable.
          </p>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs text-slate-300">
            <span>🔥</span>
            <span>Limited offer till <strong className="text-white">26th July</strong></span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">AVG. RESULTS</p>
              <p className="text-sm font-black text-white">2.3x</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">RESPONSE</p>
              <p className="text-sm font-black text-white">&lt; 4 hrs</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">SUCCESS</p>
              <p className="text-sm font-black text-white">94%</p>
            </div>
          </div>
        </div>

        {/* Directory List Title & Search */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Find a trainer and buy instantly</h3>
              <p className="text-xs text-slate-400">Search a coach by name, then choose batch access or one-to-one support.</p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search trainer name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Trainer Cards (Image 2 UI Style) */}
          <div className="space-y-4">
            {filteredTrainers.map((trainer) => (
              <div 
                key={trainer.id}
                onClick={() => openSubscriptionModal(trainer, '1on1')}
                className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-3.5 shadow-md hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${trainer.avatarBg} text-slate-950 font-black flex items-center justify-center text-sm shadow-md`}>
                      {trainer.avatarText}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{trainer.name}</h4>
                      <p className="text-xs text-emerald-400 font-medium">{trainer.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-white">{trainer.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                  {trainer.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {trainer.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openSubscriptionModal(trainer, 'batch');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-all active:scale-[0.98]"
                  >
                    Join Batch • ₹{trainer.batchPrice}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openSubscriptionModal(trainer, '1on1');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98]"
                  >
                    Book 1:1 • ₹{trainer.oneOnOnePrice}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* SCREEN 2: POP-UP MODAL SHEET (Image 1 UI Style) */}
      {selectedTrainer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4"
          onClick={() => setSelectedTrainer(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button (Exact Image 1 Style) */}
            <button 
              onClick={() => setSelectedTrainer(null)}
              className="absolute top-3 right-3 z-30 bg-slate-950/80 hover:bg-slate-950 text-white p-2 rounded-full border border-slate-800 backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto flex-1 p-4 space-y-5">
              
              {/* Media Image Header */}
              <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-800 -mx-4 -mt-4 mb-2">
                <img src={selectedTrainer.image} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {selectedTrainer.specialty}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">{selectedTrainer.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">{selectedTrainer.rating}</span>
                    <span className="text-[10px] text-slate-400">({selectedTrainer.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Certified FitForge Coach</span>
                  </div>

                  {/* Bookmark & Share Icons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => toggleBookmark(selectedTrainer.id, e)}
                      className="p-1.5 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked[selectedTrainer.id] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                    </button>
                    <button className="p-1.5 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTrainer.detailedBio}
                </p>
              </div>

              {/* Subscription Option Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Select Coaching Tier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPlanType('batch')}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      planType === 'batch' 
                        ? 'bg-emerald-950/30 border-emerald-500 text-white' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold">Group Batch</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">₹{selectedTrainer.batchPrice}/mo</p>
                    {planType === 'batch' && <Check className="w-3.5 h-3.5 text-emerald-400 absolute top-2.5 right-2.5" />}
                  </button>

                  <button 
                    onClick={() => setPlanType('1on1')}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      planType === '1on1' 
                        ? 'bg-emerald-950/30 border-emerald-500 text-white' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold">Dedicated 1:1</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">₹{selectedTrainer.oneOnOnePrice}/mo</p>
                    {planType === '1on1' && <Check className="w-3.5 h-3.5 text-emerald-400 absolute top-2.5 right-2.5" />}
                  </button>
                </div>
              </div>

              {/* Special Note Request Input (Matching Food App Custom Request) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Add custom fitness goal / injury note (optional)
                </label>
                <p className="text-[11px] text-slate-400">
                  {selectedTrainer.name} will tailor your workouts and nutrition to these inputs.
                </p>
                <input 
                  type="text"
                  placeholder="e.g. Focus on chest growth, back recovery..."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Reviews Section */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Client Reviews</span>
                  <span className="text-emerald-400 text-[11px]">{selectedTrainer.reviews.length} Featured</span>
                </h4>

                <div className="space-y-2">
                  {selectedTrainer.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{rev.userName}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] text-slate-300">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Checkout Actions Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3">
              {/* Duration / Months Counter */}
              <div className="flex items-center justify-between border border-emerald-500/40 rounded-xl bg-emerald-950/20 px-2 py-2.5 min-w-[90px]">
                <button 
                  onClick={() => setMonths((m) => Math.max(1, m - 1))}
                  className="text-emerald-400 hover:text-white p-0.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold text-white">{months} mo</span>
                <button 
                  onClick={() => setMonths((m) => m + 1)}
                  className="text-emerald-400 hover:text-white p-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Buy Subscription CTA Button */}
              {(() => {
                const pricePerMonth = planType === '1on1' ? selectedTrainer.oneOnOnePrice : selectedTrainer.batchPrice;
                const totalPrice = pricePerMonth * months;
                const totalOriginal = selectedTrainer.originalPrice * months;

                return (
                  <button 
                    onClick={() => {
                      alert(`Subscribed to ${selectedTrainer.name} (${planType.toUpperCase()}) for ${months} month(s) at ₹${totalPrice}!`);
                      setSelectedTrainer(null);
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                  >
                    <span>Subscribe Now</span>
                    <span>
                      <span className="line-through text-slate-800 mr-1 text-[11px]">
                        ₹{totalOriginal}
                      </span>
                      ₹{totalPrice}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
          <button onClick={() => onNavigate?.('dashboard')} className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>

          <button onClick={() => onNavigate?.('programs')} className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400">
            <Dumbbell className="w-4 h-4" />
            <span className="text-[10px] font-medium">Programs</span>
          </button>

          <button onClick={() => onNavigate?.('recorded')} className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400">
            <Video className="w-4 h-4" />
            <span className="text-[10px] font-medium">Recorded</span>
          </button>

          <button onClick={() => onNavigate?.('progress')} className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-medium">Progress</span>
          </button>

          <button onClick={() => onNavigate?.('messages')} className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-medium">Messages</span>
          </button>

          <button onClick={() => onNavigate?.('coach')} className="flex flex-col items-center gap-1 py-1 px-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm">
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-bold tracking-tight">Coach Pro</span>
          </button>
        </div>
      </nav>
    </div>
  );
}