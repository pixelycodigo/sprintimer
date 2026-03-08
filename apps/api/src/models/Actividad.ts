export interface Actividad {
  id: number;
  proyecto_id: number;
  sprint_id: number | null;
  nombre: string;
  descripcion: string | null;
  horas_estimadas: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ActividadCreate {
  proyecto_id: number;
  sprint_id?: number | null;
  nombre: string;
  descripcion?: string | null;
  horas_estimadas: number;
  activo?: boolean;
}

export interface ActividadUpdate {
  proyecto_id?: number;
  sprint_id?: number | null;
  nombre?: string;
  descripcion?: string | null;
  horas_estimadas?: number;
  activo?: boolean;
}

export interface ActividadWithDetails extends Actividad {
  proyecto_nombre?: string;
  sprint_nombre?: string;
}
