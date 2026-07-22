import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LiveStreamSession, LiveChatMessage } from '../types';

interface LiveContextValue {
  activeSession: LiveStreamSession | null;
  chatMessages: LiveChatMessage[];
  startStream: (title: string, linkedWorkoutId?: string) => void;
  endStream: () => void;
  joinStream: (sessionId: string) => void;
  leaveStream: () => void;
  isViewing: boolean;
  viewingSessionId: string | null;
  addChatMessage: (msg: Omit<LiveChatMessage, 'id' | 'timestamp' | 'sessionId'>) => void;
  viewerCount: number;
}

const LiveContext = createContext<LiveContextValue | undefined>(undefined);

const TRAINER_ID = 'a1000000-0000-0000-0000-000000000001'; // Marcus Webb

export function LiveProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<LiveStreamSession | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);

  const startStream = useCallback((title: string, linkedWorkoutId?: string) => {
    const session: LiveStreamSession = {
      id: `live_${Date.now()}`,
      trainerId: TRAINER_ID,
      title,
      linkedWorkoutId,
      status: 'live',
      startedAt: new Date().toISOString(),
      viewerCount: 12,
      createdAt: new Date().toISOString(),
    };
    setActiveSession(session);
    setViewerCount(12);
    // Seed initial chat
    setChatMessages([
      { id: 'lc_seed_1', sessionId: session.id, userId: 'u_client_2', userName: 'Sarah Chen', userRole: 'client', message: 'Ready to go!', timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 'lc_seed_2', sessionId: session.id, userId: 'u_client_1', userName: 'Alex Rivera', userRole: 'client', message: "Let's crush this!", timestamp: new Date(Date.now() - 30000).toISOString() },
    ]);
  }, []);

  const endStream = useCallback(() => {
    setActiveSession(null);
    setIsViewing(false);
    setViewingSessionId(null);
    setChatMessages([]);
    setViewerCount(0);
  }, []);

  const joinStream = useCallback((sessionId: string) => {
    setIsViewing(true);
    setViewingSessionId(sessionId);
    setViewerCount(prev => prev + 1);
  }, []);

  const leaveStream = useCallback(() => {
    setIsViewing(false);
    setViewingSessionId(null);
    setViewerCount(prev => Math.max(0, prev - 1));
  }, []);

  const addChatMessage = useCallback((msg: Omit<LiveChatMessage, 'id' | 'timestamp' | 'sessionId'>) => {
    const fullMsg: LiveChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      sessionId: viewingSessionId ?? activeSession?.id ?? 'unknown',
    };
    setChatMessages(prev => [...prev, fullMsg]);
  }, [viewingSessionId, activeSession]);

  return (
    <LiveContext.Provider value={{
      activeSession,
      chatMessages,
      startStream,
      endStream,
      joinStream,
      leaveStream,
      isViewing,
      viewingSessionId,
      addChatMessage,
      viewerCount,
    }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used within LiveProvider');
  return ctx;
}
