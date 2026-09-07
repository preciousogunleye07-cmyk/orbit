import { createClient, SupabaseClient } from '@supabase/supabase-js';

function isValidHttpUrl(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  // If user mistakenly pasted an API key or token into the URL field
  if (s.startsWith('sb_') || s.startsWith('eyJ') || s.includes('secret') || s.includes(' ') || !s.includes('.')) {
    return false;
  }
  try {
    const formatted = s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`;
    const url = new URL(formatted);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveSupabaseConfig(): { url: string; key: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // If no environment variables are provided, or placeholder values are present, do not initialize
  if (!envUrl || !envKey) {
    return { url: '', key: '' };
  }

  // Reject placeholder or inactive dummy credentials
  if (
    envKey.includes('publishable_r2lFx4vBa9') ||
    envKey.includes('ftdrQg_kgjRFcC') ||
    envUrl.includes('bomfuyiedpwosdzdtmfr')
  ) {
    return { url: '', key: '' };
  }

  if (!isValidHttpUrl(envUrl)) {
    return { url: '', key: '' };
  }

  const formattedUrl = envUrl.startsWith('http://') || envUrl.startsWith('https://') ? envUrl : `https://${envUrl}`;
  return { url: formattedUrl, key: envKey };
}

let supabaseInstance: SupabaseClient | null = null;
let initAttempted = false;

export const getSupabase = (): SupabaseClient | null => {
  if (initAttempted) {
    return supabaseInstance;
  }

  try {
    const { url, key } = resolveSupabaseConfig();
    if (!url || !key || key.length < 10) {
      initAttempted = true;
      supabaseInstance = null;
      return null;
    }

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Supabase client initialization gracefully bypassed:', err);
    supabaseInstance = null;
  } finally {
    initAttempted = true;
  }

  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabase() !== null;
};

