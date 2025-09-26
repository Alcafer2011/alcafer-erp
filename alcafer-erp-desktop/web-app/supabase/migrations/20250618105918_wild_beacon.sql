/*
  # Update costi_utenze schema

  1. Schema Changes
    - Remove note column from costi_utenze table
  
  2. Security
    - Maintain existing RLS policies
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
