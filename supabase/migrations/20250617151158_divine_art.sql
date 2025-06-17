/*
  # Creazione tabella fornitori e vista statistiche

  1. Nuove Tabelle
    - `fornitori`
      - Gestione completa dei fornitori aziendali
      - Sistema di valutazione e categorizzazione
      - Tracciamento condizioni commerciali
  
  2. Viste
    - `fornitori_with_stats`
      - Statistiche aggregate sugli ordini per fornitore
  
  3. Security
    - Enable RLS on `fornitori` table
    - Add policy for authenticated users
*/

-- Creazione tabella fornitori
CREATE TABLE IF NOT EXISTS fornitori (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefono text,
  indirizzo text,
  partita_iva text UNIQUE,
  codice_fiscale text,
  tipo_fornitore text NOT NULL DEFAULT 'materiali',
  settore_merceologico text,
  condizioni_pagamento text DEFAULT '30 giorni',
  sconto_standard numeric(5,2) DEFAULT 0.00,
  valutazione integer DEFAULT 3 CHECK (valutazione >= 1 AND valutazione <= 5),
  note text,
  attivo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Constraint per tipo_fornitore
ALTER TABLE fornitori ADD CONSTRAINT fornitori_tipo_fornitore_check 
CHECK (tipo_fornitore = ANY (ARRAY[
  'materiali'::text, 
  'servizi'::text, 
  'trasporti'::text, 
  'utenze'::text, 
  'manutenzione'::text,
  'consulenza'::text,
  'altro'::text
]));

-- Abilitazione Row Level Security
ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY;

-- Policy per utenti autenticati (lettura e scrittura)
CREATE POLICY "Authenticated users can access fornitori"
  ON fornitori
  FOR ALL
  TO authenticated
  USING (true);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_fornitori_nome ON fornitori USING btree (nome);
CREATE INDEX IF NOT EXISTS idx_fornitori_tipo ON fornitori USING btree (tipo_fornitore);
CREATE INDEX IF NOT EXISTS idx_fornitori_attivo ON fornitori USING btree (attivo);
CREATE INDEX IF NOT EXISTS idx_fornitori_valutazione ON fornitori USING btree (valutazione);
CREATE INDEX IF NOT EXISTS idx_fornitori_partita_iva ON fornitori USING btree (partita_iva);

-- Funzione per aggiornamento automatico di updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornamento automatico di updated_at
CREATE TRIGGER update_fornitori_updated_at
  BEFORE UPDATE ON fornitori
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per audit log (se la funzione esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'audit_trigger_function') THEN
    CREATE TRIGGER audit_fornitori
      AFTER INSERT OR UPDATE OR DELETE ON fornitori
      FOR EACH ROW
      EXECUTE FUNCTION audit_trigger_function();
  END IF;
END $$;

-- Inserimento dati di esempio
INSERT INTO fornitori (nome, email, telefono, tipo_fornitore, settore_merceologico, partita_iva, condizioni_pagamento, sconto_standard, valutazione) VALUES
('Acciaierie del Nord SRL', 'vendite@acciaierienord.it', '+39 02 1234567', 'materiali', 'Acciaio e leghe metalliche', '12345678901', '30 giorni', 2.50, 4),
('Ferramenta Rossi & C.', 'info@ferramentarossi.it', '+39 011 9876543', 'materiali', 'Ferramenta e utensili', '98765432109', '60 giorni', 5.00, 5),
('Trasporti Veloci SPA', 'logistica@trasportiveloci.it', '+39 045 5555555', 'trasporti', 'Trasporti e logistica', '11111111111', '15 giorni', 0.00, 3),
('Gas Tecnici Italia', 'vendite@gastecnici.it', '+39 02 7777777', 'materiali', 'Gas tecnici e saldatura', '22222222222', '30 giorni', 3.00, 4),
('Elettro Service SRL', 'assistenza@elettroservice.it', '+39 011 8888888', 'manutenzione', 'Manutenzione elettrica', '33333333333', '30 giorni', 0.00, 4),
('Consulenza Fiscale Bianchi', 'info@fiscalebianchi.it', '+39 02 9999999', 'consulenza', 'Consulenza fiscale e contabile', '44444444444', '30 giorni', 0.00, 5)
ON CONFLICT (partita_iva) DO NOTHING;

-- Vista per fornitori con statistiche (corretta)
CREATE OR REPLACE VIEW fornitori_with_stats AS
SELECT 
  f.*,
  COALESCE(mm_stats.ordini_count, 0) as ordini_materiali_metallici,
  COALESCE(mm_stats.importo_totale, 0) as importo_totale_metallici,
  COALESCE(mm_stats.ultimo_ordine, NULL) as ultimo_ordine_materiali
FROM fornitori f
LEFT JOIN (
  SELECT 
    fornitore,
    COUNT(*) as ordini_count,
    SUM(importo_totale) as importo_totale,
    MAX(data_trasporto) as ultimo_ordine
  FROM materiali_metallici 
  WHERE fornitore IS NOT NULL
  GROUP BY fornitore
) mm_stats ON f.nome = mm_stats.fornitore;

-- Commento per future estensioni
COMMENT ON TABLE fornitori IS 'Tabella per la gestione dei fornitori aziendali con informazioni complete e sistema di valutazione';
COMMENT ON COLUMN fornitori.valutazione IS 'Valutazione del fornitore da 1 a 5 stelle';
COMMENT ON COLUMN fornitori.tipo_fornitore IS 'Tipologia di fornitore: materiali, servizi, trasporti, utenze, manutenzione, consulenza, altro';
COMMENT ON VIEW fornitori_with_stats IS 'Vista che mostra i fornitori con statistiche aggregate degli ordini di materiali metallici';