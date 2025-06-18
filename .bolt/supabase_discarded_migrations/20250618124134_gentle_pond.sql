/*
  # Fix RLS policies for lavori table

  1. Security
    - Drop existing problematic policy
    - Create separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
    - Use user_has_valid_profile() function for all operations
*/

-- Drop the existing policy that might be causing issues
DROP POLICY IF EXISTS "Authorized users can access lavori" ON lavori;

-- Create separate policies for each operation to ensure proper access control
CREATE POLICY "Authenticated users can read lavori"
  ON lavori
  FOR SELECT
  TO authenticated
  USING (user_has_valid_profile());

CREATE POLICY "Authenticated users can insert lavori"
  ON lavori
  FOR INSERT
  TO authenticated
  WITH CHECK (user_has_valid_profile());

CREATE POLICY "Authenticated users can update lavori"
  ON lavori
  FOR UPDATE
  TO authenticated
  USING (user_has_valid_profile())
  WITH CHECK (user_has_valid_profile());

CREATE POLICY "Authenticated users can delete lavori"
  ON lavori
  FOR DELETE
  TO authenticated
  USING (user_has_valid_profile());