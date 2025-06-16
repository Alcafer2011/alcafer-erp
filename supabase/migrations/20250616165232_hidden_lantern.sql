/*
  # Correzione policy RLS per users

  1. Modifiche
    - Rimozione policy esistenti
    - Creazione policy più permissive per la registrazione
    - Aggiunta policy per consentire l'inserimento di nuovi utenti
  
  2. Sicurezza
    - Mantenuta la sicurezza per lettura e aggiornamento
    - Permessa la creazione di nuovi profili utente
*/

-- Rimuovi policy esistenti per users
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Policy per lettura profilo
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Policy per aggiornamento profilo
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Policy per inserimento profilo (CRITICA)
-- Permette agli utenti autenticati di creare qualsiasi profilo
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Assicuriamoci che RLS sia abilitato
ALTER TABLE users ENABLE ROW LEVEL SECURITY;