/*
  # Fix RLS policy for lavori table

  1. Security Changes
    - Drop existing policy for lavori table
    - Create separate policies for different operations (SELECT, INSERT, UPDATE, DELETE)
    - Ensure authenticated users with valid profiles can perform all operations
    - Use the same pattern as other tables that work correctly

  2. Policy Details
    - SELECT: Allow authenticated users with valid profiles to read lavori
    - INSERT: Allow authenticated users with valid profiles to create new lavori
    - UPDATE: Allow authenticated users with valid profiles to update lavori
    - DELETE: Allow authenticated users with valid profiles to delete lavori
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
