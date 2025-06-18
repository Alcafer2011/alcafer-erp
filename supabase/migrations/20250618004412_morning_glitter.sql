/*
  # Add note column to costi_utenze table

  1. Changes
    - Add `note` column to `costi_utenze` table as text type
    - This column is nullable to allow existing records to remain valid

  2. Security
    - No changes to existing RLS policies needed
    - The column inherits the same access controls as the table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'costi_utenze' AND column_name = 'note'
  ) THEN
    ALTER TABLE costi_utenze ADD COLUMN note text;
  END IF;
END $$;