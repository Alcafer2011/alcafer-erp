/*
  # Aggiunta campi per gestione acconti e anticipi tra ditte

  1. Modifiche
    - Aggiunta campi per gestione fatturazione acconto
    - Aggiunta campi per gestione anticipi tra ditte
  2. Sicurezza
    - Mantenute le policy esistenti
*/

-- Aggiungi campi per gestione fatturazione acconto
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'acconto_fatturato_da'
  ) THEN
    ALTER TABLE lavori ADD COLUMN acconto_fatturato_da text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'acconto_diretto_cliente'
  ) THEN
    ALTER TABLE lavori ADD COLUMN acconto_diretto_cliente boolean DEFAULT false;
  END IF;
END $$;

-- Aggiungi campi per gestione anticipi tra ditte
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'anticipo_tra_ditte'
  ) THEN
    ALTER TABLE lavori ADD COLUMN anticipo_tra_ditte boolean DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'anticipo_importo'
  ) THEN
    ALTER TABLE lavori ADD COLUMN anticipo_importo numeric(12,2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'anticipo_da'
  ) THEN
    ALTER TABLE lavori ADD COLUMN anticipo_da text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lavori' AND column_name = 'anticipo_a'
  ) THEN
    ALTER TABLE lavori ADD COLUMN anticipo_a text;
  END IF;
END $$;

-- Aggiorna i valori di default per i campi esistenti
UPDATE lavori SET acconto_fatturato_da = ditta WHERE acconto_fatturato_da IS NULL;
UPDATE lavori SET acconto_diretto_cliente = false WHERE acconto_diretto_cliente IS NULL;