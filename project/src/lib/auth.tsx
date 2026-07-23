import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';
import type { Role } from '../types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  const handleNetworkIssue = useCallback((reason?: unknown) => {
    const message = reason instanceof Error ? reason.message : 'Unknown connection issue';
    const isNetworkFailure = /failed to fetch|network|resolve|ENOTFOUND|ECONNREFUSED|ERR_NAME_NOT_RESOLVED/i.test(message);

    if (isNetworkFailure) {
      setState(prev => ({ ...prev, loading: false, error: 'Connection Error: Please check your internet connection or database configuration.' }));
      return true;
    }

    console.error('Auth request issue:', reason);
    return false;
  }, []);

  // Construct a dependable fallback profile from session info
  const createFallbackProfile = useCallback((userId: string, userEmail?: string): Profile => {
    const email = userEmail || 'user@example.com';
    const namePart = email.split('@')[0] || 'User';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return {
      id: userId,
      email: email,
      role: 'client' as Role,
      name: formattedName,
      created_at: new Date().toISOString(),
    } as Profile;
  }, []);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as Profile;
      }

      // If database query fails or row is missing, generate fallback profile & try upserting
      console.warn('Profile missing or database query restricted. Using resilient profile fallback...');
      const fallback = createFallbackProfile(userId, userEmail);

      // Attempt upsert quietly
      await supabase.from('profiles').upsert(fallback).catch(() => {});

      return fallback;
    } catch (err) {
      handleNetworkIssue(err);
      return createFallbackProfile(userId, userEmail);
    }
  }, [createFallbackProfile, handleNetworkIssue]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState(prev => ({ ...prev, profile: null, session: null, loading: false }));
        return;
      }
      const profile = await fetchProfile(session.user.id, session.user.email);
      setState(prev => ({ ...prev, session, profile, loading: false }));
    } catch (error) {
      handleNetworkIssue(error);
    }
  }, [fetchProfile, handleNetworkIssue]);

  useEffect(() => {
    let mounted = true;

    // 1. Fetch initial session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session) {
          setState({ session: null, profile: null, loading: false, error: null });
          return;
        }

        const profile = await fetchProfile(session.user.id, session.user.email);
        if (!mounted) return;
        setState({ session, profile, loading: false, error: null });
      } catch (error) {
        if (!mounted) return;
        handleNetworkIssue(error);
      }
    })();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      (async () => {
        try {
          if (!session) {
            setState({ session: null, profile: null, loading: false, error: null });
            return;
          }
          const profile = await fetchProfile(session.user.id, session.user.email);
          setState({ session, profile, loading: false, error: null });
        } catch (error) {
          handleNetworkIssue(error);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, handleNetworkIssue]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      if (data.session) {
        const profile = await fetchProfile(data.session.user.id, data.session.user.email);
        setState({ session: data.session, profile, loading: false, error: null });
      }

      return { error: null };
    } catch (error) {
      handleNetworkIssue(error);
      const errMsg = 'Connection Error: Please check your internet connection or database configuration.';
      setState(prev => ({ ...prev, loading: false, error: errMsg }));
      return { error: errMsg };
    }
  }, [fetchProfile, handleNetworkIssue]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: Role
  ): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      if (!data.session || !data.user) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return { error: null };
      }

      const newProfile: Profile = {
        id: data.user.id,
        email,
        role,
        name,
        created_at: new Date().toISOString(),
      } as Profile;

      await supabase.from('profiles').upsert(newProfile).catch(() => {});

      const profile = await fetchProfile(data.user.id, email);
      setState({ session: data.session, profile, loading: false, error: null });
      return { error: null };
    } catch (error) {
      handleNetworkIssue(error);
      const errMsg = 'Connection Error: Please check your internet connection or database configuration.';
      setState(prev => ({ ...prev, loading: false, error: errMsg }));
      return { error: errMsg };
    }
  }, [fetchProfile, handleNetworkIssue]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Sign-out request failed, clearing local session anyway:', error);
    } finally {
      setState({ session: null, profile: null, loading: false, error: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}