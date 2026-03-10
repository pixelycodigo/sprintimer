export interface Asignacion {
  id: number;
  actividad_id: number;
  talent_id: number;
  fecha_asignacion: Date;
  activo?: boolean;
}

export interface AsignacionCreate {
  actividad_id: number;
  talent_id: number;
  activo?: boolean;
}

export interface AsignacionUpdate {
  actividad_id?: number;
  talent_id?: number;
  activo?: boolean;
}

export interface AsignacionWithDetails extends Asignacion {
  actividad_nombre?: string;
  talent_nombre?: string;
  talent_email?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
  proyecto_nombre?: string;
}
