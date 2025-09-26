/*
  # Create Row Level Security Policies

  1. New Policies
    - Policies for prezzi_materiali table
    - Policies for leasing_strumentali table
    - Policies for costi_utenze table
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Enable RLS on prezzi_materiali table
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;

-- Create policy for prezzi_materiali
CREATE POLICY "Authenticated users can manage prezzi_materiali"
  ON prezzi_materiali
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on leasing_strumentali table
ALTER TABLE leasing_strumentali ENABLE ROW LEVEL SECURITY;

-- Create policy for leasing_strumentali
CREATE POLICY "Authenticated users can manage leasing_strumentali"
  ON leasing_strumentali
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on costi_utenze table
ALTER TABLE costi_utenze ENABLE ROW LEVEL SECURITY;

-- Create policies for costi_utenze
CREATE POLICY "Authenticated users can read costi_utenze"
  ON costi_utenze
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only Alessandro can delete costi_utenze"
  ON costi_utenze
  FOR DELETE
  TO authenticated
  USING (user_is_alessandro());

CREATE POLICY "Only Alessandro can modify costi_utenze"
  ON costi_utenze
  FOR INSERT
  TO authenticated
  WITH CHECK (user_is_alessandro());

CREATE POLICY "Only Alessandro can update costi_utenze"
  ON costi_utenze
  FOR UPDATE
  TO authenticated
  USING (user_is_alessandro())
  WITH CHECK (user_is_alessandro());
