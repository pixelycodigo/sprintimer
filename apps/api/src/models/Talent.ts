export interface Talent {
  id: number;
  usuario_id: number | null;
  perfil_id: number;
  seniority_id: number;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  costo_hora_fijo: number | null;
  costo_hora_variable_min: number | null;
  costo_hora_variable_max: number | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TalentCreate {
  usuario_id?: number | null;
  perfil_id: number;
  seniority_id: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  password_hash?: string;
  costo_hora_fijo?: number | null;
  costo_hora_variable_min?: number | null;
  costo_hora_variable_max?: number | null;
  activo?: boolean;
}

export interface TalentUpdate {
  usuario_id?: number | null;
  perfil_id?: number;
  seniority_id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  password_hash?: string;
  costo_hora_fijo?: number | null;
  costo_hora_variable_min?: number | null;
  costo_hora_variable_max?: number | null;
  activo?: boolean;
}

export interface TalentWithDetails extends Talent {
  perfil_nombre?: string;
  seniority_nombre?: string;
}
