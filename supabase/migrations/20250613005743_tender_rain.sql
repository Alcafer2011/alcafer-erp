/*
  # Complete Database Schema Setup

  1. New Tables
    - `users` - User profiles with roles
    - `clienti` - Customer management
    - `preventivi` - Quote management
    - `lavori` - Job management
    - `materiali_metallici` - Metal materials tracking
    - `materiali_vari` - Various materials tracking
    - `leasing_strumentali` - Equipment leasing costs
    - `costi_utenze` - Utility costs
    - `prezzi_materiali` - Material prices
    - `manovalanza` - Labor costs
    - `movimenti_contabili` - Accounting movements
    - `tasse_iva` - Tax and VAT management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - User role-based access control

  3. Features
    - Auto-generated quote and job numbers
    - Automatic calculation of totals
    - Performance indexes
    - Initial data population
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  cognome text NOT NULL,
  data_nascita date NOT NULL,
  ruolo text NOT NULL CHECK (ruolo IN ('alessandro', 'gabriel', 'hanna')),
  created_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clienti (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  indirizzo text,
  created_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS preventivi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id uuid REFERENCES clienti(id) ON DELETE SET NULL,
  numero_preventivo text UNIQUE NOT NULL,
  descrizione text NOT NULL,
  importo numeric(12,2),
  stato text NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'inviato', 'accettato', 'rifiutato')),
  file_path text,
  data_creazione date NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza date,
  note text,
  ditta text NOT NULL CHECK (ditta IN ('alcafer', 'gabifer')),
  created_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS lavori (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  preventivo_id uuid REFERENCES preventivi(id) ON DELETE SET NULL,
  numero_lavoro text UNIQUE NOT NULL,
  descrizione text NOT NULL,
  importo_totale numeric(12,2) NOT NULL,
  acconto_percentuale numeric(5,2) DEFAULT 50.00,
  acconto_importo numeric(12,2),
  acconto_modalita text NOT NULL CHECK (acconto_modalita IN ('alcafer', 'gabifer', 'diretto')),
  stato text NOT NULL DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa', 'in_produzione', 'completato')),
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

-- Metal materials table
CREATE TABLE IF NOT EXISTS materiali_metallici (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lavoro_id uuid NOT NULL REFERENCES lavori(id) ON DELETE CASCADE,
  tipo_materiale text NOT NULL,
  kg_totali numeric(10,3) NOT NULL,
  prezzo_kg numeric(8,3) NOT NULL,
  importo_totale numeric(12,2) GENERATED ALWAYS AS (kg_totali * prezzo_kg) STORED,
  numero_ddt text NOT NULL,
  data_trasporto date NOT NULL,
  fornitore text,
  created_at timestamptz DEFAULT now()
);

-- Various materials table
CREATE TABLE IF NOT EXISTS materiali_vari (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lavoro_id uuid REFERENCES lavori(id) ON DELETE CASCADE,
  tipo_materiale text NOT NULL,
  quantita numeric(10,2) NOT NULL DEFAULT 0,
  prezzo_unitario numeric(10,2) NOT NULL DEFAULT 0,
  importo_totale numeric(12,2) GENERATED ALWAYS AS (quantita * prezzo_unitario) STORED,
  data_acquisto date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Equipment leasing table
CREATE TABLE IF NOT EXISTS leasing_strumentali (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_strumento text UNIQUE NOT NULL,
  rata_mensile numeric(10,2) NOT NULL DEFAULT 0,
  consumo_kw numeric(8,3),
  attivo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Utility costs table
CREATE TABLE IF NOT EXISTS costi_utenze (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo text NOT NULL CHECK (tipo IN ('elettricita', 'acqua', 'gas')),
  fornitore text NOT NULL,
  costo_fisso numeric(10,2) NOT NULL DEFAULT 0,
  costo_variabile numeric(8,4) NOT NULL DEFAULT 0,
  unita_misura text NOT NULL,
  data_aggiornamento date DEFAULT CURRENT_DATE,
  potenza_installata numeric(8,2),
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to utility costs
ALTER TABLE costi_utenze ADD CONSTRAINT costi_utenze_tipo_fornitore_key UNIQUE (tipo, fornitore);

-- Material prices table
CREATE TABLE IF NOT EXISTS prezzi_materiali (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_materiale text UNIQUE NOT NULL,
  prezzo_kg numeric(8,3) NOT NULL,
  data_aggiornamento date DEFAULT CURRENT_DATE,
  fonte text,
  created_at timestamptz DEFAULT now()
);

-- Labor costs table
CREATE TABLE IF NOT EXISTS manovalanza (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text UNIQUE NOT NULL,
  importo_mensile numeric(10,2) NOT NULL DEFAULT 0,
  attivo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Accounting movements table
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

-- Taxes and VAT table
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

-- Insert initial data for equipment leasing
DO $$
BEGIN
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
END $$;

-- Insert initial data for labor
DO $$
BEGIN
  INSERT INTO manovalanza (nome, importo_mensile) VALUES
    ('Sebastiano', 1200.00)
  ON CONFLICT (nome) DO NOTHING;
END $$;

-- Insert initial data for utility costs
DO $$
BEGIN
  INSERT INTO costi_utenze (tipo, fornitore, costo_fisso, costo_variabile, unita_misura, potenza_installata) VALUES
    ('elettricita', 'ASM Voghera', 0, 0.25, 'kWh', 100),
    ('acqua', 'Pavia Acque', 0, 2.50, 'm³', NULL),
    ('gas', 'ASM Voghera', 0, 0.85, 'm³', 3)
  ON CONFLICT (tipo, fornitore) DO NOTHING;
END $$;

-- Insert initial data for material prices
DO $$
BEGIN
  INSERT INTO prezzi_materiali (tipo_materiale, prezzo_kg) VALUES
    ('Ferro S235 grezzo', 0.95),
    ('Acciaio inox AISI 304', 3.20),
    ('Alluminio 6060', 2.80),
    ('Acciaio al carbonio', 0.85)
  ON CONFLICT (tipo_materiale) DO NOTHING;
END $$;

-- Enable RLS on all tables
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

-- User policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- General policies for authenticated access
CREATE POLICY "Authenticated users can access clienti" ON clienti
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access preventivi" ON preventivi
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access lavori" ON lavori
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access materiali_metallici" ON materiali_metallici
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access materiali_vari" ON materiali_vari
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access leasing_strumentali" ON leasing_strumentali
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access costi_utenze" ON costi_utenze
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access prezzi_materiali" ON prezzi_materiali
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access manovalanza" ON manovalanza
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access movimenti_contabili" ON movimenti_contabili
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access tasse_iva" ON tasse_iva
  FOR ALL TO authenticated
  USING (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_preventivi_cliente_id ON preventivi(cliente_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_stato ON preventivi(stato);
CREATE INDEX IF NOT EXISTS idx_preventivi_ditta ON preventivi(ditta);
CREATE INDEX IF NOT EXISTS idx_lavori_preventivo_id ON lavori(preventivo_id);
CREATE INDEX IF NOT EXISTS idx_lavori_stato ON lavori(stato);
CREATE INDEX IF NOT EXISTS idx_lavori_ditta ON lavori(ditta);
CREATE INDEX IF NOT EXISTS idx_materiali_metallici_lavoro_id ON materiali_metallici(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_materiali_vari_lavoro_id ON materiali_vari(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_contabili_lavoro_id ON movimenti_contabili(lavoro_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_contabili_ditta ON movimenti_contabili(ditta);
CREATE INDEX IF NOT EXISTS idx_tasse_iva_ditta ON tasse_iva(ditta);
CREATE INDEX IF NOT EXISTS idx_tasse_iva_scadenza ON tasse_iva(data_scadenza);

-- Function to update advance payment amount
CREATE OR REPLACE FUNCTION update_acconto_importo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.acconto_importo = NEW.importo_totale * (NEW.acconto_percentuale / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for advance payment calculation
CREATE TRIGGER trigger_update_acconto_importo
  BEFORE INSERT OR UPDATE ON lavori
  FOR EACH ROW
  EXECUTE FUNCTION update_acconto_importo();

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_numero_preventivo()
RETURNS TRIGGER AS $$
DECLARE
  anno text;
  counter integer;
  new_numero text;
BEGIN
  anno := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_preventivo, '/', 1) AS integer)), 0) + 1
  INTO counter
  FROM preventivi
  WHERE numero_preventivo LIKE '%/' || anno;
  
  new_numero := LPAD(counter::text, 4, '0') || '/' || anno;
  NEW.numero_preventivo := new_numero;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quote number generation
CREATE TRIGGER trigger_generate_numero_preventivo
  BEFORE INSERT ON preventivi
  FOR EACH ROW
  WHEN (NEW.numero_preventivo IS NULL OR NEW.numero_preventivo = '')
  EXECUTE FUNCTION generate_numero_preventivo();

-- Function to generate job number
CREATE OR REPLACE FUNCTION generate_numero_lavoro()
RETURNS TRIGGER AS $$
DECLARE
  anno text;
  counter integer;
  new_numero text;
BEGIN
  anno := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_lavoro, '/', 1) AS integer)), 0) + 1
  INTO counter
  FROM lavori
  WHERE numero_lavoro LIKE '%/' || anno;
  
  new_numero := LPAD(counter::text, 4, '0') || '/' || anno;
  NEW.numero_lavoro := new_numero;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job number generation
CREATE TRIGGER trigger_generate_numero_lavoro
  BEFORE INSERT ON lavori
  FOR EACH ROW
  WHEN (NEW.numero_lavoro IS NULL OR NEW.numero_lavoro = '')
  EXECUTE FUNCTION generate_numero_lavoro();