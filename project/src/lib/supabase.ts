import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? '').toString().trim();
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').toString().trim();

const normalizeSupabaseUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
};

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = rawSupabaseAnonKey.trim();
const hasConfigIssues = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes(' ') || supabaseAnonKey.includes(' ') || !supabaseUrl.startsWith('https://');

function createFallbackSupabaseClient() {
  const unsupportedMessage = 'Supabase is currently unavailable. Check your connection or environment configuration.';
  const unsupportedResult = { data: null, error: { message: unsupportedMessage } };

  const createQueryBuilder = () => ({
    select: () => createQueryBuilder(),
    eq: () => createQueryBuilder(),
    maybeSingle: async () => unsupportedResult,
    order: () => createQueryBuilder(),
  });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: unsupportedMessage } }),
      signUp: async () => ({ data: { session: null, user: null }, error: { message: unsupportedMessage } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } }, error: null }),
    },
    from: () => ({
      select: () => createQueryBuilder(),
      insert: async () => unsupportedResult,
      upsert: async () => unsupportedResult,
    }),
    storage: {
      from: () => ({
        createSignedUrl: async () => unsupportedResult,
        upload: async () => unsupportedResult,
        remove: async () => unsupportedResult,
      }),
    },
  };
}

if (hasConfigIssues && import.meta.env.DEV) {
  console.warn('[Supabase] Missing or invalid environment values. Expected a properly formatted HTTPS URL and anon key. Auth/profile requests will fall back safely.');
}

export const isSupabaseConfigured = !hasConfigIssues;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createFallbackSupabaseClient() as any;

export type Profile = {
  id: string;
  email: string;
  role: 'client' | 'trainer' | 'admin';
  name: string;
  avatar_url: string | null;
  trainer_id: string | null;
  created_at: string;
};
