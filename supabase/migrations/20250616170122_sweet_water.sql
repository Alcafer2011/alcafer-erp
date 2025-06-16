-- Rimuovi policy esistenti per users
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Policy per lettura profilo (PERMETTE A TUTTI GLI UTENTI AUTENTICATI DI LEGGERE TUTTI I PROFILI)
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Policy per aggiornamento profilo (SOLO IL PROPRIO)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Policy per inserimento profilo (PERMETTE A TUTTI GLI UTENTI AUTENTICATI DI INSERIRE PROFILI)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Assicuriamoci che RLS sia abilitato
ALTER TABLE users ENABLE ROW LEVEL SECURITY;