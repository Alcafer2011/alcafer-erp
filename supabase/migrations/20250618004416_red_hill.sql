/*
  # Update RLS policies for demo access

  1. Security Updates
    - Allow authenticated users to insert/update prezzi_materiali
    - Allow authenticated users to insert/update leasing_strumentali
    - These policies ensure demo functionality works properly

  2. Tables affected
    - prezzi_materiali
    - leasing_strumentali
*/

-- Update prezzi_materiali policies
DROP POLICY IF EXISTS "Authorized users can modify prezzi_materiali" ON prezzi_materiali;
DROP POLICY IF EXISTS "Authorized users can update prezzi_materiali" ON prezzi_materiali;
DROP POLICY IF EXISTS "Authorized users can delete prezzi_materiali" ON prezzi_materiali;

CREATE POLICY "Authenticated users can manage prezzi_materiali"
  ON prezzi_materiali
  FOR ALL
  TO authenticated
  USING (user_has_valid_profile())
  WITH CHECK (user_has_valid_profile());

-- Update leasing_strumentali policies
DROP POLICY IF EXISTS "Only Alessandro can access leasing_strumentali" ON leasing_strumentali;

CREATE POLICY "Authenticated users can manage leasing_strumentali"
  ON leasing_strumentali
  FOR ALL
  TO authenticated
  USING (user_has_valid_profile())
  WITH CHECK (user_has_valid_profile());