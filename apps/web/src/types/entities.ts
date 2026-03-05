export interface Usuario {
  id: number;
  nombre_completo: string;
  usuario: string;
  email: string;
  rol_id: number;
  rol: string;
  avatar?: string;
  email_verificado: boolean;
  activo: boolean;
  ultimo_login?: string;
  creado_por?: number;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  nombre_cliente: string;
  cargo?: string;
  empresa: string;
  email: string;
  celular?: string;
  telefono?: string;
  anexo?: string;
  pais?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Talent {
  id: number;
  usuario_id?: number;
  perfil_id: number;
  seniority_id: number;
  nombre_completo: string;
  apellido: string;
  email: string;
  costo_hora_fijo?: number;
  costo_hora_variable_min?: number;
  costo_hora_variable_max?: number;
  activo: boolean;
  perfil?: Perfil;
  seniority?: Seniority;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
}

export interface Seniority {
  id: number;
  nombre: string;
  nivel_orden: number;
  activo: boolean;
}

export interface Divisa {
  id: number;
  codigo: string;
  simbolo: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export interface CostoPorHora {
  id: number;
  tipo: 'fijo' | 'variable';
  costo_min?: number;
  costo_max?: number;
  costo_hora: number;
  divisa_id: number;
  perfil_id: number;
  seniority_id: number;
  concepto?: string;
  activo: boolean;
  divisa?: Divisa;
  perfil?: Perfil;
  seniority?: Seniority;
  created_at: string;
  updated_at: string;
}

export interface Proyecto {
  id: number;
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  modalidad: 'sprint' | 'ad-hoc';
  formato_horas: 'minutos' | 'cuartiles' | 'sin_horas';
  moneda_id?: number;
  activo: boolean;
  cliente?: Cliente;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: number;
  proyecto_id: number;
  nombre: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo: boolean;
}

export interface Actividad {
  id: number;
  proyecto_id: number;
  sprint_id?: number;
  nombre: string;
  descripcion?: string;
  horas_estimadas: number;
  activo: boolean;
  proyecto?: Proyecto;
  sprint?: Sprint;
  talentes_asignados?: number;
  created_at: string;
  updated_at: string;
}

export interface Asignacion {
  id: number;
  actividad_id: number;
  talent_id: number;
  fecha_asignacion: string;
  actividad?: Actividad;
  talent?: Talent;
}

export interface Tarea {
  id: number;
  actividad_id: number;
  talent_id: number;
  nombre: string;
  descripcion?: string;
  horas_registradas: number;
  completado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Eliminado {
  id: number;
  item_id: number;
  item_tipo: string;
  eliminado_por: number;
  fecha_eliminacion: string;
  fecha_borrado_permanente: string;
  datos: Record<string, unknown>;
  dias_restantes: number;
}
