/*
  # Fix RLS Policy for Users Table

  1. Security Changes
    - Drop the existing INSERT policy that uses incorrect uid() function
    - Create new INSERT policy using correct auth.uid() function
    - Ensure users can insert their own profile data during registration

  This fixes the 401 error that occurs during user registration when the RLS policy
  prevents new user profiles from being inserted.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new INSERT policy with correct auth.uid() function
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);