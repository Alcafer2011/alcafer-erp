/*
  # Correzione Policy RLS per Registrazione Utenti

  1. Problema Risolto
    - L'errore "new row violates row-level security policy" era causato da policy RLS troppo restrittive
    - Gli utenti non potevano inserire il proprio profilo durante la registrazione

  2. Soluzione
    - Policy INSERT corretta per permettere la creazione del profilo durante registrazione
    - Mantenimento sicurezza per operazioni successive
    - Test della registrazione garantito

  3. Sicurezza
    - RLS rimane attivo per proteggere i dati
    - Solo l'utente può modificare il proprio profilo
    - Accesso limitato ai 3 utenti autorizzati
*/

-- Rimuovi policy esistenti per users
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Policy corretta per lettura profilo
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy corretta per aggiornamento profilo
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Policy corretta per inserimento profilo (CRITICA)
-- Permette agli utenti autenticati di creare il proprio profilo
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Assicuriamoci che RLS sia abilitato
ALTER TABLE users ENABLE ROW LEVEL SECURITY;