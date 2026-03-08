export interface Perfil {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: Date;
}

export interface PerfilCreate {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface PerfilUpdate {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}
