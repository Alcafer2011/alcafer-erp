/*
  # Correzione Completa Schema Database

  1. Nuove Tabelle
    - `users` - Profili utenti con ruoli
    - `clienti` - Gestione clienti
    - `preventivi` - Gestione preventivi
    - `lavori` - Gestione lavori
    - `materiali_metallici` - Materiali metallici
    - `materiali_vari` - Materiali vari
    - `leasing_strumentali` - Costi leasing
    - `costi_utenze` - Costi utenze
    - `prezzi_materiali` - Prezzi materiali
    - `manovalanza` - Costi manovalanza
    - `movimenti_contabili` - Movimenti contabili
    - `tasse_iva` - Gestione tasse e IVA
    - `audit_log` - Log delle modifiche

  2. Sicurezza
    - RLS abilitato su tutte le tabelle
    - Policy per utenti autenticati
    - Controllo accessi basato sui ruoli

  3. Funzionalità
    - Numerazione automatica preventivi e lavori
    - Calcolo automatico acconti
    - Audit trail completo
    - Indici per performance
*/

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  cognome text NOT NULL,
  data_nascita date NOT NULL,
  ruolo text NOT NULL CHECK (ruolo IN ('alessandro', 'gabriel', 'hanna')),
  created_at timestamptz DEFAULT now()
);

-- Tabella clienti
CREATE TABLE IF NOT EXISTS clienti (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  indirizzo text,
  created_at timestamptz DEFAULT now()
);

-- Tabella preventivi
CREATE TABLE IF NOT EXISTS preventivi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id uuid REFERENCES clienti(id) ON DELETE SET NULL,
  numero_preventivo text UNIQUE,
  file_path text,
  importo numeric(10,2),
  stato text DEFAULT 'bozza' CHECK (stato IN ('bozza', 'inviato', 'accettato', 'rifiutato')),
  ditta text DEFAULT 'alcafer' CHECK (ditta IN ('alcafer', 'gabifer')),
  created_at timestamptz DEFAULT now()
);

-- Tabella lavori
CREATE TABLE IF NOT EXISTS lavori (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  preventivo_id uuid REFERENCES preventivi(id) ON DELETE SET NULL,
  numero_lavoro text UNIQUE,
  descrizione text NOT NULL,
  importo_totale numeric(12,2) NOT NULL,
  acconto_percentuale numeric(5,2) DEFAULT 50.00,
  acconto_importo numeric(12,2),
  acconto_modalita text NOT NULL CHECK (acconto_modalita IN ('alcafer', 'gabifer', 'diretto')),
  stato text DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa', 'in_produzione', 'completato')),
  data_inizio date,
  data_fine date,
  ore_lavoro numeric(8,2),
  macchinari_utilizzati text[],
  ore_per_macchinario jsonb,
  ditta text NOT NULL CHECK (ditta IN ('alcafer', 'gabifer')),
  accordo_gabifer text CHECK (accordo_gabifer IN ('orario', 'tantum')),
  importo_accordo_gabifer numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Tabella materiali metallici
CREATE TABLE IF NOT EXISTS materiali_metallici (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lavoro_id uuid NOT NULL REFERENCES lavori(id) ON DELETE CASCADE,
  tipo_materiale text NOT NULL,
  kg_totali numeric(10,3) NOT NULL,
  prezzo_kg numeric(8,3) NOT NULL,
  importo_totale numeric(12,2) DEFAULT (kg_totali * prezzo_kg),
  numero_ddt text NOT NULL,
  data_trasporto date NOT NULL,
  fornitore text,
  created_at timestamptz DEFAULT now()
);

-- Tabella materiali vari
CREATE TABLE IF NOT EXISTS materiali_vari (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lavoro_id uuid REFERENCES lavori(id) ON DELETE CASCADE,
  tipo_materiale text NOT NULL,
  quantita numeric(10,2) NOT NULL DEFAULT 0,
  prezzo_unitario numeric(10,2) NOT NULL DEFAULT 0,
  importo_totale numeric(12,2) DEFAULT (quantita * prezzo_unitario),
  data_acquisto date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Tabella leasing strumentali
CREATE TABLE IF NOT EXISTS leasing_strumentali (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_strumento text UNIQUE NOT NULL,
  rata_mensile numeric(10,2) NOT NULL DEFAULT 0,
  consumo_kw numeric(8,3),
  attivo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabella costi utenze
CREATE TABLE IF NOT EXISTS costi_utenze (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo text NOT NULL CHECK (tipo IN ('elettricita', 'acqua', 'gas')),
  fornitore text NOT NULL,
  costo_fisso numeric(10,2) NOT NULL DEFAULT 0,
  costo_variabile numeric(8,4) NOT NULL DEFAULT 0,
  unita_misura text NOT NULL,
  data_aggiornamento date DEFAULT CURRENT_DATE,
  potenza_installata numeric(8,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tipo, fornitore)
);

-- Tabella prezzi materiali
CREATE TABLE IF NOT EXISTS prezzi_materiali (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_materiale text UNIQUE NOT NULL,
  prezzo_kg numeric(8,3) NOT NULL,
  data_aggiornamento date DEFAULT CURRENT_DATE,
  fonte text,
  created_at timestamptz DEFAULT now()
);

-- Tabella manovalanza
CREATE TABLE IF NOT EXISTS manovalanza (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text UNIQUE NOT NULL,
  importo_mensile numeric(10,2) NOT NULL DEFAULT 0,
  attivo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabella movimenti contabili
CREATE TABLE IF NOT EXISTS movimenti_contabili (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lavoro_id uuid REFERENCES lavori(id) ON DELETE SET NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  importo numeric(12,2) NOT NULL,
  descrizione text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  ditta text NOT NULL CHECK (ditta IN ('alcafer', 'gabifer')),
  categoria text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabella tasse e IVA
CREATE TABLE IF NOT EXISTS tasse_iva (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ditta text NOT NULL CHECK (ditta IN ('alcafer', 'gabifer')),
  periodo text NOT NULL,
  iva_da_versare numeric(12,2) DEFAULT 0,
  tasse_da_versare numeric(12,2) DEFAULT 0,
  data_scadenza date NOT NULL,
  pagato boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabella audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Funzione per audit trail
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per aggiornare acconto
CREATE OR REPLACE FUNCTION update_acconto_importo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.acconto_importo = NEW.importo_totale * (NEW.acconto_percentuale / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per generare numero preventivo
CREATE OR REPLACE FUNCTION generate_numero_preventivo()
RETURNS TRIGGER AS $$
DECLARE
  anno text;
  counter integer;
  new_numero text;
BEGIN
  IF NEW.numero_preventivo IS NULL OR NEW.numero_preventivo = '' THEN
    anno := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_preventivo, '/', 1) AS integer)), 0) + 1
    INTO counter
    FROM preventivi
    WHERE numero_preventivo LIKE '%/' || anno;
    
    new_numero := LPAD(counter::text, 4, '0') || '/' || anno;
    NEW.numero_preventivo := new_numero;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per generare numero lavoro
CREATE OR REPLACE FUNCTION generate_numero_lavoro()
RETURNS TRIGGER AS $$
DECLARE
  anno text;
  counter integer;
  new_numero text;
BEGIN
  IF NEW.numero_lavoro IS NULL OR NEW.numero_lavoro = '' THEN
    anno := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_lavoro, '/', 1) AS integer)), 0) + 1
    INTO counter
    FROM lavori
    WHERE numero_lavoro LIKE '%/' || anno;
    
    new_numero := LPAD(counter::text, 4, '0') || '/' || anno;
    NEW.numero_lavoro := new_numero;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione helper per ottenere l'ID utente
CREATE OR REPLACE FUNCTION uid() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Trigger per acconto
DROP TRIGGER IF EXISTS trigger_update_acconto_importo ON lavori;
CREATE TRIGGER trigger_update_acconto_importo
  BEFORE INSERT OR UPDATE ON lavori
  FOR EACH ROW
  EXECUTE FUNCTION update_acconto_importo();

-- Trigger per numero preventivo
DROP TRIGGER IF EXISTS trigger_generate_numero_preventivo ON preventivi;
CREATE TRIGGER trigger_generate_numero_preventivo
  BEFORE INSERT ON preventivi
  FOR EACH ROW
  EXECUTE FUNCTION generate_numero_preventivo();

-- Trigger per numero lavoro
DROP TRIGGER IF EXISTS trigger_generate_numero_lavoro ON lavori;
CREATE TRIGGER trigger_generate_numero_lavoro
  BEFORE INSERT ON lavori
  FOR EACH ROW
  EXECUTE FUNCTION generate_numero_lavoro();

-- Trigger per audit
DROP TRIGGER IF EXISTS audit_preventivi ON preventivi;
CREATE TRIGGER audit_preventivi
  AFTER INSERT OR UPDATE OR DELETE ON preventivi
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_lavori ON lavori;
CREATE TRIGGER audit_lavori
  AFTER INSERT OR UPDATE OR DELETE ON lavori
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_movimenti_contabili ON movimenti_contabili;
CREATE TRIGGER audit_movimenti_contabili
  AFTER INSERT OR UPDATE OR DELETE ON movimenti_contabili
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Inserimento dati iniziali
INSERT INTO leasing_strumentali (nome_strumento, rata_mensile, consumo_kw) VALUES
  ('Taglio laser', 0, 15.5),
  ('Fresa controllo Numerico', 0, 8.2),
  ('Saldatrice Fronius TPS400 i Gabriele', 0, 12.0),
  ('Saldatrice Fronius TPS400 i Simone', 0, 12.0),
  ('Saldatrice Tig Fronius iwave DC 230i', 0, 6.8),
  ('Muletto', 0, 0),
  ('Sega a nastro compressore e cisterna aspiratore fumi saldatura', 0, 5.5),
  ('CAD CAM Esprit', 0, 0),
  ('Capannone', 0, 0),
  ('Imu', 0, 0),
  ('Tari', 0, 0),
  ('Assicurazione', 0, 0),
  ('Pulizia', 0, 0),
  ('Manutenzione', 0, 0),
  ('Imprevisti', 0, 0)
ON CONFLICT (nome_strumento) DO NOTHING;

INSERT INTO manovalanza (nome, importo_mensile) VALUES
  ('Sebastiano', 1200.00)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO costi_utenze (tipo, fornitore, costo_fisso, costo_variabile, unita_misura, potenza_installata) VALUES
  ('elettricita', 'ASM Voghera', 0, 0.25, 'kWh', 100),
  ('acqua', 'Pavia Acque', 0, 2.50, 'm³', NULL),
  ('gas', 'ASM Voghera', 0, 0.85, 'm³', 3)
ON CONFLICT (tipo, fornitore) DO NOTHING;

INSERT INTO prezzi_materiali (tipo_materiale, prezzo_kg) VALUES
  ('Ferro S235 grezzo', 0.95),
  ('Acciaio inox AISI 304', 3.20),
  ('Alluminio 6060', 2.80),
  ('Acciaio al carbonio', 0.85)
ON CONFLICT (tipo_materiale) DO NOTHING;

-- Abilita RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE preventivi ENABLE ROW LEVEL SECURITY;
ALTER TABLE lavori ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiali_metallici ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiali_vari ENABLE ROW LEVEL SECURITY;
ALTER TABLE leasing_strumentali ENABLE ROW LEVEL SECURITY;
ALTER TABLE costi_utenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;
ALTER TABLE manovalanza ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimenti_contabili ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasse_iva ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy per users
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy generali per accesso autenticato
DROP POLICY IF EXISTS "Authenticated users can access clienti" ON clienti;
CREATE POLICY "Authenticated users can access clienti" ON clienti
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access preventivi" ON preventivi;
CREATE POLICY "Authenticated users can access preventivi" ON preventivi
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access lavori" ON lavori;
CREATE POLICY "Authenticated users can access lavori" ON lavori
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access materiali_metallici" ON materiali_metallici;
CREATE POLICY "Authenticated users can access materiali_metallici" ON materiali_metallici
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access materiali_vari" ON materiali_vari;
CREATE POLICY "Authenticated users can access materiali_vari" ON materiali_vari
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access leasing_strumentali" ON leasing_strumentali;
CREATE POLICY "Authenticated users can access leasing_strumentali" ON leasing_strumentali
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access costi_utenze" ON costi_utenze;
CREATE POLICY "Authenticated users can access costi_utenze" ON costi_utenze
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access prezzi_materiali" ON prezzi_materiali;
CREATE POLICY "Authenticated users can access prezzi_materiali" ON prezzi_materiali
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access manovalanza" ON manovalanza;
CREATE POLICY "Authenticated users can access manovalanza" ON manovalanza
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access movimenti_contabili" ON movimenti_contabili;
CREATE POLICY "Authenticated users can access movimenti_contabili" ON movimenti_contabili
  FOR ALL TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access tasse_iva" ON tasse_iva;
CREATE POLICY "Authenticated users can access tasse_iva" ON tasse_iva
  FOR ALL TO authenticated
  USING (true);

-- Policy per audit log (solo admin)
DROP POLICY IF EXISTS "Admins can read audit log" ON audit_log;
CREATE POLICY "Admins can read audit log" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.ruolo = 'alessandro'
    )
  );

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_preventivi_cliente_id ON preventivi(cliente_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_cliente_stato ON preventivi(cliente_id, stato);
CREATE INDEX IF NOT EXISTS idx_preventivi_stato ON preventivi(stato);
CREATE INDEX IF NOT EXISTS idx_preventivi_ditta ON preventivi(ditta);

CREATE INDEX IF NOT EXISTS idx_lavori_preventivo_id ON lavori(preventivo_id);
CREATE INDEX IF NOT EXISTS idx_lavori_stato ON lavori(stato);
CREATE INDEX IF NOT EXISTS idx_lavori_ditta ON lavori(ditta);
CREATE INDEX IF NOT EXISTS idx_lavori_ditta_stato ON lavori(ditta, stato);
CREATE INDEX IF NOT EXISTS idx_lavori_data_inizio ON lavori(data_inizio);
CREATE INDEX IF NOT EXISTS idx_lavori_data_fine ON lavori(data_fine);

CREATE INDEX IF NOT EXISTS idx_materiali_metallici_lavoro_id ON materiali_metallici(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_materiali_metallici_data_trasporto ON materiali_metallici(data_trasporto);

CREATE INDEX IF NOT EXISTS idx_materiali_vari_lavoro_id ON materiali_vari(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_materiali_vari_data_acquisto ON materiali_vari(data_acquisto);

CREATE INDEX IF NOT EXISTS idx_movimenti_contabili_lavoro_id ON movimenti_contabili(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_contabili_ditta ON movimenti_contabili(ditta);
CREATE INDEX IF NOT EXISTS idx_movimenti_contabili_data ON movimenti_contabili(data);
CREATE INDEX IF NOT EXISTS idx_movimenti_ditta_data ON movimenti_contabili(ditta, data);

CREATE INDEX IF NOT EXISTS idx_tasse_iva_ditta ON tasse_iva(ditta);
CREATE INDEX IF NOT EXISTS idx_tasse_iva_scadenza ON tasse_iva(data_scadenza);

-- Viste per join comuni
CREATE OR REPLACE VIEW preventivi_with_cliente AS
SELECT 
  p.*,
  c.nome as cliente_nome,
  c.email as cliente_email,
  c.telefono as cliente_telefono
FROM preventivi p
LEFT JOIN clienti c ON p.cliente_id = c.id;

CREATE OR REPLACE VIEW lavori_with_preventivo AS
SELECT 
  l.*,
  p.numero_preventivo,
  p.cliente_id,
  c.nome as cliente_nome
FROM lavori l
LEFT JOIN preventivi p ON l.preventivo_id = p.id
LEFT JOIN clienti c ON p.cliente_id = c.id;