import { useState, useEffect, useRef, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { MobileNav, MobileHeader } from './components/Sidebar';
import { TrainerSidebar, TrainerMobileBottomNav, TrainerMobileDrawerNav, TrainerMobileHeader } from './components/TrainerSidebar';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import Programs from './components/Programs';
import ProgramExerciseLibraryPage from './components/ProgramExerciseLibraryPage';
import ProgramDetails from './components/ProgramDetails';
import TrainerDirectory from './components/TrainerDirectory';
import TrainerProfile from './components/TrainerProfile';
import SessionSummary from './components/SessionSummary';
import CoachPage from './components/CoachPage';
import LivePage from './components/LivePage';
import ProgressPage from './components/ProgressPage';
import ProfilePage from './components/ProfilePage';
import ClientMessenger from './components/ClientMessenger';
import ClientViewerRoom from './components/ClientViewerRoom';
import TrainerRoster from './components/TrainerRoster';
import TrainerProgramBuilder from './components/TrainerProgramBuilder';
import TrainerDietManager from './components/TrainerDietManager';
import TrainerFormCheckDesk from './components/TrainerFormCheckDesk';
import TrainerInbox from './components/TrainerInbox';
import TrainerBroadcasterStudio from './components/TrainerBroadcasterStudio';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import BottomNavbar from './components/BottomNavbar';
import MealPlanResultsPage from './components/MealPlanResultsPage';
import MealPlanPage from './components/MealPlanPage';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './lib/auth';
import { useLive } from './lib/live';
import type { Profile } from './lib/supabase';
import type { Page, TrainerPage, UserProfile } from './types';
import { MOCK_USER } from './data';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  workout: 'Log Workout',
  programs: 'Programs',
  coach: 'Coach',
  live: 'Live',
  recordings: 'Recorded Sessions',
  progress: 'Progress',
  meal_plan: 'Meal Plan',
  meal_plan_results: 'Your Meal Plan',
  profile: 'Profile',
  messages: 'Messages',
};

const TRAINER_PAGE_TITLES: Record<TrainerPage, string> = {
  roster: 'Client Roster',
  program: 'Program Builder',
  nutrition: 'Nutrition',
  studio: 'Live Studio',
  formcheck: 'Form Check Desk',
  inbox: 'Unified Inbox',
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center glow-teal animate-pulse">
          <div className="w-6 h-6 border-2 border-emerald-400/40 border-t-emerald-300 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading FitForge...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { session, profile, loading, signOut } = useAuth();
  const { isViewing, activeSession } = useLive();
  const location = useLocation();
  const navigate = useNavigate();

  const demoDisabled = typeof window !== 'undefined' && localStorage.getItem('fitforge_demo_disabled') === 'true';
  const isDemoMode = !session && !profile && import.meta.env.DEV && !demoDisabled;

  const demoProfile = useMemo<Profile>(() => ({
    id: 'demo-trainer',
    email: 'marcus@fitforge.app',
    role: 'trainer',
    name: 'Marcus Webb',
    avatar_url: null,
    trainer_id: null,
    created_at: new Date().toISOString(),
  }), []);

  const effectiveSession = session ?? (isDemoMode ? ({ user: { id: 'demo-trainer' } } as Session) : null);

  // Guarantee effectiveProfile exists if effectiveSession is active
  const effectiveProfile = useMemo<Profile | null>(() => {
    if (profile) return profile;
    if (isDemoMode) return demoProfile;
    if (session) {
      const email = session.user.email || 'user@example.com';
      const namePart = email.split('@')[0] || 'User';
      return {
        id: session.user.id,
        email: email,
        role: 'client',
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        created_at: new Date().toISOString(),
      } as Profile;
    }
    return null;
  }, [profile, isDemoMode, demoProfile, session]);

  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('fitforge_onboarded') === 'true');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [showSplash, setShowSplash] = useState(true);

  // Client nav state
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const isExerciseLibraryRoute = /^\/programs\/[^/]+\/exercises(?:\/[^/]+)?$/.test(location.pathname);
  const isProgramDetailsRoute = /^\/programs\/[^/]+$/.test(location.pathname);
  const isTrainerDirectoryRoute = location.pathname === '/trainers';
  const isTrainerProfileRoute = /^\/trainers\/[^/]+$/.test(location.pathname);
  const isSessionSummaryRoute = /^\/sessions\/[^/]+\/summary$/.test(location.pathname);

  // Trainer nav state
  const [trainerPage, setTrainerPage] = useState<TrainerPage>('roster');
  const [trainerCollapsed, setTrainerCollapsed] = useState(false);
  const [trainerMobileNavOpen, setTrainerMobileNavOpen] = useState(false);
  const [trainerInboxActiveChat, setTrainerInboxActiveChat] = useState(false);
  const [clientMessengerActiveChat, setClientMessengerActiveChat] = useState(false);

  useEffect(() => {
    if (effectiveProfile) {
      setUser(prev => {
        if (prev.name === effectiveProfile.name && prev.email === effectiveProfile.email) return prev;
        return { ...prev, name: effectiveProfile.name, email: effectiveProfile.email };
      });
    }
  }, [effectiveProfile]);

  useEffect(() => {
    if (!loading && !effectiveSession) {
      setShowSplash(true);
      return;
    }
    setShowSplash(false);
  }, [loading, effectiveSession]);

  useEffect(() => {
    if (isExerciseLibraryRoute) {
      setCurrentPage('programs');
    }
  }, [isExerciseLibraryRoute]);

  useEffect(() => {
    void isTourOpen;
  }, [isTourOpen]);

  useEffect(() => {
    if (location.pathname === '/meal-plan') {
      setCurrentPage('meal_plan');
      return;
    }

    if (location.pathname === '/meal-plan/results') {
      setCurrentPage('meal_plan_results');
      return;
    }

    if (currentPage === 'meal_plan' && location.pathname !== '/meal-plan' && location.pathname !== '/' && location.pathname !== '/meal-plan/results') {
      navigate('/meal-plan', { replace: true });
    }
  }, [currentPage, location.pathname, navigate]);

  const handleOnboardingComplete = (profileData: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...profileData }));
    setOnboarded(true);
    localStorage.setItem('fitforge_onboarded', 'true');
  };

  const handleClientNavigate = (page: Page) => {
    if (page === 'dashboard' || page === 'meal_plan' || page === 'meal_plan_results') {
      setCurrentPage('dashboard');
      navigate('/', { replace: false });
      setMobileNavOpen(false);
      return;
    }

    setCurrentPage(page);
    setMobileNavOpen(false);
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleSubscribe = (
    tier: 'monthly' | 'quarterly' | 'annual',
    subscriptionContext?: { coachName?: string; subscriptionType?: 'batch' | 'personal' }
  ) => {
    setUser(prev => ({
      ...prev,
      subscriptionTier: tier,
      subscriptionType: subscriptionContext?.subscriptionType ?? prev.subscriptionType ?? 'personal',
      activeCoachName: subscriptionContext?.coachName ?? prev.activeCoachName,
    }));
    setCurrentPage('coach');
  };

  const handleSubscriptionChange = (tier: 'free' | 'monthly' | 'quarterly' | 'annual') => {
    setUser(prev => ({ ...prev, subscriptionTier: tier }));
  };

  const handleSignOut = async () => {
    localStorage.removeItem('fitforge_onboarded');
    localStorage.removeItem('fitforge_tour_seen');
    localStorage.removeItem('isFirstTimeUser');
    try {
      localStorage.setItem('fitforge_demo_disabled', 'true');
    } catch (e) {
      // ignore
    }
    await signOut();
  };

  useEffect(() => {
    if (session || profile) {
      try {
        localStorage.removeItem('fitforge_demo_disabled');
      } catch (e) {
        // ignore
      }
    }
  }, [session, profile]);

  if (loading) return <LoadingScreen />;
  if (showSplash && !effectiveSession) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!effectiveSession || !effectiveProfile) return <LoginScreen />;

  if (effectiveProfile.role === 'client' && !onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ---- Client live viewer overlay ----
  if (effectiveProfile.role === 'client' && isViewing && activeSession) {
    return <ClientViewerRoom />;
  }

  const role = effectiveProfile.role || 'client';
  const isMessagesChatOpen = currentPage === 'messages' && clientMessengerActiveChat;

  // ============ TRAINER INTERFACE ============
  if (role === 'trainer' || role === 'admin') {
    const mainPaddingLeft = trainerCollapsed ? 'lg:pl-16' : 'lg:pl-60';
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
          <div className="fixed top-0 right-0 z-[100] flex items-center gap-2 p-3">
            <div className="flex items-center gap-2 rounded-[1.1rem] border border-emerald-500/20 bg-white/80 px-3 py-1.75 shadow-[0_0_30px_rgba(16,185,129,0.12)] backdrop-blur-xl dark:bg-[#030712]/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-bold text-slate-950">
                  {effectiveProfile.name ? effectiveProfile.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
              </div>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 sm:inline">{effectiveProfile.name}</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <TrainerSidebar
              currentPage={trainerPage}
              onNavigate={setTrainerPage}
              collapsed={trainerCollapsed}
              onToggle={() => setTrainerCollapsed(c => !c)}
              onSignOut={handleSignOut}
            />
          </div>
          <TrainerMobileDrawerNav
            currentPage={trainerPage}
            onNavigate={setTrainerPage}
            isOpen={trainerMobileNavOpen}
            onClose={() => setTrainerMobileNavOpen(false)}
            onSignOut={handleSignOut}
          />
          {!((trainerPage === 'inbox' && trainerInboxActiveChat)) && (
            <TrainerMobileBottomNav
              currentPage={trainerPage}
              onNavigate={setTrainerPage}
            />
          )}
          <TrainerMobileHeader
            onMenuOpen={() => setTrainerMobileNavOpen(true)}
            title={TRAINER_PAGE_TITLES[trainerPage] ?? TRAINER_PAGE_TITLES['roster']}
          />
          <main className={`${mainPaddingLeft} min-h-screen bg-slate-50 dark:bg-[#030712] transition-all duration-300 ${trainerPage === 'inbox' && trainerInboxActiveChat ? 'overflow-hidden' : ''}`}>
            <div className={`mx-auto max-w-6xl ${trainerPage === 'inbox' && trainerInboxActiveChat ? 'h-[100dvh] overflow-hidden px-0 py-0' : 'pt-20 lg:pt-0 px-4 md:px-6 lg:px-8 py-6 lg:py-8'}`}>
              {trainerPage === 'roster' && <TrainerRoster />}
              {trainerPage === 'program' && <TrainerProgramBuilder />}
              {trainerPage === 'nutrition' && <TrainerDietManager />}
              {trainerPage === 'studio' && <TrainerBroadcasterStudio />}
              {trainerPage === 'formcheck' && <TrainerFormCheckDesk />}
              {trainerPage === 'inbox' && <TrainerInbox onActiveChatChange={setTrainerInboxActiveChat} />}
            </div>
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  // ============ CLIENT INTERFACE ============
  const mainPaddingLeft = sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60';
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <div className="fixed top-0 right-0 z-[100] flex items-center gap-2 p-3">
        <div className="flex items-center gap-2 rounded-[1.1rem] border border-emerald-500/20 bg-white/80 px-3 py-1.75 shadow-[0_0_30px_rgba(16,185,129,0.12)] backdrop-blur-xl dark:bg-[#030712]/90">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-bold text-slate-950">
              {effectiveProfile.name ? effectiveProfile.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
          </div>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 sm:inline">{effectiveProfile.name}</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleClientNavigate}
          isSubscribed={user.subscriptionTier !== 'free'}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          onSignOut={handleSignOut}
        />
      </div>
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleClientNavigate}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onSignOut={handleSignOut}
      />
      <MobileHeader
        onMenuOpen={() => setMobileNavOpen(true)}
        title={isExerciseLibraryRoute ? 'Exercise Library' : PAGE_TITLES[currentPage]}
      />
      <main className={`${mainPaddingLeft} bg-slate-50 dark:bg-[#030712] transition-all duration-300 ${isMessagesChatOpen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        <div
          ref={node => {
            scrollContainerRef.current = node as HTMLElement | null;
          }}
          className={`mx-auto ${isMessagesChatOpen ? 'h-screen w-full max-w-none overflow-hidden px-0 py-0' : 'h-screen max-w-5xl overflow-y-auto px-4 py-6 pb-24 pt-20 md:px-6 lg:px-8 lg:py-8 lg:pt-0'}`}
        >
          {isExerciseLibraryRoute ? (
            <Routes>
              <Route path="/programs/:programId/exercises/:videoId?" element={<ProgramExerciseLibraryPage />} />
            </Routes>
          ) : isProgramDetailsRoute ? (
            <ProgramDetails />
          ) : isTrainerDirectoryRoute ? (
            <TrainerDirectory />
          ) : isTrainerProfileRoute ? (
            <TrainerProfile />
          ) : isSessionSummaryRoute ? (
            <SessionSummary />
          ) : currentPage === 'meal_plan_results' || location.pathname === '/meal-plan/results' ? (
            <MealPlanResultsPage />
          ) : currentPage === 'meal_plan' || location.pathname === '/meal-plan' ? (
            <MealPlanPage />
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  user={user}
                  onNavigate={handleClientNavigate}
                  onTourStateChange={setIsTourOpen}
                />
              )}
              {currentPage === 'workout' && (
                <WorkoutTracker />
              )}
              {currentPage === 'programs' && (
                <Programs onNavigate={setCurrentPage} />
              )}
              {currentPage === 'coach' && (
                <CoachPage
                  subscriptionTier={user.subscriptionTier}
                  onSubscribe={handleSubscribe}
                />
              )}
              {currentPage === 'live' && (
                activeSession ? (
                  <ClientViewerRoom />
                ) : (
                  <LivePage
                    subscriptionTier={user.subscriptionTier}
                    onNavigateToCoach={() => setCurrentPage('coach')}
                  />
                )
              )}
              {currentPage === 'recordings' && (
                activeSession ? (
                  <ClientViewerRoom />
                ) : (
                  <LivePage
                    subscriptionTier={user.subscriptionTier}
                    onNavigateToCoach={() => setCurrentPage('coach')}
                    showRecordingsOnly
                  />
                )
              )}
              {currentPage === 'progress' && (
                <ProgressPage onNavigate={setCurrentPage} />
              )}
              {currentPage === 'messages' && (
                <ClientMessenger
                  user={user}
                  onUpgrade={() => handleSubscribe('monthly')}
                  onActiveChatChange={setClientMessengerActiveChat}
                />
              )}
              {currentPage === 'profile' && (
                <ProfilePage
                  user={user}
                  onSubscriptionChange={handleSubscriptionChange}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </>
          )}
        </div>
      </main>
      {!clientMessengerActiveChat && (
        <BottomNavbar
          currentPage={currentPage}
          onNavigate={handleClientNavigate}
          isSubscribed={user.subscriptionTier !== 'free'}
          scrollContainerRef={scrollContainerRef}
          forceVisible={true}
        />
      )}
    </div>
  );
}