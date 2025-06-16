-- Aggiunta trigger per calcolo automatico acconto_importo
CREATE OR REPLACE FUNCTION update_acconto_importo()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcola l'importo dell'acconto in base alla percentuale
  NEW.acconto_importo = NEW.importo_totale * (NEW.acconto_percentuale / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Assicuriamoci che il trigger esista
DROP TRIGGER IF EXISTS trigger_update_acconto_importo ON lavori;
CREATE TRIGGER trigger_update_acconto_importo
  BEFORE INSERT OR UPDATE ON lavori
  FOR EACH ROW
  EXECUTE FUNCTION update_acconto_importo();

-- Aggiunta indice per migliorare le query di accordo tra aziende
CREATE INDEX IF NOT EXISTS idx_lavori_accordo_gabifer ON lavori(accordo_gabifer);

-- Aggiunta indice per migliorare le query di modalità acconto
CREATE INDEX IF NOT EXISTS idx_lavori_acconto_modalita ON lavori(acconto_modalita);

-- Assicuriamoci che i vincoli di controllo esistano
DO $$
BEGIN
  -- Verifica se il vincolo esiste già
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lavori_acconto_modalita_check'
  ) THEN
    -- Crea il vincolo se non esiste
    ALTER TABLE lavori 
    ADD CONSTRAINT lavori_acconto_modalita_check 
    CHECK (acconto_modalita IN ('alcafer', 'gabifer', 'diretto'));
  END IF;
  
  -- Verifica se il vincolo esiste già
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lavori_accordo_gabifer_check'
  ) THEN
    -- Crea il vincolo se non esiste
    ALTER TABLE lavori 
    ADD CONSTRAINT lavori_accordo_gabifer_check 
    CHECK (accordo_gabifer IN ('orario', 'tantum') OR accordo_gabifer IS NULL);
  END IF;
END $$;

-- Aggiorna tutti i lavori esistenti per ricalcolare gli acconti
UPDATE lavori
SET acconto_importo = importo_totale * (acconto_percentuale / 100)
WHERE acconto_importo IS NULL OR acconto_importo = 0;

-- Aggiorna la vista lavori_with_preventivo per includere informazioni sull'acconto
DROP VIEW IF EXISTS lavori_with_preventivo;
CREATE OR REPLACE VIEW lavori_with_preventivo AS
SELECT 
  l.*,
  p.numero_preventivo,
  p.cliente_id,
  c.nome as cliente_nome,
  -- Informazioni sull'acconto
  l.acconto_percentuale,
  l.acconto_importo,
  l.acconto_modalita,
  -- Informazioni sull'accordo tra aziende
  l.accordo_gabifer,
  l.importo_accordo_gabifer
FROM lavori l
LEFT JOIN preventivi p ON l.preventivo_id = p.id
LEFT JOIN clienti c ON p.cliente_id = c.id;