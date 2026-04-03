import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Dependency missing: Supabase URL or Anon Key is undefined. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
