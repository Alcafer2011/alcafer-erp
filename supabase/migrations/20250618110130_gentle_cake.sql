/*
  # Fix RLS Policies for Tables

  1. Changes
     - Add proper RLS policies for prezzi_materiali table
     - Add proper RLS policies for leasing_strumentali table
     - Fix costi_utenze table structure
  
  2. Security
     - Enable authenticated users to access and modify these tables
*/

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