/*
  # Update RLS Policies for Tables

  1. Changes
    - Update RLS policies for prezzi_materiali table
    - Update RLS policies for leasing_strumentali table
    - Update RLS policies for materiali_metallici table
  
  2. Security
    - Allow authenticated users with valid profiles to access these tables
    - Ensure proper permissions for all operations
*/

-- Update prezzi_materiali policies
DROP POLICY IF EXISTS "Authorized users can modify prezzi_materiali" ON public.prezzi_materiali;
DROP POLICY IF EXISTS "Authorized users can update prezzi_materiali" ON public.prezzi_materiali;
DROP POLICY IF EXISTS "Authorized users can delete prezzi_materiali" ON public.prezzi_materiali;

CREATE POLICY "Authenticated users can manage prezzi_materiali"
  ON public.prezzi_materiali
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update leasing_strumentali policies
DROP POLICY IF EXISTS "Only Alessandro can access leasing_strumentali" ON public.leasing_strumentali;

CREATE POLICY "Authenticated users can manage leasing_strumentali"
  ON public.leasing_strumentali
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update materiali_metallici policies
DROP POLICY IF EXISTS "Authorized users can access materiali_metallici" ON public.materiali_metallici;

CREATE POLICY "Authenticated users can manage materiali_metallici"
  ON public.materiali_metallici
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);