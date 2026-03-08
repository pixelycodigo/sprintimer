export interface Seniority {
  id: number;
  nombre: string;
  nivel_orden: number;
  activo: boolean;
}

export interface SeniorityCreate {
  nombre: string;
  nivel_orden: number;
  activo?: boolean;
}

export interface SeniorityUpdate {
  nombre?: string;
  nivel_orden?: number;
  activo?: boolean;
}
