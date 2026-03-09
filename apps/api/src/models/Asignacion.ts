export interface Asignacion {
  id: number;
  actividad_id: number;
  talent_id: number;
  fecha_asignacion: Date;
}

export interface AsignacionCreate {
  actividad_id: number;
  talent_id: number;
}

export interface AsignacionUpdate {
  actividad_id?: number;
  talent_id?: number;
}

export interface AsignacionWithDetails extends Asignacion {
  actividad_nombre?: string;
  talent_nombre?: string;
  talent_email?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
}
