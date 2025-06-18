/*
  # Add Note Column to Costi Utenze Table

  1. Changes
    - Add 'note' column to costi_utenze table if it doesn't exist
  
  2. Details
    - Uses conditional logic to avoid errors if column already exists
    - Text column for storing additional information about utility costs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'costi_utenze' AND column_name = 'note'
  ) THEN
    ALTER TABLE public.costi_utenze ADD COLUMN note text;
  END IF;
END $$;

-- Create RLS policy for costi_utenze if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'costi_utenze'
  ) THEN
    CREATE POLICY "Authenticated users can manage costi_utenze"
      ON public.costi_utenze
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;