import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wcntwbujilcyqjchlezx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnR3YnVqaWxjeXFqY2hsZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNzI1NzQsImV4cCI6MjA0OTY0ODU3NH0.Ej5zOJBJZJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJG';
// DO NOT expose service role in the client

// More robust validation that checks for placeholder values
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your_');
const isValidKey = supabaseAnonKey && 
  supabaseAnonKey.length > 20 && 
  !supabaseAnonKey.includes('placeholder') && 
  !supabaseAnonKey.includes('your_');

if (!isValidUrl || !isValidKey) {
  console.error('❌ Variabili Supabase mancanti o non valide:', { 
    supabaseUrl: !!supabaseUrl, 
    supabaseAnonKey: !!supabaseAnonKey,
    urlValid: isValidUrl,
    keyValid: isValidKey
  });
  console.error('🔧 Per risolvere:');
  console.error('1. Vai su https://supabase.com/dashboard');
  console.error('2. Seleziona il progetto wcntwbujilcyqjchlezx');
  console.error('3. Vai in Settings > API');
  console.error('4. Copia la "Project API key (anon public)"');
  console.error('5. Sostituisci VITE_SUPABASE_ANON_KEY nel file .env');
  console.error('6. Riavvia il server con npm run dev');
}

console.log('✅ Tentativo di connessione a Supabase...');

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin operations must be performed on a trusted server environment only

// Funzioni di utilità per l'autenticazione
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Errore nel recupero del profilo utente:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('❌ Errore nel recupero del profilo utente:', error);
    return null;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Errore durante il logout:', error);
    throw error;
  }
  console.log('✅ Logout effettuato con successo');
};

// Funzione per controllare lo stato della connessione
export const checkSupabaseConnection = async () => {
  try {
    // Simple ping to check if Supabase is accessible
    const { data, error } = await supabase.from('clienti').select('count').limit(1);
    
    if (error) {
      console.error('❌ Errore connessione Supabase:', error);
      return false;
    }
    
    // If we get here, the connection is working
    console.log('✅ Connessione a Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Errore durante il test di connessione:', error);
    return false;
  }
};

// Funzione per verificare se l'utente ha un profilo valido
export const userHasValidProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const profile = await getUserProfile(user.id);
  return !!profile;
};

// Funzione per ottenere tutti i macchinari leasing
export const getLeasingStrumentali = async () => {
  try {
    const { data, error } = await supabase
      .from('leasing_strumentali')
      .select('*')
      .order('nome_strumento');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Errore nel recupero dei macchinari leasing:', error);
    return [];
  }
};

// Admin helpers removed from client; implement server-side if needed