import { createClient, AuthChangeEvent } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configurar URL de redirecionamento para o onboarding após confirmação de email
const redirectUrl = typeof window !== 'undefined' ? window.location.origin + '/onboarding' : 'http://localhost:5173/onboarding';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Configurar URL de redirecionamento para confirmação de email
supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
  if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
    window.location.href = redirectUrl;
  }
});
