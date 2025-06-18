/*
  # Create Posa in Opera Table

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
    - Add policy for authenticated users to access posa_in_opera
*/

-- Create posa_in_opera table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE posa_in_opera ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can access posa_in_opera"
  ON posa_in_opera
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add audit trigger
CREATE TRIGGER audit_posa_in_opera
  AFTER INSERT OR UPDATE OR DELETE ON posa_in_opera
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();