export interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  ruolo: 'alessandro' | 'gabriel' | 'hanna';
  created_at?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono?: string;
  indirizzo?: string;
  codice_fiscale?: string;
  partita_iva?: string;
  created_at?: string;
}

export interface Preventivo {
  id: string;
  cliente_id?: string;
  numero_preventivo: string;
  descrizione: string;
  importo?: number;
  stato: 'bozza' | 'inviato' | 'accettato' | 'rifiutato';
  file_path?: string;
  data_creazione: string;
  data_scadenza?: string;
  note?: string;
  cliente?: Cliente;
  ditta: 'alcafer' | 'gabifer';
}

export interface Lavoro {
  id: string;
  preventivo_id?: string;
  numero_lavoro: string;
  descrizione: string;
  importo_totale: number;
  acconto_percentuale: number;
  acconto_importo: number;
  acconto_modalita: 'alcafer' | 'gabifer' | 'diretto';
  stato: 'in_attesa' | 'in_produzione' | 'completato';
  data_inizio?: string;
  data_fine?: string;
  ore_lavoro?: number;
  macchinari_utilizzati?: string[];
  ore_per_macchinario?: Record<string, number>;
  ditta: 'alcafer' | 'gabifer';
  accordo_gabifer?: 'orario' | 'tantum';
  importo_accordo_gabifer?: number;
  created_at: string;
}

export interface MaterialeMetallico {
  id: string;
  lavoro_id: string;
  tipo_materiale: string;
  kg_totali: number;
  prezzo_kg: number;
  importo_totale: number;
  numero_ddt: string;
  data_trasporto: string;
  fornitore?: string;
}

export interface MaterialeVario {
  id: string;
  lavoro_id: string;
  tipo_materiale: string;
  quantita: number;
  prezzo_unitario: number;
  importo_totale: number;
  data_acquisto: string;
}

export interface LeasingStrumentale {
  id: string;
  nome_strumento: string;
  rata_mensile: number;
  consumo_kw?: number;
  attivo: boolean;
}

export interface CostoUtenza {
  id: string;
  tipo: 'elettricita' | 'acqua' | 'gas';
  fornitore: string;
  costo_fisso: number;
  costo_variabile: number;
  unita_misura: string;
  data_aggiornamento: string;
  potenza_installata?: number;
}

export interface PrezzoMateriale {
  id: string;
  tipo_materiale: string;
  prezzo_kg: number;
  data_aggiornamento: string;
  fonte?: string;
}

export interface Manovalanza {
  id: string;
  nome: string;
  importo_mensile: number;
  attivo: boolean;
}

export interface MovimentoContabile {
  id: string;
  lavoro_id?: string;
  tipo: 'entrata' | 'uscita';
  importo: number;
  descrizione: string;
  data: string;
  ditta: 'alcafer' | 'gabifer';
  categoria: string;
}

export interface TasseIva {
  id: string;
  ditta: 'alcafer' | 'gabifer';
  periodo: string;
  iva_da_versare: number;
  tasse_da_versare: number;
  data_scadenza: string;
  pagato: boolean;
}

export interface Fornitore {
  id: string;
  nome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  tipo_fornitore: string;
  settore_merceologico?: string;
  condizioni_pagamento?: string;
  sconto_standard?: number;
  valutazione?: number;
  note?: string;
  attivo: boolean;
  created_at?: string;
  updated_at?: string;
}