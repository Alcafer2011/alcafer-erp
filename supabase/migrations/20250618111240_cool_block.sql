/*
  # Fix RLS Policies for Material Prices and Utilities

  1. Changes
    - Fix RLS policies for prezzi_materiali table
    - Fix RLS policies for leasing_strumentali table
    - Fix RLS policies for costi_utenze table
    - Remove note column from costi_utenze if it exists
  
  2. Security
    - Enable proper access for authenticated users
*/

-- Check if note column exists and drop it if it does
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'costi_utenze' AND column_name = 'note'
  ) THEN
    ALTER TABLE costi_utenze DROP COLUMN note;
  END IF;
END $$;

-- Fix RLS policy for prezzi_materiali table
DROP POLICY IF EXISTS "Authenticated users can manage prezzi_materiali" ON public.prezzi_materiali;
CREATE POLICY "Authenticated users can manage prezzi_materiali" 
ON public.prezzi_materiali
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix RLS policy for leasing_strumentali table
DROP POLICY IF EXISTS "Authenticated users can manage leasing_strumentali" ON public.leasing_strumentali;
CREATE POLICY "Authenticated users can manage leasing_strumentali" 
ON public.leasing_strumentali
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix RLS policy for costi_utenze table
DROP POLICY IF EXISTS "Authenticated users can manage costi_utenze" ON public.costi_utenze;
DROP POLICY IF EXISTS "Authenticated users can read costi_utenze" ON public.costi_utenze;
DROP POLICY IF EXISTS "Only Alessandro can delete costi_utenze" ON public.costi_utenze;
DROP POLICY IF EXISTS "Only Alessandro can modify costi_utenze" ON public.costi_utenze;
DROP POLICY IF EXISTS "Only Alessandro can update costi_utenze" ON public.costi_utenze;

CREATE POLICY "Authenticated users can manage costi_utenze" 
ON public.costi_utenze
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);