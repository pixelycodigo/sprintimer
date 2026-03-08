export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  password_hash: string;
  rol_id: number;
  rol?: string;
  avatar?: string;
  email_verificado: boolean;
  activo: boolean;
  ultimo_login?: Date;
  creado_por?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioCreate {
  nombre: string;
  usuario: string;
  email: string;
  password_hash: string;
  rol_id: number;
  avatar?: string;
  email_verificado?: boolean;
  activo?: boolean;
  creado_por?: number;
}

export interface UsuarioUpdate {
  nombre?: string;
  email?: string;
  avatar?: string;
  email_verificado?: boolean;
  activo?: boolean;
  ultimo_login?: Date;
}
