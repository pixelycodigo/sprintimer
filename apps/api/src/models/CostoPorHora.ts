export interface CostoPorHora {
  id: number;
  tipo: 'fijo' | 'variable';
  costo_min: number | null;
  costo_max: number | null;
  costo_hora: number;
  divisa_id: number;
  perfil_id: number;
  seniority_id: number;
  concepto: string | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CostoPorHoraCreate {
  tipo: 'fijo' | 'variable';
  costo_min?: number | null;
  costo_max?: number | null;
  costo_hora: number;
  divisa_id: number;
  perfil_id: number;
  seniority_id: number;
  concepto?: string | null;
  activo?: boolean;
}

export interface CostoPorHoraUpdate {
  tipo?: 'fijo' | 'variable';
  costo_min?: number | null;
  costo_max?: number | null;
  costo_hora?: number;
  divisa_id?: number;
  perfil_id?: number;
  seniority_id?: number;
  concepto?: string | null;
  activo?: boolean;
}

export interface CostoPorHoraWithDetails extends CostoPorHora {
  divisa_codigo?: string;
  divisa_simbolo?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
}
