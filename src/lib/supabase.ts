import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili Supabase mancanti:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Supabase configurato correttamente');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funzioni di utilità per l'autenticazione
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};