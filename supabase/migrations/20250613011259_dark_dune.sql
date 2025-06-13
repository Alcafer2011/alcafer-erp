/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add RLS policy to allow authenticated users to insert their own profile data
    - This enables new user registration to work properly by allowing users to create their profile record after signup

  The policy ensures that users can only insert a row with their own auth.uid() as the id,
  maintaining security while enabling the registration flow.
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);