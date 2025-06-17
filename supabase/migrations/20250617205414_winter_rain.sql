/*
  # Fix Security Issues - Supabase Security Advisor

  1. Security Updates
    - Enable RLS on all tables
    - Remove overly permissive policies
    - Implement role-based access control
    - Secure sensitive financial data
    - Protect audit log from manual modifications

  2. Access Control
    - Alessandro: Full admin access
    - Gabriel: Preventivi, lavori, materiali
    - Hanna: Financial data access
    - All: Own user profile only

  3. Security Functions
    - Helper functions for role checking
    - Secure policy implementations
*/

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE preventivi ENABLE ROW LEVEL SECURITY;
ALTER TABLE lavori ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiali_metallici ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiali_vari ENABLE ROW LEVEL SECURITY;
ALTER TABLE leasing_strumentali ENABLE ROW LEVEL SECURITY;
ALTER TABLE costi_utenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;
ALTER TABLE manovalanza ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimenti_contabili ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasse_iva ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Authenticated users can access clienti" ON clienti;
DROP POLICY IF EXISTS "Authenticated users can access preventivi" ON preventivi;
DROP POLICY IF EXISTS "Authenticated users can access lavori" ON lavori;
DROP POLICY IF EXISTS "Authenticated users can access materiali_metallici" ON materiali_metallici;
DROP POLICY IF EXISTS "Authenticated users can access materiali_vari" ON materiali_vari;
DROP POLICY IF EXISTS "Authenticated users can access leasing_strumentali" ON leasing_strumentali;
DROP POLICY IF EXISTS "Authenticated users can access costi_utenze" ON costi_utenze;
DROP POLICY IF EXISTS "Authenticated users can access prezzi_materiali" ON prezzi_materiali;
DROP POLICY IF EXISTS "Authenticated users can access manovalanza" ON manovalanza;
DROP POLICY IF EXISTS "Authenticated users can access movimenti_contabili" ON movimenti_contabili;
DROP POLICY IF EXISTS "Authenticated users can access tasse_iva" ON tasse_iva;
DROP POLICY IF EXISTS "Authenticated users can access fornitori" ON fornitori;
DROP POLICY IF EXISTS "Admins can read audit log" ON audit_log;

-- Fix users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create helper functions in public schema
CREATE OR REPLACE FUNCTION public.user_has_valid_profile()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND ruolo IN ('alessandro', 'gabriel', 'hanna')
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_alessandro()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND ruolo = 'alessandro'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_financial_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND ruolo IN ('alessandro', 'hanna')
  );
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_preventivi()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND ruolo IN ('alessandro', 'gabriel')
  );
$$;

-- Secure clienti table - only authenticated users with valid profile
CREATE POLICY "Authenticated users with profile can access clienti"
  ON clienti
  FOR ALL
  TO authenticated
  USING (public.user_has_valid_profile())
  WITH CHECK (public.user_has_valid_profile());

-- Secure preventivi table - role-based access
CREATE POLICY "Authorized users can access preventivi"
  ON preventivi
  FOR ALL
  TO authenticated
  USING (public.user_can_access_preventivi())
  WITH CHECK (public.user_can_access_preventivi());

-- Secure lavori table - role-based access
CREATE POLICY "Authorized users can access lavori"
  ON lavori
  FOR ALL
  TO authenticated
  USING (public.user_can_access_preventivi())
  WITH CHECK (public.user_can_access_preventivi());

-- Secure materiali_metallici table
CREATE POLICY "Authorized users can access materiali_metallici"
  ON materiali_metallici
  FOR ALL
  TO authenticated
  USING (public.user_can_access_preventivi())
  WITH CHECK (public.user_can_access_preventivi());

-- Secure materiali_vari table
CREATE POLICY "Authorized users can access materiali_vari"
  ON materiali_vari
  FOR ALL
  TO authenticated
  USING (public.user_can_access_preventivi())
  WITH CHECK (public.user_can_access_preventivi());

-- Secure leasing_strumentali table - only Alessandro
CREATE POLICY "Only Alessandro can access leasing_strumentali"
  ON leasing_strumentali
  FOR ALL
  TO authenticated
  USING (public.user_is_alessandro())
  WITH CHECK (public.user_is_alessandro());

-- Secure costi_utenze table
CREATE POLICY "Authenticated users can read costi_utenze"
  ON costi_utenze
  FOR SELECT
  TO authenticated
  USING (public.user_has_valid_profile());

CREATE POLICY "Only Alessandro can modify costi_utenze"
  ON costi_utenze
  FOR INSERT
  TO authenticated
  WITH CHECK (public.user_is_alessandro());

CREATE POLICY "Only Alessandro can update costi_utenze"
  ON costi_utenze
  FOR UPDATE
  TO authenticated
  USING (public.user_is_alessandro())
  WITH CHECK (public.user_is_alessandro());

CREATE POLICY "Only Alessandro can delete costi_utenze"
  ON costi_utenze
  FOR DELETE
  TO authenticated
  USING (public.user_is_alessandro());

-- Secure prezzi_materiali table
CREATE POLICY "Authenticated users can read prezzi_materiali"
  ON prezzi_materiali
  FOR SELECT
  TO authenticated
  USING (public.user_has_valid_profile());

CREATE POLICY "Authorized users can modify prezzi_materiali"
  ON prezzi_materiali
  FOR INSERT
  TO authenticated
  WITH CHECK (public.user_can_access_preventivi());

CREATE POLICY "Authorized users can update prezzi_materiali"
  ON prezzi_materiali
  FOR UPDATE
  TO authenticated
  USING (public.user_can_access_preventivi())
  WITH CHECK (public.user_can_access_preventivi());

CREATE POLICY "Authorized users can delete prezzi_materiali"
  ON prezzi_materiali
  FOR DELETE
  TO authenticated
  USING (public.user_can_access_preventivi());

-- Secure manovalanza table - only Alessandro
CREATE POLICY "Only Alessandro can access manovalanza"
  ON manovalanza
  FOR ALL
  TO authenticated
  USING (public.user_is_alessandro())
  WITH CHECK (public.user_is_alessandro());

-- Secure movimenti_contabili table - financial data
CREATE POLICY "Financial users can access movimenti_contabili"
  ON movimenti_contabili
  FOR ALL
  TO authenticated
  USING (public.user_has_financial_access())
  WITH CHECK (public.user_has_financial_access());

-- Secure tasse_iva table - only Alessandro
CREATE POLICY "Only Alessandro can access tasse_iva"
  ON tasse_iva
  FOR ALL
  TO authenticated
  USING (public.user_is_alessandro())
  WITH CHECK (public.user_is_alessandro());

-- Secure fornitori table
CREATE POLICY "Authenticated users can access fornitori"
  ON fornitori
  FOR ALL
  TO authenticated
  USING (public.user_has_valid_profile())
  WITH CHECK (public.user_has_valid_profile());

-- Secure audit_log table - read-only for Alessandro
CREATE POLICY "Only Alessandro can read audit log"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (public.user_is_alessandro());

-- Prevent any modifications to audit_log (it should only be written by triggers)
CREATE POLICY "No manual modifications to audit_log"
  ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No updates to audit_log"
  ON audit_log
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No deletions from audit_log"
  ON audit_log
  FOR DELETE
  TO authenticated
  USING (false);