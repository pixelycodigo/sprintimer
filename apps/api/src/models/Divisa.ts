export interface Divisa {
  id: number;
  codigo: string;
  simbolo: string;
  nombre: string;
  activo: boolean;
  created_at: Date;
}

export interface DivisaCreate {
  codigo: string;
  simbolo: string;
  nombre: string;
  activo?: boolean;
}

export interface DivisaUpdate {
  codigo?: string;
  simbolo?: string;
  nombre?: string;
  activo?: boolean;
}
