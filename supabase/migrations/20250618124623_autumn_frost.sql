/*
  # Add Codice Fiscale and Partita IVA to Clienti

  1. Changes
    - Add codice_fiscale column to clienti table
    - Add partita_iva column to clienti table
*/

-- Add codice_fiscale column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clienti' AND column_name = 'codice_fiscale'
  ) THEN
    ALTER TABLE clienti ADD COLUMN codice_fiscale text;
  END IF;
END $$;

-- Add partita_iva column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clienti' AND column_name = 'partita_iva'
  ) THEN
    ALTER TABLE clienti ADD COLUMN partita_iva text;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clienti_codice_fiscale ON clienti(codice_fiscale);
CREATE INDEX IF NOT EXISTS idx_clienti_partita_iva ON clienti(partita_iva);