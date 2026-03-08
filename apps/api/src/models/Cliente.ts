export interface Cliente {
  id: number;
  nombre_cliente: string;
  cargo: string | null;
  empresa: string;
  email: string;
  celular: string | null;
  telefono: string | null;
  anexo: string | null;
  pais: string | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ClienteCreate {
  nombre_cliente: string;
  cargo?: string | null;
  empresa: string;
  email: string;
  celular?: string | null;
  telefono?: string | null;
  anexo?: string | null;
  pais?: string | null;
  activo?: boolean;
}

export interface ClienteUpdate {
  nombre_cliente?: string;
  cargo?: string | null;
  empresa?: string;
  email?: string;
  celular?: string | null;
  telefono?: string | null;
  anexo?: string | null;
  pais?: string | null;
  activo?: boolean;
}
