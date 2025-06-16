import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
  
  // Non lanciare un errore, ma mostra un avviso
  console.warn('⚠️ Tentativo di connessione con credenziali potenzialmente non valide');
}

console.log('✅ Tentativo di connessione a Supabase...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // IMPORTANTE: disabilitato per evitare problemi con email
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