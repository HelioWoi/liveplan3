import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Key exists' : 'Key is missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
