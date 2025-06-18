import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://wcntwbujilcyqjchlezx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnR3YnVqaWxjeXFqY2hsZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzA5MzMsImV4cCI6MjA2NTMwNjkzM30.j_wdgBQOAI9ZwPhhryFJ0dZA1GqGLHq0XFAMHmyv458';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnR3YnVqaWxjeXFqY2hsZXp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczMDkzMywiZXhwIjoyMDY1MzA2OTMzfQ.TyZLLKLpLre7uSRe6ulEfiV8fZUxhJjprSju8k-4i9w';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // IMPORTANTE: disabilitato per evitare problemi con email
  }
});

// Client con service role per operazioni admin
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

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
    // Use a simple auth check instead of querying a protected table
    // This tests the connection without requiring specific table permissions
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ Chiave API Supabase non valida:', error);
      return false;
    }
    
    // If we get here, the connection is working (even if no session exists)
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