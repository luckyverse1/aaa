import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://effkytwpxakseqtklool.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qE68q4ufr6qGq16o5wHTgQ_A_vTW6cG';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage so the user stays logged in on refresh
    persistSession: true,
    autoRefreshToken: true,
    // Detect session from URL hash (for email confirmation links)
    detectSessionInUrl: true,
    storageKey: 'trade-levels-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
