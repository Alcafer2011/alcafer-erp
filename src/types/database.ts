export interface Cliente {
  id: string;
  nome: string;
  email: string;
  created_at?: string;
}

export interface Preventivo {
  id: string;
  cliente_id?: string;
  file_path?: string;
  importo?: number;
  stato?: string;
  cliente?: Cliente;
}