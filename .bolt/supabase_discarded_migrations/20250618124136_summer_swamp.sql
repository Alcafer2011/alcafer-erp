/*
  # Create posa_in_opera table

  1. New Tables
    - `posa_in_opera`
      - `id` (uuid, primary key)
      - `lavoro_id` (uuid, foreign key to lavori)
      - `data` (date)
      - `ore_lavoro` (numeric)
      - `tariffa_oraria` (numeric)
      - `importo_totale` (numeric)
      - `note` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `posa_in_opera` table
    - Add policies for authenticated users
*/

-- Create posa_in_opera table
CREATE TABLE IF NOT EXISTS posa_in_opera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lavoro_id uuid NOT NULL REFERENCES lavori(id) ON DELETE CASCADE,
  data date NOT NULL,
  ore_lavoro numeric(8,2) NOT NULL,
  tariffa_oraria numeric(8,2) NOT NULL,
  importo_totale numeric(12,2) GENERATED ALWAYS AS (ore_lavoro * tariffa_oraria) STORED,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posa_in_opera_lavoro_id ON posa_in_opera(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_posa_in_opera_data ON posa_in_opera(data);

-- Enable RLS
ALTER TABLE posa_in_opera ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read posa_in_opera"
  ON posa_in_opera
  FOR SELECT
  TO authenticated
  USING (user_has_valid_profile());

CREATE POLICY "Authenticated users can insert posa_in_opera"
  ON posa_in_opera
  FOR INSERT
  TO authenticated
  WITH CHECK (user_has_valid_profile());

CREATE POLICY "Authenticated users can update posa_in_opera"
  ON posa_in_opera
  FOR UPDATE
  TO authenticated
  USING (user_has_valid_profile())
  WITH CHECK (user_has_valid_profile());

CREATE POLICY "Authenticated users can delete posa_in_opera"
  ON posa_in_opera
  FOR DELETE
  TO authenticated
  USING (user_has_valid_profile());

-- Add audit trigger
CREATE TRIGGER audit_posa_in_opera
  AFTER INSERT OR UPDATE OR DELETE ON posa_in_opera
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
