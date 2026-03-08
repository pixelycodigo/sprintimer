export interface Proyecto {
  id: number;
  cliente_id: number;
  nombre: string;
  descripcion: string | null;
  modalidad: 'sprint' | 'ad-hoc';
  formato_horas: 'minutos' | 'cuartiles' | 'sin_horas';
  moneda_id: number | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProyectoCreate {
  cliente_id: number;
  nombre: string;
  descripcion?: string | null;
  modalidad: 'sprint' | 'ad-hoc';
  formato_horas: 'minutos' | 'cuartiles' | 'sin_horas';
  moneda_id?: number | null;
  activo?: boolean;
}

export interface ProyectoUpdate {
  cliente_id?: number;
  nombre?: string;
  descripcion?: string | null;
  modalidad?: 'sprint' | 'ad-hoc';
  formato_horas?: 'minutos' | 'cuartiles' | 'sin_horas';
  moneda_id?: number | null;
  activo?: boolean;
}
