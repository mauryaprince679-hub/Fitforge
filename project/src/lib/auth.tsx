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

    console.error('Auth request failed:', reason);
    return false;
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (handleNetworkIssue(error.message)) {
          return null;
        }
        console.error('Error fetching profile:', error.message);
        return null;
      }

      return data as Profile | null;
    } catch (error) {
      handleNetworkIssue(error);
      return null;
    }
  }, [handleNetworkIssue]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState(prev => ({ ...prev, profile: null, session: null, loading: false }));
        return;
      }
      const profile = await fetchProfile(session.user.id);
      setState(prev => ({ ...prev, session, profile, loading: false }));
    } catch (error) {
      handleNetworkIssue(error);
    }
  }, [fetchProfile, handleNetworkIssue]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session) {
          setState({ session: null, profile: null, loading: false, error: null });
          return;
        }

        const profile = await fetchProfile(session.user.id);
        if (!mounted) return;
        setState({ session, profile, loading: false, error: null });
      } catch (error) {
        if (!mounted) return;
        handleNetworkIssue(error);
      }
    })();

    // Listen for auth changes — wrap async work to avoid deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      (async () => {
        try {
          if (!session) {
            setState({ session: null, profile: null, loading: false, error: null });
            return;
          }
          const profile = await fetchProfile(session.user.id);
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
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }
      if (data.session) {
        const profile = await fetchProfile(data.session.user.id);
        setState({ session: data.session, profile, loading: false, error: null });
      }
      return { error: null };
    } catch (error) {
      handleNetworkIssue(error);
      return { error: 'Connection Error: Please check your internet connection or database configuration.' };
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

      // Insert profile row with chosen role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          role,
          name,
        });

      if (profileError) {
        setState(prev => ({ ...prev, loading: false, error: profileError.message }));
        return { error: profileError.message };
      }

      const profile = await fetchProfile(data.user.id);
      setState({ session: data.session, profile, loading: false, error: null });
      return { error: null };
    } catch (error) {
      handleNetworkIssue(error);
      return { error: 'Connection Error: Please check your internet connection or database configuration.' };
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
