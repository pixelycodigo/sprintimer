export interface Eliminado {
  id: number;
  item_id: number;
  item_tipo: string;
  eliminado_por: number;
  fecha_eliminacion: Date | string;
  fecha_borrado_permanente: Date | string;
  datos: Record<string, unknown>;
  dias_restantes?: number;
}

export interface EliminadoCreate {
  item_id: number;
  item_tipo: string;
  eliminado_por: number;
  fecha_eliminacion?: Date | string;
  fecha_borrado_permanente: Date | string;
  datos: Record<string, unknown>;
}

export interface EliminadoUpdate {
  item_id?: number;
  item_tipo?: string;
  eliminado_por?: number;
  fecha_borrado_permanente?: Date;
  datos?: Record<string, unknown>;
}
