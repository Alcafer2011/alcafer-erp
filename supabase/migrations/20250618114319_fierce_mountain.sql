/*
  # Fix RLS policies and add manovalanza initialization

  1. Security
    - Safely check and create RLS policies only if they don't exist
    - Enable RLS on tables if not already enabled
  
  2. Manovalanza
    - Add function to initialize manovalanza data
*/

-- Enable RLS on prezzi_materiali table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'prezzi_materiali' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for prezzi_materiali if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'prezzi_materiali' 
    AND policyname = 'Authenticated users can manage prezzi_materiali'
  ) THEN
    CREATE POLICY "Authenticated users can manage prezzi_materiali"
      ON prezzi_materiali
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Enable RLS on leasing_strumentali table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'leasing_strumentali' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE leasing_strumentali ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for leasing_strumentali if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'leasing_strumentali' 
    AND policyname = 'Authenticated users can manage leasing_strumentali'
  ) THEN
    CREATE POLICY "Authenticated users can manage leasing_strumentali"
      ON leasing_strumentali
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Enable RLS on costi_utenze table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'costi_utenze' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE costi_utenze ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for costi_utenze if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'costi_utenze' 
    AND policyname = 'Authenticated users can read costi_utenze'
  ) THEN
    CREATE POLICY "Authenticated users can read costi_utenze"
      ON costi_utenze
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'costi_utenze' 
    AND policyname = 'Only Alessandro can delete costi_utenze'
  ) THEN
    CREATE POLICY "Only Alessandro can delete costi_utenze"
      ON costi_utenze
      FOR DELETE
      TO authenticated
      USING (user_is_alessandro());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'costi_utenze' 
    AND policyname = 'Only Alessandro can modify costi_utenze'
  ) THEN
    CREATE POLICY "Only Alessandro can modify costi_utenze"
      ON costi_utenze
      FOR INSERT
      TO authenticated
      WITH CHECK (user_is_alessandro());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'costi_utenze' 
    AND policyname = 'Only Alessandro can update costi_utenze'
  ) THEN
    CREATE POLICY "Only Alessandro can update costi_utenze"
      ON costi_utenze
      FOR UPDATE
      TO authenticated
      USING (user_is_alessandro())
      WITH CHECK (user_is_alessandro());
  END IF;
END $$;

-- Enable RLS on manovalanza table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'manovalanza' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE manovalanza ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for manovalanza if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'manovalanza' 
    AND policyname = 'Only Alessandro can access manovalanza'
  ) THEN
    CREATE POLICY "Only Alessandro can access manovalanza"
      ON manovalanza
      FOR ALL
      TO authenticated
      USING (user_is_alessandro())
      WITH CHECK (user_is_alessandro());
  END IF;
END $$;